import pytest
import uuid
from app.models.sport import Sport

def get_auth_headers(client, email, password, full_name, role):
    r = client.post("/auth/register", json={
        "email": email,
        "password": password,
        "full_name": full_name,
        "role": role
    })
    assert r.status_code == 201

    r = client.post("/auth/login", json={
        "email": email,
        "password": password
    })
    assert r.status_code == 200
    token = r.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}

def test_crear_partido_y_restriccion_permisos(client):
    orga1_headers = get_auth_headers(
        client, "orga_partido1@example.com", "pass123", "Organizador Partido 1", "organizer"
    )
    orga2_headers = get_auth_headers(
        client, "orga_partido2@example.com", "pass123", "Organizador Partido 2", "organizer"
    )

    # 1. Crear torneo
    torneo = client.post("/torneos/", json={
        "nombre": "Liga de Partidos 2026",
        "categoria": "varonil",
        "sport_id": str(uuid.uuid4())
    }, headers=orga1_headers).json()
    torneo_id = torneo["id"]

    # 2. Crear equipos
    eq1 = client.post("/equipos/", json={"nombre": "Tigres FC", "datos_adicionales": {"tipo_equipo": "varonil"}}, headers=orga1_headers).json()
    eq2 = client.post("/equipos/", json={"nombre": "Rayados FC", "datos_adicionales": {"tipo_equipo": "varonil"}}, headers=orga1_headers).json()
    eq3_no_inscrito = client.post("/equipos/", json={"nombre": "Pumas FC", "datos_adicionales": {"tipo_equipo": "varonil"}}, headers=orga1_headers).json()

    # 3. Inscribir eq1 y eq2
    client.post(f"/torneos/{torneo_id}/inscripciones", json={"equipo_id": eq1["id"]}, headers=orga1_headers)
    client.post(f"/torneos/{torneo_id}/inscripciones", json={"equipo_id": eq2["id"]}, headers=orga1_headers)

    # 4. Intentar crear partido con equipo no inscrito -> 400
    res_err = client.post("/partidos/", json={
        "torneo_id": torneo_id,
        "equipo_local_id": eq1["id"],
        "equipo_visitante_id": eq3_no_inscrito["id"]
    }, headers=orga1_headers)
    assert res_err.status_code == 400
    assert "no está inscrito" in res_err.json()["detail"]

    # 5. Intentar crear partido por Orga 2 -> 403
    res_403 = client.post("/partidos/", json={
        "torneo_id": torneo_id,
        "equipo_local_id": eq1["id"],
        "equipo_visitante_id": eq2["id"]
    }, headers=orga2_headers)
    assert res_403.status_code == 403

    # 6. Orga 1 crea partido de forma exitosa -> 201
    res_ok = client.post("/partidos/", json={
        "torneo_id": torneo_id,
        "equipo_local_id": eq1["id"],
        "equipo_visitante_id": eq2["id"]
    }, headers=orga1_headers)
    assert res_ok.status_code == 201
    partido = res_ok.json()
    assert partido["equipo_local_id"] == eq1["id"]
    assert partido["equipo_visitante_id"] == eq2["id"]

def test_generar_fixture_automatico(client):
    orga_headers = get_auth_headers(
        client, "orga_fixture@example.com", "pass123", "Organizador Fixture", "organizer"
    )

    # 1. Crear torneo
    torneo = client.post("/torneos/", json={
        "nombre": "Liga Automática",
        "categoria": "mixto",
        "sport_id": str(uuid.uuid4())
    }, headers=orga_headers).json()
    torneo_id = torneo["id"]

    # 2. Crear e inscribir 4 equipos
    equipos_ids = []
    for i in range(1, 5):
        eq = client.post("/equipos/", json={"nombre": f"Equipo {i}", "datos_adicionales": {"tipo_equipo": "mixto"}}, headers=orga_headers).json()
        equipos_ids.append(eq["id"])
        client.post(f"/torneos/{torneo_id}/inscripciones", json={"equipo_id": eq["id"]}, headers=orga_headers)

    # 3. Generar fixture automáticamente
    res_fix = client.post(f"/torneos/{torneo_id}/generar_fixture", headers=orga_headers)
    assert res_fix.status_code == 201
    partidos = res_fix.json()

    # 4 equipos = 3 jornadas x 2 partidos por jornada = 6 partidos en total
    assert len(partidos) == 6

    # Verificar que se puedan listar
    res_list = client.get(f"/torneos/{torneo_id}/partidos")
    assert res_list.status_code == 200
    assert len(res_list.json()) == 6

def test_asignar_encargado_partido(client):
    orga_headers = get_auth_headers(
        client, "orga_encargado@example.com", "pass123", "Orga Encargado", "organizer"
    )

    torneo = client.post("/torneos/", json={
        "nombre": "Liga Encargados",
        "categoria": "varonil",
        "sport_id": str(uuid.uuid4())
    }, headers=orga_headers).json()
    torneo_id = torneo["id"]

    eq1 = client.post("/equipos/", json={"nombre": "Alfa", "datos_adicionales": {"tipo_equipo": "varonil"}}, headers=orga_headers).json()
    eq2 = client.post("/equipos/", json={"nombre": "Beta", "datos_adicionales": {"tipo_equipo": "varonil"}}, headers=orga_headers).json()

    client.post(f"/torneos/{torneo_id}/inscripciones", json={"equipo_id": eq1["id"]}, headers=orga_headers)
    client.post(f"/torneos/{torneo_id}/inscripciones", json={"equipo_id": eq2["id"]}, headers=orga_headers)

    partido = client.post("/partidos/", json={
        "torneo_id": torneo_id,
        "equipo_local_id": eq1["id"],
        "equipo_visitante_id": eq2["id"]
    }, headers=orga_headers).json()

    # Registrar usuario que actuará como encargado
    manager_headers = get_auth_headers(
        client, "arbitro1@example.com", "pass123", "Árbitro Uno", "player"
    )
    # Obtener el user_id del login / me o decodificar token. En testclient register podemos hacer GET me o similar.
    # Vamos a crear otro participante/usuario para asignar su id.
    me = client.get("/auth/me", headers=manager_headers).json()
    manager_id = me["id"]

    res_patch = client.patch(
        f"/partidos/{partido['id']}/encargado",
        json={"match_manager_id": manager_id},
        headers=orga_headers
    )
    assert res_patch.status_code == 200
    assert res_patch.json()["match_manager_id"] == manager_id
