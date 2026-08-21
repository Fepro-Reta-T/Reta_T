# AGENTS.md — Plataforma de Gestión Deportiva Amateur

Reglas compartidas para cualquier agente de IA (Antigravity, Cursor, Claude Code) que trabaje en este monorepo.
Este archivo es la fuente de verdad del proyecto. `GEMINI.md` solo añade overrides específicos de Antigravity.

Somos un equipo de 4 desarrolladores. Estas reglas existen para que nadie tome decisiones de arquitectura
por su cuenta dentro de una sesión de agente sin que quede registrado aquí.

---

## 1. Visión y principio de diseño

- Objetivo: no es solo un gestor de torneos, es la fuente de inteligencia deportiva de una comunidad.
- Principio de responsabilidad única por app:
  - **Next.js administra** (organizadores, equipos, jugadores, dashboards, feed, estadísticas).
  - **PWA (Vite) registra** (solo captura de eventos de partido, offline-first, pantallas mínimas).
  - **FastAPI procesa** (toda la lógica de negocio, autenticación, estadísticas, IA).
- La complejidad SIEMPRE vive en el backend (FastAPI). Ni Next.js ni la PWA deben reimplementar reglas de negocio.
  - **Excepción (Anti-patrón de geocodificación):** Nunca bloquear endpoints de FastAPI con llamadas síncronas a APIs de terceros (ej. Google Maps). La geocodificación (lat/lng a Municipio) debe resolverse asíncronamente en el frontend (Next.js) antes de enviar el formulario al backend.
- La PWA nunca debe crecer hacia una "versión pequeña del sistema". Si una tarea le agrega una pantalla o
  funcionalidad que no es "registrar un partido", detente y pregunta antes de implementarla ahí.

## 2. Tech stack (no asumir, no cambiar sin aprobación)

- **apps/web-next**: Next.js, portal principal (organizadores, admins, jugadores, equipos, espectadores, patrocinadores).
- **apps/registro-pwa**: Vite, PWA offline-first, registro de eventos de partido únicamente.
- **backend/api**: FastAPI — REST, auth, reglas de negocio, motor de estadísticas, motor de inteligencia, sync offline.
- **DB**: PostgreSQL (relaciones complejas, JSONB, futuro PostGIS).
- **Infra futura** (no implementar hasta que la fase correspondiente del roadmap lo indique): Redis, Celery,
  Cloudflare R2, Firebase Cloud Messaging, Google Maps API, Resend, OpenTelemetry.
- **packages/ui, packages/types, packages/api-client**: compartidos entre web-next y registro-pwa. Ambas apps
  deben consumir la API a través de `packages/api-client`, nunca con fetch/axios directo duplicado.

No introducir librerías, ORMs, frameworks de estado o sistemas de caché adicionales sin que quede documentado
aquí primero.

## 3. Modelo de datos — Sport / EventType / MatchEvent

Este es el diferenciador técnico del proyecto. Es obligatorio respetarlo:

- Nunca crear tablas específicas por deporte (ej. `football_goals`, `basketball_points`). Todo pasa por el
  modelo genérico `Sport → EventType → MatchEvent`.
- `MatchEvent.metadata` (JSONB) debe seguir un esquema documentado y versionado por `EventType` — antes de
  agregar un nuevo `EventType`, define su esquema de metadata en `packages/types` y en la skill
  `match-event-engine`. Nunca guardar claves ad-hoc en metadata sin registrar el esquema.
- Cualquier campo que se consulte frecuentemente para estadísticas (goleadores, tarjetas, MVP) debe evaluarse
  para indexación (índice GIN sobre JSONB o columna generada), no asumir que JSONB es gratis en performance.

### Entidades nuevas del MVP (`MVP_RetaT.pdf`) — Estado de implementación

- **`Municipio` y `Cancha`**: **Implementadas** (Modelos en `geo.py` y Endpoints CRUD funcionales). `Municipio` agrupa canchas y torneos de una zona. `Cancha` contiene coordenadas para futura búsqueda geográfica.
- **Categorías de torneo**: **Implementadas** (Campo `categoria` en el modelo `Tournament`).
- **`Participante`**: **Modelado** (Modelo en `game.py`). Falta desarrollar sus endpoints y el flujo para "reclamar perfil".
- **`Partido` y Asignación Encargado**: **Modelado** (Modelo en `game.py` con `match_manager_id`). Falta desarrollar sus endpoints para interactuar con la PWA.

## 4. Autenticación y autorización

- Autenticación centralizada en FastAPI (JWT). Next.js y la PWA consumen el mismo esquema de tokens/roles vía
  `packages/api-client` — ninguna de las dos apps implementa su propia lógica de auth paralela.
