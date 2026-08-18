def test_register_login_and_me(client):
    register_payload = {
        "email": "ana@example.com",
        "password": "supersecreta123",
        "full_name": "Ana Torres",
        "role": "organizer",
    }
    r = client.post("/auth/register", json=register_payload)
    assert r.status_code == 201
    body = r.json()
    assert body["email"] == "ana@example.com"
    assert body["role"] == "organizer"
    assert "password" not in body
    assert "hashed_password" not in body

    r = client.post(
        "/auth/login",
        json={"email": "ana@example.com", "password": "supersecreta123"},
    )
    assert r.status_code == 200
    token = r.json()["access_token"]
    assert token

    r = client.get("/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert r.status_code == 200
    assert r.json()["email"] == "ana@example.com"


def test_register_duplicate_email_returns_409(client):
    payload = {
        "email": "dup@example.com",
        "password": "12345678",
        "full_name": "Duplicado",
        "role": "player",
    }
    r1 = client.post("/auth/register", json=payload)
    assert r1.status_code == 201

    r2 = client.post("/auth/register", json=payload)
    assert r2.status_code == 409


def test_login_wrong_password_returns_401(client):
    client.post(
        "/auth/register",
        json={
            "email": "bruno@example.com",
            "password": "claveCorrecta1",
            "full_name": "Bruno",
            "role": "player",
        },
    )
    r = client.post(
        "/auth/login",
        json={"email": "bruno@example.com", "password": "claveIncorrecta"},
    )
    assert r.status_code == 401


def test_me_without_token_returns_401(client):
    r = client.get("/auth/me")
    assert r.status_code == 401


def test_register_with_new_roles_succeeds(client):
    for role in ["match_manager", "viewer"]:
        r = client.post(
            "/auth/register",
            json={
                "email": f"{role}@example.com",
                "password": "password123",
                "full_name": f"Usuario {role}",
                "role": role,
            },
        )
        assert r.status_code == 201, r.text
        assert r.json()["role"] == role


def test_register_with_old_spectator_role_rejected(client):
    r = client.post(
        "/auth/register",
        json={
            "email": "viejo@example.com",
            "password": "password123",
            "full_name": "Rol viejo",
            "role": "spectator",
        },
    )
    assert r.status_code == 422

def test_update_onboarding_succeeds(client):
    # Registrar
    r = client.post(
        "/auth/register",
        json={
            "email": "onboarding@example.com",
            "password": "password123",
            "full_name": "Onboarding",
            "role": "player",
        },
    )
    assert r.status_code == 201

    # Login
    r = client.post(
        "/auth/login",
        json={"email": "onboarding@example.com", "password": "password123"},
    )
    assert r.status_code == 200
    token = r.json()["access_token"]

    # Patch Onboarding
    patch_payload = {
        "role": "organizer",
        "datos_adicionales": {
            "onboarding_completed": True,
            "favorite_sports": ["1", "2"]
        }
    }
    r = client.patch(
        "/auth/me/onboarding",
        headers={"Authorization": f"Bearer {token}"},
        json=patch_payload
    )
    assert r.status_code == 200
    body = r.json()
    assert body["role"] == "organizer"
    assert body["datos_adicionales"]["onboarding_completed"] is True
    assert body["datos_adicionales"]["favorite_sports"] == ["1", "2"]
