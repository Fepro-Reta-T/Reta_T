# Git y colaboración — reglas detalladas

Complementa `AGENTS.md` §9. Equipo de 4 desarrolladores, todos con permiso de push directo bloqueado en `main` (ver protección de rama en la guía de setup del repo).

## Commits

Conventional commits, siempre:
```
feat:     nueva funcionalidad
fix:      corrección de bug
docs:     documentación (incluye cambios a AGENTS.md/GEMINI.md/.agent/rules)
refactor: cambio de código sin cambiar comportamiento
test:     agregar o corregir tests
chore:    mantenimiento (deps, config, etc.)
```

## Ramas

- `main`: siempre desplegable, protegida.
- `feat/<descripcion-corta>`, `fix/<descripcion-corta>` desde `main`.
- No mezclar cambios de distintas fases del roadmap en una misma rama/PR.

## Pull Requests

- Un PR = una funcionalidad o una fase del roadmap. No mezclar.
- Si el PR toca `packages/ui`, `packages/types` o `packages/api-client`: mencionarlo explícitamente en la descripción del PR (usar la sección "Impacto en otras apps" del template) — afecta a ambas apps frontend.
- Al menos 1 revisión aprobada de otro miembro del equipo antes de mergear (branch protection lo fuerza).
- CI (lint + tests) en verde antes de mergear.
- Squash merge por defecto, para mantener el historial de `main` limpio y alineado 1 commit ≈ 1 PR.

## Cambios al modelo de datos genérico

`Sport / EventType / MatchEvent` no se modifica sin discutirlo con el equipo primero (fuera del PR — en el canal/reunión del equipo). El PR puede documentar la decisión ya tomada, pero no es el lugar para tomarla.

## Cambios a las reglas del agente

Cambios a `AGENTS.md`, `GEMINI.md` o `.agent/rules/*` van por PR y revisión del equipo, igual que cualquier cambio de arquitectura (regla ya establecida en `README.md`).
