---
name: code-review-checklist
description: Usar al revisar un PR antes de aprobarlo. Checklist de límites de arquitectura, impacto en packages/, seguridad básica y cobertura de tests, alineado a AGENTS.md.
---

# Checklist de revisión de PR

## Arquitectura

- [ ] ¿El PR mete lógica de negocio en `apps/web-next` o `apps/registro-pwa`? → debería vivir en `backend/api`.
- [ ] Si toca `apps/registro-pwa`: ¿la funcionalidad es estrictamente "registrar un evento del partido en curso"? Si no, señalarlo (ver `.agent/rules/pwa-vite.md`).
- [ ] ¿Se duplicó un tipo, componente o cliente HTTP que ya existía en `packages/`?

## Impacto en `packages/`

- [ ] Si el PR toca `packages/ui`, `packages/types` o `packages/api-client`: ¿la descripción del PR lo menciona explícitamente y explica el impacto en ambos frontends?
- [ ] ¿Se rompe algún contrato de tipos que use la otra app (web-next / registro-pwa)?

## Modelo de datos

- [ ] Si el PR agrega un `EventType` o cambia `metadata`: ¿está la tabla de la skill `match-event-engine` actualizada?
- [ ] Si el PR toca `Sport`/`EventType`/`MatchEvent` (tablas core): ¿fue discutido con el equipo antes del PR, no solo en la revisión?
- [ ] ¿Hay una migración incluida y es reversible?

## Seguridad

- [ ] ¿Hay algún secreto, token o credencial hardcodeado?
- [ ] ¿Se loguea algo sensible (token, password, JWT)?
- [ ] ¿Toda entrada de usuario se valida en el backend (no solo en frontend)?
- [ ] Si hay una operación destructiva (delete/drop/reset): ¿requiere confirmación explícita del usuario en runtime, no solo en el PR?

## Tests

- [ ] ¿Todo endpoint nuevo de FastAPI tiene al menos un test de integración?
- [ ] ¿Los flujos críticos de frontend (login, registro de partido) tienen cobertura E2E si fueron modificados?

## Roadmap

- [ ] ¿El PR se queda dentro de la fase actual del roadmap, o adelanta funcionalidad de una fase futura sin que el usuario lo haya pedido explícitamente?
