---
name: match-event-engine
description: Usar antes de crear un EventType nuevo, modificar el schema de MatchEvent.metadata, o implementar lógica que lea/escriba eventos de partido. Cubre el modelo genérico Sport → EventType → MatchEvent y la tabla de schemas de metadata versionados.
---

# Motor de eventos — Sport / EventType / MatchEvent

## El modelo

- `Sport`: fútbol, básquet, vóley, etc.
- `EventType`: acción posible dentro de un deporte (gol, tarjeta amarilla, falta, punto, etc.). Pertenece a uno o más `Sport`.
- `MatchEvent`: instancia real de un evento durante un partido. Tiene `event_type_id`, `match_id`, `metadata` (JSONB), `client_timestamp` exacto (generado en el celular para Event Sourcing), y el id idempotente generado en cliente (ver skill `pwa-offline-sync`).

**Nunca** crear una tabla específica por deporte. Todo pasa por este modelo (regla no negociable, ver `.agent/rules/database.md`).

## Checklist para agregar un EventType nuevo

1. ¿Ya existe un `EventType` equivalente? Buscar antes de crear.
2. Definir el tipo en `packages/types` (nombre, deportes a los que aplica, shape de `metadata`).
3. Definir el Pydantic schema del `metadata` en `backend/api`.
4. Agregar una fila a la tabla de schemas más abajo.
5. Agregar/actualizar el test de integración del endpoint que recibe este evento.
6. Si el campo se va a consultar frecuentemente (ranking de goleadores, etc.), evaluar índice — ver `.agent/rules/database.md`.

## Tabla de schemas de `metadata` (mantener actualizada)

> Esta tabla es la que más se desactualiza si el equipo no se disciplina — actualizarla es parte de la definición de "terminado" al agregar un EventType.

| EventType | Deporte(s) | Campos en `metadata` | Ejemplo | Indexado |
|---|---|---|---|---|
| `goal` | fútbol | `player_id`, `assist_player_id?`, `minute` | `{"player_id": 12, "minute": 34}` | Sí (GIN) |
| `yellow_card` | fútbol | `player_id`, `minute`, `reason?` | `{"player_id": 8, "minute": 60}` | No |
| _(agregar filas nuevas acá)_ | | | | |

## Errores comunes a evitar

- Guardar una clave nueva en `metadata` sin pasar por el checklist de arriba ("clave ad-hoc").
- Duplicar un `EventType` casi idéntico en vez de reutilizar uno existente con un campo opcional distinto.
- Asumir que el orden de eventos en la UI refleja el orden real de ocurrencia — **siempre ordenar por `client_timestamp` (Event Sourcing)**, no por orden de llegada de sync ni por `created_at` del servidor, ya que la PWA puede enviar eventos desfasados al recuperar conexión.
- Olvidar crear un **índice GIN** para los campos clave dentro del JSONB (`player_id`, `minute`). Sin este índice, las consultas de estadísticas masivas colapsarán la base de datos a futuro.
