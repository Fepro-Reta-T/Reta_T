# Frontend — Next.js (apps/web-next) — reglas detalladas

Complementa `AGENTS.md` §6 y `GEMINI.md` §Diseño.

## Alcance de esta app

Organizadores, admins, jugadores, equipos, espectadores, patrocinadores (fase futura). Es el panel de **lectura y administración** — nunca calcula estadísticas ni aplica reglas de negocio, solo consume `packages/api-client`.

## Componentes y tipos

- Componentes funcionales, exports nombrados (no `export default` salvo lo que Next.js exija, ej. páginas).
- TypeScript estricto (`strict: true`), sin `any` salvo caso justificado y comentado.
- Antes de crear un componente, tipo o helper: buscar en `packages/ui` y `packages/types` si ya existe. Duplicar está prohibido por `AGENTS.md` §6.
- Toda llamada a la API pasa por `packages/api-client` — nunca `fetch`/`axios` directo dentro de `apps/web-next`.

## Dirección de diseño (de `GEMINI.md`)

- Profesional y funcional, pensado para organizadores de ligas reales — **no** "premium/glassmorphism" por defecto.
- Prioridad: densidad de información y legibilidad de datos (tablas, calendarios, estadísticas) por sobre efectos visuales.
- Antes de agregar una librería de UI/animación nueva, confirmar que no rompe esta dirección y que está documentada en `AGENTS.md` §2.

## Estado y datos

- No introducir una librería de manejo de estado global (Redux, Zustand, etc.) sin aprobación — documentar en `AGENTS.md` §2 si se aprueba.
- Preferir server components / data fetching nativo de Next.js donde aplique antes de agregar una librería de fetching adicional.

## Testing

- Vitest para unit tests de componentes/lógica.
- Playwright para E2E en flujos críticos: login, creación de torneo, visualización de estadísticas en vivo.