- Roles deben definirse una sola vez en `packages/types` y reutilizarse en ambos frontends.
- Un solo dispositivo autorizado por partido en la PWA, para evitar conflictos de escritura concurrente.

### Roles (fuente de verdad: fusión de la decisión inicial + `MVP_RetaT.pdf`)

> ⚠️ El código actual (`RoleEnum` en `backend/api/app/models/user.py`) todavía tiene los roles viejos
> (`admin`, `organizer`, `player`, `spectator`) y **no refleja esta tabla**. Migrar el enum es la próxima
> tarea de backend — no agregar funcionalidad nueva que asuma los roles viejos.

| Rol | Quién lo obtiene | Permisos |
|---|---|---|
| `ADMIN` | Asignado manualmente (no autoregistrable) | Ve todas las ligas/torneos/usuarios, gestiona municipios, analítica completa |
| `ORGANIZER` | **Por Invitación / Asignación** — Un `ORGANIZER` existente o un `ADMIN` le otorga este rol (mediante link de invitación o panel). | CRUD de torneos, canchas y partidos. Ve su propia analítica. Puede invitar a otros organizadores |
| `MATCH_MANAGER` (Encargado de partido) | Asignado por un `ORGANIZER` a un partido puntual (mediante link o panel). | Solo registra goles y asistencia del partido que tiene asignado. No crea torneos ni canchas |
| `PLAYER` | **Rol por defecto** al crear una cuenta, o asignado al "reclamar" un historial de partido (ver abajo). | Ve sus propias estadísticas e historial. Sin permisos de creación/edición |
| `VIEWER` (Visualizador — municipio) | Asignado manualmente por un `ADMIN` (representa a un municipio) | Solo lectura del dashboard de uso de espacios públicos (canchas de ese municipio) |

**Simplificación de Roles (Decisión actual):** Se descartó la idea de que los usuarios elijan su rol libremente al registrarse por temas de seguridad y control. Todo usuario nuevo nace como `PLAYER`. Para convertirse en `ORGANIZER` o `MATCH_MANAGER`, debe recibir una invitación (link mágico) de alguien que ya tenga esos permisos o ser asignado manualmente. Esto mantiene la seguridad usando un chequeo estático simple (`require_role(...)`) en lugar de lógicas complejas de ownership, asegurando que solo personal autorizado cree torneos.

### El "jugador opcional" — asistencia sin cuenta, con opción de reclamarla

La asistencia a un partido (que registra el `MATCH_MANAGER`, por nombre) es independiente de tener una
cuenta en la app:

1. El `MATCH_MANAGER` anota asistencia por nombre (y opcionalmente teléfono/email) — no requiere que esa
   persona tenga cuenta. Esto se guarda en una entidad `Participante` (roster de un partido), no en `User`.
2. Si esa persona se registra después en la app (con el mismo teléfono/email que quedó anotado), puede
   **reclamar** ese historial — la app le ofrece vincular esos registros a su cuenta nueva, con rol `PLAYER`.
3. Si nunca se registra, no pasa nada — el nombre queda en el historial del partido igual, solo que no está
   vinculado a ninguna cuenta.

`Participante.user_id` es nullable — se completa recién cuando la persona reclama su perfil.

### Crear torneos/canchas: permiso por rol estático (no por ownership)

Solo `ADMIN` y `ORGANIZER` pueden hacer CRUD de torneos y canchas — no cualquier usuario autenticado. El
patrón a usar es `Depends(require_role(RoleEnum.ADMIN, RoleEnum.ORGANIZER))`, no un chequeo de ownership.

### Visibilidad de estadísticas

Las estadísticas de un jugador (propias o de otros) son visibles para **cualquier usuario autenticado** — no
son públicas para gente sin cuenta, pero tampoco están restringidas solo a los miembros de la misma liga/torneo.
Todo endpoint de estadísticas requiere login (`Depends(get_current_user)`), sin chequeo de rol adicional.

## 5. Offline-first (PWA)

- Flujo obligatorio: registrar evento → guardar localmente → detectar conexión → sincronizar → confirmar
  recepción → eliminar cola local.
- Cada evento sincronizado debe ser idempotente (id único generado en cliente) para que reintentos de red no
  dupliquen eventos.
- Ver skill `pwa-offline-sync` antes de tocar el motor de sincronización.

## 6. Código y calidad

- Backend (Python/FastAPI): type hints obligatorios, Pydantic para validación de entrada/salida, PEP 8,
  preferir async/await para I/O.
- Frontend (Next.js/Vite/React): componentes funcionales, TypeScript estricto, exports nombrados,
  componentes compartidos van en `packages/ui`, tipos compartidos en `packages/types`.
