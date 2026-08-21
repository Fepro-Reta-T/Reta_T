import pytest
import uuid


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


def test_crear_torneo_y_restriccion_ownership(client):
    orga1_headers = get_auth_headers(
        client,
        "orga_torneo1@example.com",
        "pass123",
        "Organizador 1",
        "organizer"
    )
    orga2_headers = get_auth_headers(
        client,
        "orga_torneo2@example.com",
        "pass123",
        "Organizador 2",
        "organizer"
    )
    admin_headers = get_auth_headers(
        client,
        "admin_torneo@example.com",
        "pass123",
        "Admin Torneo",
        "admin"
    )

    # Orga 1 crea torneo
    datos_torneo = {
        "nombre": "Liga Primavera 2026",
        "categoria": "varonil",
        "sport_id": str(uuid.uuid4())
    }
    r = client.post("/torneos/", json=datos_torneo, headers=orga1_headers)
    assert r.status_code == 201
    torneo_id = r.json()["id"]
    assert r.json()["nombre"] == "Liga Primavera 2026"

    # Orga 2 intenta modificar el torneo de Orga 1 -> 403 Forbidden
    r_put_orga2 = client.put(f"/torneos/{torneo_id}", json={
        "nombre": "Liga Hackeada"
    }, headers=orga2_headers)
    assert r_put_orga2.status_code == 403

    # Orga 2 intenta borrar el torneo de Orga 1 -> 403 Forbidden
    r_del_orga2 = client.delete(f"/torneos/{torneo_id}", headers=orga2_headers)
    assert r_del_orga2.status_code == 403

    # Orga 1 (creador) puede modificar su torneo -> 200 OK
    r_put_orga1 = client.put(f"/torneos/{torneo_id}", json={
        "nombre": "Liga Primavera 2026 - Actualizada"
    }, headers=orga1_headers)
    assert r_put_orga1.status_code == 200
    assert r_put_orga1.json()["nombre"] == "Liga Primavera 2026 - Actualizada"

    # Admin puede eliminar cualquier torneo -> 204 No Content
    r_del_admin = client.delete(f"/torneos/{torneo_id}", headers=admin_headers)
    assert r_del_admin.status_code == 204


def test_inscripciones_torneo_solo_por_organizador_creador(client):
    orga1_headers = get_auth_headers(
        client,
        "orga_insc1@example.com",
        "pass123",
        "Orga Insc 1",
        "organizer"
    )
    orga2_headers = get_auth_headers(
        client,
        "orga_insc2@example.com",
        "pass123",
        "Orga Insc 2",
        "organizer"
    )

    # Orga 1 crea torneo
    torneo = client.post("/torneos/", json={
        "nombre": "Copa Verano",
        "categoria": "femenil",
        "sport_id": str(uuid.uuid4())
    }, headers=orga1_headers).json()
    torneo_id = torneo["id"]

    # Orga 1 crea equipo
    equipo = client.post("/equipos/", json={
        "nombre": "Equipo Inscribible",
        "color": "#123456",
        "datos_adicionales": {"tipo_equipo": "femenil"}
    }, headers=orga1_headers).json()
    equipo_id = equipo["id"]

    # Orga 2 intenta inscribir equipo al torneo de Orga 1 -> 403
    r_insc_orga2 = client.post(
        f"/torneos/{torneo_id}/inscripciones?equipo_id={equipo_id}",
        headers=orga2_headers
    )
    assert r_insc_orga2.status_code == 403

    # Orga 1 inscribe equipo -> 201
    r_insc_orga1 = client.post(
        f"/torneos/{torneo_id}/inscripciones?equipo_id={equipo_id}",
        headers=orga1_headers
    )
    assert r_insc_orga1.status_code == 201

    # Listar equipos inscritos
    r_list = client.get(f"/torneos/{torneo_id}/equipos")
    assert r_list.status_code == 200
    assert len(r_list.json()) == 1

    # Orga 2 intenta retirar equipo -> 403
    r_ret_orga2 = client.delete(
        f"/torneos/{torneo_id}/inscripciones/{equipo_id}",
        headers=orga2_headers
    )
    assert r_ret_orga2.status_code == 403

    # Orga 1 retira equipo -> 204
    r_ret_orga1 = client.delete(
        f"/torneos/{torneo_id}/inscripciones/{equipo_id}",
        headers=orga1_headers
    )
    assert r_ret_orga1.status_code == 204
