# Backend (FastAPI) — reglas detalladas

Complementa `AGENTS.md` §4, §6, §7.

## Estructura de carpetas esperada

```
backend/api/
├── app/
│   ├── routers/        # solo HTTP: parsing, status codes, llama a services
│   ├── services/        # lógica de negocio pura, testeable sin FastAPI
│   ├── repositories/     # acceso a datos (queries), sin lógica de negocio
│   ├── schemas/          # Pydantic (request/response), nunca reusar modelos ORM como response directo
│   ├── models/            # SQLAlchemy / modelos ORM
│   ├── core/               # config, seguridad, dependencias compartidas (auth, db session)
│   └── main.py
└── tests/
```

Un router nunca debe contener queries SQL ni reglas de negocio directamente — delega a `services/`.

## Reglas obligatorias por endpoint

1. Type hints en toda función pública.
2. Pydantic para request y response (nunca devolver el modelo ORM directo).
3. `async def` para cualquier función que haga I/O (DB, HTTP externo).
4. Dependencia de auth (`Depends(get_current_user)` o equivalente) explícita, nunca implícita.
5. Al menos un test de integración en `tests/` (ver skill `api-endpoint-scaffold`).
6. Códigos de error HTTP explícitos y consistentes (400 validación, 401 no autenticado, 403 sin permiso, 404 no existe, 409 conflicto/idempotencia).

## Autenticación

- JWT emitido y validado solo en `backend/api` (`core/security.py` o equivalente).
- Roles definidos una sola vez en `packages/types`, el backend los valida — no crear un enum de roles paralelo en Python sin sincronizarlo.
- Un solo dispositivo autorizado por partido: el endpoint de registro de eventos debe verificar el device/session activo antes de aceptar un evento.

## Migraciones

- Usar Alembic (o el sistema de migraciones ya definido — no introducir otro sin aprobación).
- **Nunca** ejecutar una migración en modo automático/turbo. Ver `.agent/rules/security.md` y `GEMINI.md` §Turbo Mode.
- Toda migración que modifique `Sport`, `EventType` o `MatchEvent` requiere discusión de equipo previa (§ `database.md`).

## Estilo

- PEP 8, `ruff` para lint/formato.
- Funciones bajo ~30 líneas, archivos bajo ~300 líneas cuando sea razonable.
- No agregar una librería nueva (ORM alterno, framework de tareas, caché) sin documentarla primero en `AGENTS.md` §2.
