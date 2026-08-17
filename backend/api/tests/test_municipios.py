import pytest

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

def test_crear_municipio_solo_admin(client):
    admin_headers = get_auth_headers(client, "admin_muni@example.com", "pass123", "Admin Muni", "admin")
    organizer_headers = get_auth_headers(client, "orga_muni@example.com", "pass123", "Orga Muni", "organizer")

    # Intentar crear como organizer (debe fallar 403)
    r = client.post("/municipios/", json={
        "nombre": "Municipio A",
        "estado": "Estado A",
        "clave_inegi": "12345"
    }, headers=organizer_headers)
    assert r.status_code == 403

    # Crear como admin (debe pasar 2101 / 201)
    r = client.post("/municipios/", json={
        "nombre": "Municipio A",
        "estado": "Estado A",
        "clave_inegi": "12345"
    }, headers=admin_headers)
    assert r.status_code == 201
    body = r.json()
    assert body["nombre"] == "Municipio A"
    assert "id" in body

def test_crear_municipio_duplicado(client):
    admin_headers = get_auth_headers(client, "admin_dup@example.com", "pass123", "Admin Dup", "admin")

    # Crear primero
    r = client.post("/municipios/", json={
        "nombre": "Municipio Dup",
        "estado": "Estado Dup",
        "clave_inegi": "54321"
    }, headers=admin_headers)
    assert r.status_code == 201

    # Crear segundo con mismo nombre (debe fallar 409)
    r = client.post("/municipios/", json={
        "nombre": "Municipio Dup",
        "estado": "Estado Dup",
        "clave_inegi": "54321"
    }, headers=admin_headers)
    assert r.status_code == 409

def test_listar_municipios(client):
    admin_headers = get_auth_headers(client, "admin_list@example.com", "pass123", "Admin List", "admin")
    organizer_headers = get_auth_headers(client, "orga_list@example.com", "pass123", "Orga List", "organizer")

    # Crear municipio
    client.post("/municipios/", json={
        "nombre": "Zacatecas",
        "estado": "Zacatecas",
        "clave_inegi": "32001"
    }, headers=admin_headers)

    # Listar de forma pública sin headers (invitado)
    r = client.get("/municipios/")
    assert r.status_code == 200
    muni_list = r.json()
    assert len(muni_list) >= 1
    assert any(m["nombre"] == "Zacatecas" for m in muni_list)
