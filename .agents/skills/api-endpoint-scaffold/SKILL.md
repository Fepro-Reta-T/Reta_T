---
name: api-endpoint-scaffold
description: Usar al crear un endpoint nuevo en backend/api. Cubre las capas obligatorias (router/service/repository), schemas Pydantic, dependencia de auth y el test de integración mínimo requerido.
---

# Scaffold de endpoint — backend/api

## Capas obligatorias (ver `.agent/rules/backend-fastapi.md`)

```
routers/<recurso>.py      → parsing HTTP, status codes, llama a services/
services/<recurso>.py      → lógica de negocio, testeable sin FastAPI
repositories/<recurso>.py   → queries a la base de datos
schemas/<recurso>.py         → Pydantic In/Out, nunca exponer el modelo ORM directo
```

## Checklist al crear un endpoint nuevo

1. `schemas/`: definir `<Recurso>Create` / `<Recurso>Out` (o equivalentes) — nunca reusar el modelo ORM como response.
2. `repositories/`: función(es) de acceso a datos, sin lógica de negocio.
3. `services/`: la lógica real (validaciones de negocio, cálculos), llama a `repositories/`.
4. `routers/`: define el path, method, `response_model`, y la dependencia de auth (`Depends(...)`) — llama a `services/`, no contiene lógica.
5. Códigos de error explícitos: 400 validación, 401 no autenticado, 403 sin permiso, 404 no existe, 409 conflicto/idempotencia.
6. Test de integración en `tests/` — mínimo: caso feliz + un caso de error relevante (401/403/404 según aplique).
7. Si el endpoint recibe `metadata` de un `MatchEvent`: revisar la skill `match-event-engine` primero.
8. Si el endpoint es de la PWA (registro de eventos): revisar la skill `pwa-offline-sync` para el manejo de idempotencia.

## Plantilla mínima de test de integración

```python
def test_<recurso>_create_success(client, auth_headers):
    response = client.post("/<recurso>", json={...}, headers=auth_headers)
    assert response.status_code == 201
    assert response.json()["id"] is not None

def test_<recurso>_create_unauthorized(client):
    response = client.post("/<recurso>", json={...})
    assert response.status_code == 401
```

## No hacer

- No devolver el modelo SQLAlchemy directo como response (fuga de campos internos).
- No poner queries SQL en `routers/`.
- No saltear el schema de auth "porque es un endpoint interno" — toda ruta declara su dependencia de auth explícitamente, aunque sea `AllowAny`.
