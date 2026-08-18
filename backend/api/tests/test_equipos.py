import pytest


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


def test_crear_equipo_como_player(client):
    headers = get_auth_headers(
        client,
        "player_equipo@example.com",
        "pass123",
        "Player Equipo",
        "player"
    )
    datos_equipo = {
        "nombre": "Toros FC Test",
        "color": "#991b1b",
        "datos_adicionales": {
            "tipo_equipo": "varonil",
            "sport_nombre": "Fútbol"
        }
    }
    r = client.post("/equipos/", json=datos_equipo, headers=headers)
    assert r.status_code == 201
    body = r.json()
    assert body["nombre"] == "Toros FC Test"
    assert body["color"] == "#991b1b"
    assert body["datos_adicionales"]["tipo_equipo"] == "varonil"


def test_listar_equipos(client):
    r = client.get("/equipos/")
    assert r.status_code == 200
    assert isinstance(r.json(), list)


def test_crear_equipo_requiere_autenticacion(client):
    r = client.post("/equipos/", json={
        "nombre": "Sin Auth FC",
        "color": "#000000"
    })
    assert r.status_code == 401


def test_crear_equipo_nombre_invalido(client):
    headers = get_auth_headers(
        client,
        "orga_eq_invalido@example.com",
        "pass123",
        "Orga Invalido",
        "organizer"
    )
    # Nombre de menos de 3 caracteres debe devolver 422
    r = client.post("/equipos/", json={
        "nombre": "AB",
        "color": "#111111"
    }, headers=headers)
    assert r.status_code == 422


def test_eliminar_equipo_como_player_devuelve_403(client):
    # Un ORGANIZER crea el equipo
    orga_headers = get_auth_headers(
        client,
        "orga_del@example.com",
        "pass123",
        "Orga Delete",
        "organizer"
    )
    r = client.post("/equipos/", json={
        "nombre": "Equipo Borrable",
        "color": "#222222"
    }, headers=orga_headers)
    assert r.status_code == 201
    equipo_id = r.json()["id"]

    # Un PLAYER intenta eliminarlo — debe fallar con 403
    player_headers = get_auth_headers(
        client,
        "player_del@example.com",
        "pass123",
        "Player Delete",
        "player"
    )
    r = client.delete(f"/equipos/{equipo_id}", headers=player_headers)
    assert r.status_code == 403


def test_actualizar_equipo_como_player_devuelve_403(client):
    orga_headers = get_auth_headers(
        client,
        "orga_upd@example.com",
        "pass123",
        "Orga Update",
        "organizer"
    )
    r = client.post("/equipos/", json={
        "nombre": "Equipo Actualizable",
        "color": "#333333"
    }, headers=orga_headers)
    assert r.status_code == 201
    equipo_id = r.json()["id"]

    # Un PLAYER intenta editarlo — debe fallar con 403
    player_headers = get_auth_headers(
        client,
        "player_upd@example.com",
        "pass123",
        "Player Update",
        "player"
    )
    r = client.put(f"/equipos/{equipo_id}", json={
        "nombre": "Equipo Hackeado"
    }, headers=player_headers)
    assert r.status_code == 403


def test_organizer_puede_eliminar_equipo(client):
    orga_headers = get_auth_headers(
        client,
        "orga_ok_del@example.com",
        "pass123",
        "Orga OK Delete",
        "organizer"
    )
    r = client.post("/equipos/", json={
        "nombre": "Equipo Temporal",
        "color": "#444444"
    }, headers=orga_headers)
    assert r.status_code == 201
    equipo_id = r.json()["id"]

    r = client.delete(f"/equipos/{equipo_id}", headers=orga_headers)
    assert r.status_code == 204
