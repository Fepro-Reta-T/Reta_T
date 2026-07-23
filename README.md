# Configuración de Antigravity — Instrucciones de instalación

## 1. Ubicación de los archivos
Copia toda esta estructura a la **raíz del repositorio** (el monorepo), tal cual está:

```
tu-repo/
├── AGENTS.md
├── GEMINI.md
├── .agent/
│   └── rules/
│       ├── architecture.md
│       ├── backend-fastapi.md
│       ├── frontend-nextjs.md
│       ├── pwa-vite.md
│       ├── database.md
│       ├── security.md
│       └── git-workflow.md
└── .agents/
    └── skills/
        ├── match-event-engine/SKILL.md
        ├── pwa-offline-sync/SKILL.md
        ├── api-endpoint-scaffold/SKILL.md
        └── code-review-checklist/SKILL.md
```

## 2. Commitear a Git
Estos archivos deben ir al repositorio (no a `.gitignore`), para que los 4 desarrolladores usen exactamente
las mismas reglas. Trátalos como código: cambios a `AGENTS.md`, `GEMINI.md` o a `.agent/rules/` deberían pasar
por PR y revisión del equipo, igual que cualquier otro cambio de arquitectura.

Si algún desarrollador usa además Cursor o Claude Code, `AGENTS.md` ya es compatible con ambos — no hace
falta duplicar reglas.

## 3. Activar "Load nested AGENTS.md files" (opcional)
Si en el futuro quieren reglas específicas por carpeta (ej. `apps/registro-pwa/AGENTS.md` con reglas que solo
apliquen ahí), actívenlo en Antigravity: **Settings → Agent → Load nested AGENTS.md files**.

## 4. Cómo se cargan las skills
Antigravity solo lee la metadata (`name` y `description`) de cada `SKILL.md` al iniciar. El contenido completo
de la skill se carga en el contexto solo cuando el pedido del usuario coincide con su descripción — así el
contexto no se infla con las 4 skills en cada mensaje.

## 5. Mantenimiento
- Revisen `AGENTS.md` y `GEMINI.md` mensualmente, o cuando el proyecto avance de fase en el roadmap.
- La tabla de esquemas de `metadata` dentro de `match-event-engine/SKILL.md` debe actualizarse cada vez que
  se agregue un `EventType` nuevo — es la parte que más se desactualiza si no se disciplinan con esto.
- Si el equipo empieza a usar MCP servers (Postgres, Git, etc.), documenten en `GEMINI.md` qué operaciones de
  esos MCP están permitidas en Turbo Mode y cuáles no, siguiendo el mismo criterio que ya usamos para
  operaciones destructivas.
