# GEMINI.md — Overrides específicos de Antigravity

Este archivo tiene prioridad más alta que `AGENTS.md` cuando hay conflicto, pero solo debe contener
comportamiento específico de Antigravity (Turbo Mode, artifacts, diseño). Las reglas de arquitectura,
stack y calidad viven en `AGENTS.md` y `.agent/rules/` — no las dupliques aquí.

## Idioma
- Responde siempre en español al equipo, salvo que se te pida código o docs en inglés explícitamente.

## Modo de trabajo (Plan → Execute → Verify)
- Antes de escribir código para cualquier tarea que toque más de un archivo, genera primero
  `implementation_plan.md` con: alcance, archivos a modificar, y una sección "Impacto en otras apps"
  (indica si el cambio afecta `packages/ui`, `packages/types` o `packages/api-client`).
- Divide `task.md` en subtareas de no más de ~1 hora de trabajo cada una.
- Al finalizar, genera `walkthrough.md` con un resumen de lo hecho y los archivos tocados.

## Turbo Mode — permisos por tipo de operación
Turbo Mode (ejecución automática sin pedir aprobación) está permitido SOLO para:
- Correr tests (`pytest`, `vitest`, `playwright test`)
- Lint y formato (`ruff`, `eslint --fix`, `prettier --write`)
- Instalar dependencias ya presentes en package.json/pyproject.toml (no agregar nuevas sin aprobación)

Turbo Mode está PROHIBIDO para:
- Migraciones de base de datos (incluso en desarrollo)
- Cualquier `DELETE`, `DROP`, o reseteo de datos
- Deploys o cambios de configuración en Vercel/infraestructura
- Cambios al modelo de datos genérico (Sport/EventType/MatchEvent)
- Instalar una librería o dependencia nueva que no esté ya declarada

Ante cualquier duda sobre si una operación es "segura", trátala como no-turbo y pide confirmación.

## Diseño (Next.js — Portal principal)
- Estilo: profesional y funcional, orientado a organizadores/ligas reales — no "premium/glassmorphism" por
  defecto. Prioriza densidad de información y legibilidad de datos (tablas, calendarios, estadísticas) sobre
  efectos visuales.
- La PWA de registro debe ser minimalista al extremo: máximo contraste, botones grandes (uso en cancha, con
  sol, con guantes/manos ocupadas), cero animaciones decorativas que retrasen la captura de un evento.

## Skills
- Antes de tocar el motor de eventos, la sincronización offline, crear un endpoint nuevo, o revisar un PR,
  revisa si existe una skill aplicable en `.agents/skills/` y cárgala.

## Archivos que NO debe tocar el agente sin pedir confirmación explícita
- `.env`, `.env.local`, cualquier archivo de secretos
- `packages/types` (cambios aquí rompen ambos frontends)
- Configuración de despliegue (Vercel, Docker, CI/CD)