- Mantener funciones bajo ~30 líneas y archivos bajo ~300 líneas cuando sea razonable; dividir si se excede.
- Nunca duplicar un tipo, componente o cliente HTTP que ya existe en `packages/`. Buscar antes de crear.

## 7. Testing

- Backend: pytest para unit tests de reglas de negocio y motor de estadísticas.
- Frontend: Vitest para unit tests, Playwright para E2E en flujos críticos (registro de partido, login).
- Todo nuevo endpoint de FastAPI requiere al menos un test de integración.

## 8. Seguridad

- Nunca hardcodear credenciales ni secretos — usar variables de entorno (`.env`, nunca commiteado).
- Nunca loguear tokens, contraseñas ni JWTs.
- Validar toda entrada de usuario en el backend, sin excepción (no confiar en validación de frontend).
- Cualquier operación destructiva (borrar liga, borrar partido, migración de DB) requiere confirmación
  explícita del usuario antes de ejecutarse — nunca en modo automático/turbo.

## 9. Git y colaboración (equipo de 4)

- Commits convencionales: `feat:`, `fix:`, `docs:`, `refactor:`, `test:`, `chore:`.
- Un PR por funcionalidad/fase del roadmap, no mezclar cambios de distintas fases en un mismo PR.
- Cambios que toquen `packages/ui`, `packages/types` o `packages/api-client` requieren mención explícita en
  la descripción del PR, porque afectan a ambos frontends — son compartidos, no de una sola app.
- No modificar el modelo de datos genérico (Sport/EventType/MatchEvent) sin discutirlo con el equipo primero;
  es la base de todo lo demás.

## 10. Roadmap — no adelantarse de fase

- El proyecto sigue un roadmap por fases (Fundación → Ligas → Equipos → Jugadores → Torneos → Registro PWA →
  Motor de eventos → Estadísticas → Comunidad → Dashboard → Inteligencia → Notificaciones → Patrocinios → IA →
  Escalabilidad).
- **Prioridad Actual (Fase Activa):** 
  1. Inscripción de equipos a ligas/torneos. 
  2. Programación de Partidos (Fixture y asignación de encargados). 
  3. Desarrollo del Panel de Arbitraje (PWA).
- No implementar infraestructura o funcionalidades de fases futuras (Redis, Celery, IA, patrocinios) si la
  tarea actual corresponde a una fase anterior, salvo que el usuario lo pida explícitamente.
- El MVP es (actualizado con `MVP_RetaT.pdf`): autenticación (con recuperar contraseña), gestión de
  torneos/canchas/municipios, captura de campo (partidos, goles, asistencia), analítica simple (tablero,
  canchas más/menos usadas, participación por género, partidos por día/hora, export CSV), y administración
  de usuarios/roles. Ver detalle de roles en §4 y entidades nuevas en §3.

### Pendiente de definir (no implementar todavía)

- **Búsqueda de usuario final "canchas/ligas cerca tuyo"**: las coordenadas de `Cancha` ya son parte del MVP
  (para analítica de uso), pero usarlas para que un usuario final busque "cerca mío" sigue sin alcance
  definido (¿radio de búsqueda?, ¿geolocalización del navegador o dirección manual?, ¿PostGIS o alcanza con
  lat/lng + fórmula de distancia?). No construir esto hasta que se actualice esta sección.
- **Recuperar contraseña**: mencionado en el PDF, todavía sin diseñar el flujo (email con link, código, etc.)

## 11. Flujo de Inscripción de Equipos (Decisión Arquitectónica)

Existen dos vías oficiales para inscribir un equipo a un torneo, diseñadas para ser flexibles y no excluir a equipos que no usen tecnología:

1. **Inscripción por Enlace (Flujo de Aprobación):** El organizador comparte un enlace público del torneo (ej. `/torneos/[id]/unirse`). Los capitanes de equipo abren el link, inician sesión en la app, seleccionan su equipo (que obligatoriamente debe coincidir con la categoría del torneo) y envían una `SolicitudInscripcion`. El equipo queda en estado `PENDIENTE` hasta que el organizador lo aprueba o rechaza en su panel.
2. **Inscripción Manual (Equipos Locales/Desconectados):** El organizador conserva la facultad de crear un perfil de equipo manualmente e inscribirlo directo al torneo, saltándose el flujo de solicitud. Esto asegura que la liga no se detenga por usuarios que no usan la app.

**Límite de Inscripción (Caducidad):** Todo torneo debe tener configurado un límite de inscripción (por fecha de cierre o por cupo máximo de equipos). Una vez alcanzado este límite, el enlace de invitación dejará de aceptar nuevas solicitudes automáticamente.
