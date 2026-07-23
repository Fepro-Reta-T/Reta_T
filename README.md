# Reta_T

Plataforma para la organización y gestión de torneos deportivos locales: administración de ligas, equipos y miembros, y registro en tiempo real —incluso sin conexión— de los eventos de cada partido para llevar estadísticas y resultados actualizados.

## Estado del proyecto

🚧 En configuración inicial. Ya están definidas las reglas de arquitectura y del agente de IA (ver más abajo); el desarrollo de código todavía no arrancó.

## Stack (planeado)

| Parte | Tecnología |
|---|---|
| Panel de administración | Next.js + TypeScript |
| App de registro de partidos (offline-first) | Vite (PWA) |
| Backend / lógica de negocio | FastAPI (Python) |
| Base de datos | PostgreSQL |

Monorepo: los tres proyectos y los paquetes compartidos (`types`, `ui`, `api-client`) van a convivir en este mismo repositorio.

## Organización del equipo

Repositorio de la organización [`Fepro-Reta-T`](https://github.com/Fepro-Reta-T), equipo de 4 desarrolladores. El flujo de trabajo (ramas, commits, revisión de PR) está definido en `.agent/rules/git-workflow.md`.

## Configuración de Antigravity — instrucciones de instalación

Este repo usa [Antigravity](https://antigravity.google/) como agente de IA de desarrollo, con reglas y skills propias del proyecto.

### 1. Ubicación de los archivos

Ya están en la raíz del repo, tal cual Antigravity los espera:

```
Reta_T/
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

### 2. Se commitean, no se ignoran

Estos archivos van al repositorio para que los 4 desarrolladores usen exactamente las mismas reglas. Se tratan como código: cambios a `AGENTS.md`, `GEMINI.md` o `.agent/rules/` pasan por PR y revisión del equipo, igual que cualquier cambio de arquitectura.

Si alguien usa además Cursor o Claude Code, `AGENTS.md` ya es compatible con ambos — no hace falta duplicar reglas.

### 3. Reglas anidadas por carpeta (opcional)

Si en el futuro necesitan reglas específicas de una sola app (ej. `apps/registro-pwa/AGENTS.md`), se activa en Antigravity: *Settings → Agent → Load nested AGENTS.md files*.

### 4. Cómo se cargan las skills

Antigravity solo lee `name` y `description` de cada `SKILL.md` al iniciar. El contenido completo se carga recién cuando el pedido del usuario coincide con esa descripción, para no inflar el contexto con las 4 skills en cada mensaje.

### 5. Mantenimiento

- Revisar `AGENTS.md` y `GEMINI.md` mensualmente, o cuando el proyecto avance de fase en el roadmap.
- La tabla de esquemas de `metadata` en `match-event-engine/SKILL.md` se actualiza cada vez que se agrega un `EventType` nuevo.
- Si el equipo empieza a usar MCP servers (Postgres, Git, etc.), documentar en `GEMINI.md` qué operaciones están permitidas en Turbo Mode, con el mismo criterio que ya se usa para operaciones destructivas.

## Cómo contribuir

1. Revisar `AGENTS.md` y la regla relevante en `.agent/rules/` antes de empezar.
2. Rama desde `main`: `feat/<descripcion>` o `fix/<descripcion>`.
3. Commits en formato [Conventional Commits](https://www.conventionalcommits.org/).
4. PR contra `main` usando la plantilla — requiere al menos 1 aprobación antes de mergear.

Más detalle en `.agent/rules/git-workflow.md`.

## Roadmap

El orden de fases del proyecto está documentado en `AGENTS.md` — no se implementa funcionalidad de una fase futura sin que esté explícitamente pedida.
