## Qué hace este PR

<!-- Una funcionalidad o una fase del roadmap. No mezclar. -->

## Fase del roadmap

<!-- Ej: Ligas / Equipos / Torneos / Registro PWA / etc. -->

## Impacto en otras apps

<!-- Obligatorio si el PR toca packages/ui, packages/types o packages/api-client -->
- [ ] Este PR NO toca `packages/ui`, `packages/types` ni `packages/api-client`
- [ ] Este PR SÍ los toca — impacto: _(describir qué cambia para web-next y/o registro-pwa)_

## Checklist

- [ ] Sigue los límites de arquitectura de `AGENTS.md` (lógica de negocio solo en backend)
- [ ] Si agrega un `EventType` o toca `metadata`: tabla de `match-event-engine` actualizada
- [ ] Tests agregados/actualizados (pytest / vitest / playwright según corresponda)
- [ ] Sin secretos ni credenciales hardcodeadas
- [ ] Si incluye migración de DB: es reversible y no se corrió en modo turbo
- [ ] No adelanta funcionalidad de una fase futura del roadmap sin pedido explícito
