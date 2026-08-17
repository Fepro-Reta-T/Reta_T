import pytest
from uuid import uuid4

def get_auth_headers(client, email, password, full_name, role):
    # Registrar usuario
    r = client.post("/auth/register", json={
        "email": email,
        "password": password,
        "full_name": full_name,
        "role": role
    })
    assert r.status_code == 201

    # Loguearse
    r = client.post("/auth/login", json={
        "email": email,
        "password": password
    })
    assert r.status_code == 200
    token = r.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}

def test_crear_y_listar_canchas(client):
    admin_headers = get_auth_headers(client, "admin_cancha@example.com", "pass123", "Admin Cancha", "admin")
    organizer_headers = get_auth_headers(client, "orga_cancha@example.com", "pass123", "Orga Cancha", "organizer")
    player_headers = get_auth_headers(client, "player_cancha@example.com", "pass123", "Player Cancha", "player")

    # 1. Crear un municipio primero
    r = client.post("/municipios/", json={
        "nombre": "Municipio Canchas",
        "estado": "Estado Canchas",
        "clave_inegi": "99999"
    }, headers=admin_headers)
    assert r.status_code == 201
    muni_id = r.json()["id"]

    # 2. Intentar crear cancha como PLAYER (debe fallar 403)
    r = client.post("/canchas/", json={
        "nombre": "Cancha Falla",
        "direccion": "Calle Falsa 123",
        "latitud": 19.4326,
        "longitud": -99.1332,
        "capacidad": 50,
        "municipio_id": muni_id
    }, headers=player_headers)
    assert r.status_code == 403

    # 3. Crear cancha como ORGANIZER (debe pasar)
    r = client.post("/canchas/", json={
        "nombre": "Cancha Central",
        "direccion": "Av. Principal 100",
        "latitud": 20.6597,
        "longitud": -103.3496,
        "capacidad": 100,
        "municipio_id": muni_id
    }, headers=organizer_headers)
    assert r.status_code == 201
    cancha_body = r.json()
    assert cancha_body["nombre"] == "Cancha Central"
    assert "id" in cancha_body
    assert "propietario_id" in cancha_body
    cancha_id = cancha_body["id"]

    # 4. Listar canchas (debe incluir la creada, funciona de manera pública sin headers)
    r = client.get("/canchas/")
    assert r.status_code == 200
    canchas = r.json()
    assert len(canchas) >= 1
    assert any(c["id"] == cancha_id for c in canchas)

    # 5. Obtener cancha por ID (público sin headers)
    r = client.get(f"/canchas/{cancha_id}")
    assert r.status_code == 200
    assert r.json()["nombre"] == "Cancha Central"
