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
    assert body["creator_id"] is not None
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
    r = client.post("/equipos/", json={
        "nombre": "AB",
        "color": "#111111"
    }, headers=headers)
    assert r.status_code == 422


def test_otro_usuario_no_puede_modificar_ni_eliminar_equipo(client):
    # Creador original crea el equipo
    creador_headers = get_auth_headers(
        client,
        "creador_eq@example.com",
        "pass123",
        "Creador Equipo",
        "organizer"
    )
    r = client.post("/equipos/", json={
        "nombre": "Equipo Privado",
        "color": "#222222"
    }, headers=creador_headers)
    assert r.status_code == 201
    equipo_id = r.json()["id"]

    # Otro usuario (incluso con rol organizer) intenta editarlo -> 403
    otro_headers = get_auth_headers(
        client,
        "otro_orga@example.com",
        "pass123",
        "Otro Orga",
        "organizer"
    )
    r_put = client.put(f"/equipos/{equipo_id}", json={
        "nombre": "Equipo Hackeado"
    }, headers=otro_headers)
    assert r_put.status_code == 403

    # Otro usuario intenta eliminarlo -> 403
    r_del = client.delete(f"/equipos/{equipo_id}", headers=otro_headers)
    assert r_del.status_code == 403


def test_creador_y_admin_pueden_modificar_y_eliminar_equipo(client):
    # Creador crea equipo
    creador_headers = get_auth_headers(
        client,
        "creador_owner@example.com",
        "pass123",
        "Owner Equipo",
        "player"
    )
    r = client.post("/equipos/", json={
        "nombre": "Equipo Owner",
        "color": "#444444"
    }, headers=creador_headers)
    assert r.status_code == 201
    equipo_id = r.json()["id"]

    # Creador actualiza su equipo
    r_put = client.put(f"/equipos/{equipo_id}", json={
        "nombre": "Equipo Owner Modificado"
    }, headers=creador_headers)
    assert r_put.status_code == 200
    assert r_put.json()["nombre"] == "Equipo Owner Modificado"

    # Admin puede eliminarlo
    admin_headers = get_auth_headers(
        client,
        "admin_eq@example.com",
        "pass123",
        "Admin",
        "admin"
    )
    r_del = client.delete(f"/equipos/{equipo_id}", headers=admin_headers)
    assert r_del.status_code == 204


def test_gestion_jugadores_solo_por_creador_y_admin(client):
    # Creador crea equipo
    creador_headers = get_auth_headers(
        client,
        "creador_jugadores@example.com",
        "pass123",
        "Creador Jugadores",
        "organizer"
    )
    r = client.post("/equipos/", json={
        "nombre": "Equipo Con Jugadores",
        "color": "#555555"
    }, headers=creador_headers)
    assert r.status_code == 201
    equipo_id = r.json()["id"]

    # Creador agrega un jugador
    r_jugador = client.post(f"/equipos/{equipo_id}/jugadores", json={
        "nombre": "Juan Perez",
        "telefono": "5551234567",
        "email": "juan@example.com"
    }, headers=creador_headers)
    assert r_jugador.status_code == 201
    jugador_id = r_jugador.json()["id"]
    assert r_jugador.json()["nombre"] == "Juan Perez"
    assert r_jugador.json()["equipo_id"] == equipo_id

    # Listar jugadores es público/accesible
    r_list = client.get(f"/equipos/{equipo_id}/jugadores")
    assert r_list.status_code == 200
    assert len(r_list.json()) == 1

    # Otro usuario intenta agregar un jugador -> 403
    otro_headers = get_auth_headers(
        client,
        "otro_jugador_intruso@example.com",
        "pass123",
        "Intruso",
        "organizer"
    )
    r_intr = client.post(f"/equipos/{equipo_id}/jugadores", json={
        "nombre": "Intruso Jugador"
    }, headers=otro_headers)
    assert r_intr.status_code == 403

    # Otro usuario intenta modificar al jugador -> 403
    r_mod_intr = client.put(f"/equipos/{equipo_id}/jugadores/{jugador_id}", json={
        "nombre": "Modificado Intruso"
    }, headers=otro_headers)
    assert r_mod_intr.status_code == 403

    # Otro usuario intenta eliminar al jugador -> 403
    r_del_intr = client.delete(f"/equipos/{equipo_id}/jugadores/{jugador_id}", headers=otro_headers)
    assert r_del_intr.status_code == 403

    # Creador modifica al jugador -> 200
    r_mod_ok = client.put(f"/equipos/{equipo_id}/jugadores/{jugador_id}", json={
        "nombre": "Juan Perez Actualizado"
    }, headers=creador_headers)
    assert r_mod_ok.status_code == 200
    assert r_mod_ok.json()["nombre"] == "Juan Perez Actualizado"

    # Creador elimina al jugador -> 204
    r_del_ok = client.delete(f"/equipos/{equipo_id}/jugadores/{jugador_id}", headers=creador_headers)
    assert r_del_ok.status_code == 204

    # Verificar que la lista esté vacía
    r_list2 = client.get(f"/equipos/{equipo_id}/jugadores")
    assert len(r_list2.json()) == 0


def test_transferir_equipo(client):
    orga_headers = get_auth_headers(
        client,
        "orga_creador@example.com",
        "pass123",
        "Orga Creador",
        "organizer"
    )
    nuevo_coach_email = "nuevo_coach@example.com"
    nuevo_coach_headers = get_auth_headers(
        client,
        nuevo_coach_email,
        "pass123",
        "Nuevo Coach",
        "player"
    )

    # Orga crea equipo
    r_equipo = client.post("/equipos/", json={
        "nombre": "Equipo a Transferir",
        "color": "#123456"
    }, headers=orga_headers)
    assert r_equipo.status_code == 201
    equipo_id = r_equipo.json()["id"]

    # Orga transfiere el equipo al nuevo coach
    r_transf = client.patch(f"/equipos/{equipo_id}/transferir", json={
        "email": nuevo_coach_email
    }, headers=orga_headers)
    assert r_transf.status_code == 200
    
    # Verificar que el nuevo coach ahora puede modificar el equipo
    r_put_nuevo_coach = client.put(f"/equipos/{equipo_id}", json={
        "nombre": "Equipo Transferido"
    }, headers=nuevo_coach_headers)
    assert r_put_nuevo_coach.status_code == 200
    assert r_put_nuevo_coach.json()["nombre"] == "Equipo Transferido"
    
    # Orga original ya NO puede modificar el equipo
    r_put_orga_fail = client.put(f"/equipos/{equipo_id}", json={
        "nombre": "Intentando recuperar"
    }, headers=orga_headers)
    assert r_put_orga_fail.status_code == 403
