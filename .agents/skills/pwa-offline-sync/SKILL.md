---
name: pwa-offline-sync
description: Usar antes de tocar la cola offline o el motor de sincronización de la PWA de registro. Cubre el flujo registrar → guardar local → sincronizar → confirmar → eliminar, y las reglas de idempotencia.
---

# Sincronización offline — registro-pwa

## Flujo obligatorio (no alterar sin discutirlo)

1. Usuario registra un evento en la UI.
2. Se guarda de inmediato en la cola local (IndexedDB), con un `client_event_id` (UUID) generado en el dispositivo.
3. Se detecta conexión disponible (listener de `online`/`offline` + verificación real contra el backend, no solo `navigator.onLine`).
4. Se envía a `backend/api` incluyendo el `client_event_id`.
5. El backend confirma recepción (200/201) o informa duplicado (200 con flag "ya existía", no error).
6. Solo al confirmar, se elimina el evento de la cola local. Si no hay confirmación, permanece en cola para el próximo intento.

## Idempotencia

- El `client_event_id` es la clave de deduplicación en el backend (constraint único).
- Un reintento de red (timeout, reconexión) reenvía el mismo `client_event_id` — el backend debe responder éxito sin crear un segundo `MatchEvent`.
- La UI nunca debe generar un nuevo id al reintentar el mismo evento; reintenta con el id original.

## Un solo dispositivo autorizado por partido

- Si el dispositivo pierde la autorización (el organizador reasignó el registro a otro dispositivo), la PWA debe:
  - Avisar claramente al usuario.
  - Mantener la cola local sin perder eventos ya capturados y no sincronizados.
  - No permitir nuevos registros hasta reautorización.

## Checklist antes de dar por cerrada una tarea acá

- [ ] Probado en modo avión: registrar 2-3 eventos, reconectar, verificar que lleguen todos y sin duplicados.
- [ ] Probado reintento manual del mismo evento (simular timeout) → no debe duplicar.
- [ ] Verificado que la cola sobrevive a un refresh/cierre de la PWA antes de sincronizar.
