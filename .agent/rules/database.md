# Base de datos — reglas detalladas

Complementa `AGENTS.md` §3. Este es el diferenciador técnico del proyecto — se respeta sin excepciones.

## Modelo genérico obligatorio

`Sport → EventType → MatchEvent`. **Nunca** crear una tabla específica por deporte (ej. `football_goals`, `basketball_fouls`). Todo evento de cualquier deporte pasa por `MatchEvent`.

## Antes de agregar un `EventType` nuevo

1. Definir su tipo en `packages/types`.
2. Definir su schema de `metadata` (Pydantic) en el backend.
3. Registrar el schema en la tabla de la skill `match-event-engine` — es obligatorio, no opcional.
4. Nunca guardar una clave nueva dentro de `metadata` (JSONB) sin haber hecho los 3 pasos anteriores. "Clave ad-hoc no documentada" es el error más común a evitar acá.

## Indexación

Cualquier campo dentro de `metadata` que se vaya a consultar frecuentemente para estadísticas (goleadores, tarjetas, MVP, etc.) debe evaluarse para:
- Índice GIN sobre la columna JSONB, o
- Columna generada (generated column) indexada aparte.

No asumir que JSONB es gratis en performance — si un query sobre `metadata` empieza a aparecer en dashboards o reportes en vivo, es candidato a índice.

## Migraciones

- Nunca en modo automático/turbo (ver `GEMINI.md` §Turbo Mode).
- Cualquier migración que toque `sports`, `event_types` o `match_events` (las tablas del modelo genérico) requiere discusión de equipo antes del PR, no solo revisión de PR.

## Índice de referencia

Mantené esta tabla al día (duplica/enlaza a la de la skill `match-event-engine`):

| EventType | Deporte(s) | Campos en `metadata` | Indexado |
|---|---|---|---|
| _(agregar filas a medida que se crean EventTypes)_ | | | |
