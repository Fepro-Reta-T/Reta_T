# Arquitectura — reglas detalladas

Complementa la sección 1 y 2 de `AGENTS.md`. En caso de conflicto, `AGENTS.md` manda.

## Responsabilidad única por app

| App | Hace | No hace |
|---|---|---|
| `apps/web-next` | Administración: organizadores, ligas, equipos, jugadores, torneos, dashboards, feed, estadísticas (lectura) | Lógica de negocio, cálculo de estadísticas, reglas de auth propias |
| `apps/registro-pwa` | Captura de eventos de un partido en curso, offline-first | Cualquier pantalla que no sea "registrar un evento del partido en curso" |
| `backend/api` | Toda la lógica de negocio, auth, motor de estadísticas, motor de eventos, IA (fase futura) | Renderizado, estado de UI |

## Señal de alerta: scope creep en la PWA

Si una tarea agrega a `apps/registro-pwa` cualquiera de estas cosas, **detente y pregunta antes de implementar**:
- Un dashboard, listado, o pantalla de consulta histórica.
- Edición de datos que no sean del partido en curso (equipos, jugadores, ligas).
- Cualquier lógica que decida algo (ej. calcular si un jugador queda expulsado) en vez de solo enviar el evento crudo al backend.

## Flujo de datos

```
registro-pwa  ──(evento crudo)──>  backend/api  ──(persiste + calcula)──>  PostgreSQL
                                         │
web-next  <──(lee stats/estado ya calculado, vía packages/api-client)──┘
```

Next.js y la PWA **nunca** calculan estadísticas ni aplican reglas de negocio localmente — solo muestran lo que el backend ya calculó.

## Paquetes compartidos

- `packages/types`: única fuente de tipos (roles, EventType, DTOs). Si un tipo ya existe ahí, no se redefine en la app.
- `packages/ui`: componentes visuales reutilizados por `web-next` y `registro-pwa`. Antes de crear un componente, buscar si ya existe.
- `packages/api-client`: único cliente HTTP permitido hacia `backend/api`. Ninguna app hace `fetch`/`axios` directo a la API.

## Roadmap — gating por fase

No implementar nada de una fase futura (Redis, Celery, motor de IA, patrocinios, notificaciones push) si la tarea pertenece a una fase anterior del roadmap, salvo pedido explícito del usuario en esa sesión. Ver `AGENTS.md` §10 para el orden de fases.

## Antes de tocar el modelo de datos genérico

Cualquier cambio a `Sport / EventType / MatchEvent` requiere discusión de equipo (no solo aprobación de un PR). Ver `database.md` y la skill `match-event-engine`.
