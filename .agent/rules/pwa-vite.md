# PWA de registro — Vite (apps/registro-pwa) — reglas detalladas

Complementa `AGENTS.md` §5 y `GEMINI.md` §Diseño. Ver también la skill `pwa-offline-sync` antes de tocar el motor de sincronización.

## Alcance — únicamente esto

Registrar eventos de un partido en curso, offline-first. Nada más. Si una tarea pide agregar cualquier pantalla, filtro, listado histórico o edición que no sea "capturar un evento del partido activo": **detente y pregunta** (regla explícita de `AGENTS.md` §1).

## Diseño obligatorio

- Máximo contraste.
- Botones grandes (se usa en cancha, con sol, con las manos ocupadas/guantes).
- Cero animaciones decorativas que retrasen la captura de un evento — la prioridad es velocidad de registro, no estética.

## Flujo offline obligatorio

```
1. Usuario registra evento
2. Se guarda en cola local (IndexedDB / storage local) con id único generado en el cliente
3. Se detecta conexión disponible
4. Se sincroniza contra backend/api
5. Backend confirma recepción
6. Se elimina el evento de la cola local
```

- El id generado en cliente viaja en cada evento para que el backend pueda deduplicar — un reintento de red **nunca** debe crear un evento duplicado (idempotencia).
- Un solo dispositivo autorizado por partido: la PWA debe manejar el caso de "este dispositivo ya no es el autorizado" (ej. el organizador reasignó el registro a otro dispositivo) sin perder datos ya en cola.

## Testing

- Simular pérdida de conexión (modo avión) como caso de test obligatorio en Playwright.
- Test de reintento/duplicación: enviar el mismo evento dos veces y verificar que el backend/la UI no lo dupliquen.
