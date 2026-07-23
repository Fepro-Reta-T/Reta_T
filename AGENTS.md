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

## 4. Autenticación y autorización

- Autenticación centralizada en FastAPI (JWT). Next.js y la PWA consumen el mismo esquema de tokens/roles vía
  `packages/api-client` — ninguna de las dos apps implementa su propia lógica de auth paralela.
- Roles deben definirse una sola vez en `packages/types` y reutilizarse en ambos frontends.
- Un solo dispositivo autorizado por partido en la PWA, para evitar conflictos de escritura concurrente.

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
- No implementar infraestructura o funcionalidades de fases futuras (Redis, Celery, IA, patrocinios) si la
  tarea actual corresponde a una fase anterior, salvo que el usuario lo pida explícitamente.
- El MVP es: autenticación, ligas, equipos, jugadores, torneos, calendario, registro offline, estadísticas
  automáticas. Todo lo demás se construye sobre esa base.
