# Reta_T — Plataforma de Gestión Deportiva Amateur

**Reta_T** no es solo un gestor de torneos; es la fuente de inteligencia deportiva de una comunidad amateur. Este repositorio está organizado como un monorepo que gestiona el portal de administración, la aplicación de registro en tiempo real (PWA) y el conjunto de utilidades compartidas.

---

## 1. Estructura del Proyecto

El repositorio sigue una arquitectura de monorepo gestionado por `pnpm` y contenedores Docker para los servicios del backend:

```
reta-t/
├── apps/                  # Aplicaciones de Frontend
│   ├── web-next/          # Portal principal (Next.js 16) - Organizadores, coaches, estadísticas
│   └── registro-pwa/      # Captura de eventos en cancha (Vite PWA, offline-first)
├── packages/              # Paquetes compartidos
│   ├── types/             # Tipos y esquemas de datos TypeScript compartidos (@reta-t/types)
│   ├── api-client/        # Cliente HTTP unificado para consumir el backend (@reta-t/api-client)
│   └── ui/                # Componentes de diseño compartidos (@reta-t/ui)
├── backend/               # Backend en Python
│   └── api/               # API REST con FastAPI, SQLAlchemy y Alembic
│       ├── alembic/       # Migraciones de base de datos
│       ├── tests/         # Tests de integración (pytest)
│       └── app/
│           ├── core/      # Configuración de base de datos y variables de entorno
│           ├── models/    # Modelos ORM (SQLAlchemy)
│           ├── repositories/ # Capa de acceso a datos
│           ├── routers/   # Endpoints de la API
│           ├── schemas/   # Esquemas de validación (Pydantic V2)
│           └── services/  # Lógica de negocio centralizada
├── docker-compose.yml     # Orquestación local para PostgreSQL y la API FastAPI
├── package.json           # Scripts de control del monorepo (pnpm)
├── pnpm-workspace.yaml    # Configuración de espacios de trabajo de pnpm
├── AGENTS.md              # Reglas globales de desarrollo para agentes de IA
└── GEMINI.md              # Configuración y overrides específicos para Antigravity
```

---

## 2. Tecnologías y Estado de Implementación

### Backend (FastAPI & PostgreSQL)

* **Python 3.13** y **FastAPI**: Lógica y endpoints REST.
* **SQLAlchemy 2.0** y **asyncpg**: ORM y driver asíncrono para PostgreSQL.
* **Alembic**: Migraciones de base de datos versionadas.
* **Pydantic V2**: Schemas de validación con `ConfigDict` (migración completa desde V1).
* **Endpoints implementados**:
  * `/health` y `/health/db`: Validación de estado y conectividad.
  * `/auth/register`, `/auth/login`, `/auth/me`, `/auth/me/onboarding`: Autenticación JWT y perfiles.
  * `/sports/`: Catálogo de deportes disponibles.
  * `/municipios/`: Gestión de municipios (solo `ADMIN`).
  * `/canchas/`: Gestión de canchas deportivas (CRUD, `ADMIN` u `ORGANIZER`).
  * `/torneos/`: Gestión de torneos con categorías y soporte de inscripciones.
  * `/equipos/`: Gestión de equipos y plantillas.
    * `POST /equipos/` — cualquier usuario autenticado puede crear.
    * `PUT` / `DELETE` — requieren rol `ADMIN` u `ORGANIZER`.
    * Validación de `sport_id` referenciado contra tabla `sports`.
* **Roles** (`RoleEnum`): `ADMIN`, `ORGANIZER`, `MATCH_MANAGER`, `PLAYER`, `VIEWER`.
* **Tests**: 21 tests de integración pasando (auth, canchas, municipios, equipos, roles).

### Frontend Portal (Next.js)

* **Next.js 16** (App Router), React 19, Turbopack.
* **Pantallas implementadas**:
  * Landing page, Login, Registro con selección de rol.
  * Onboarding post-registro.
  * **Dashboard del Coach**: Equipos Dirigidos + Torneos Activos en sección superior, exploración de comunidad (feed, canchas, equipos).
  * **Torneos**: listado en cards visuales con imagen de portada por deporte, vista de detalle con fixture y encuentros, inscripción de equipos.
  * **Equipos**: directorio con degradado del color oficial y disciplina visible, registro en 5 pasos (nombre → logo PNG → color → rama → deporte), gestión de plantilla con posiciones adaptadas por deporte.
  * **Plantilla por deporte** — posiciones con colores estándar:
    * Fútbol / Futsal: `POR` Naranja · `DEF` Amarillo · `MED` Verde · `DEL` Azul · `EXT` Azul claro
    * Basketball: `BASE` · `ESC` · `ALA` · `APO` · `PIV`
    * Voleibol: `COL` · `REM` · `CENT` · `LIB` · `OP`
    * Béisbol / Softball: `LAN` · `REC` · `INF` · `OUT` · `BD`
  * **Canchas**: listado y alta de canchas con municipio.
  * **Partidos**: listado de encuentros.

### Paquetes Compartidos

* **`@reta-t/types`**: Tipos TypeScript de `Equipo`, `Torneo`, `Cancha`, `User`, roles.
* **`@reta-t/api-client`**: Cliente HTTP unificado (Fetch API).
* **`@reta-t/ui`**: Componentes de diseño compartidos.

---

## 3. Principios de Arquitectura Obligatorios

1. **Responsabilidad única por app**: Next.js administra · PWA registra · FastAPI procesa. La complejidad vive siempre en el backend.
2. **Modelo genérico de eventos**: `Sport → EventType → MatchEvent` — nunca tablas específicas por deporte.
3. **Geocodificación asíncrona en el cliente**: Nunca bloquear endpoints FastAPI con llamadas síncronas a APIs de terceros.
4. **Offline-first en la PWA**: Registrar → guardar local → sincronizar → confirmar → eliminar cola. Cada evento tiene `client_event_id` único para idempotencia.
5. **Permisos por rol estático**: `require_role(...)` — sin lógica de ownership compleja en el backend para el MVP.

---

## 4. Requisitos Previos

* [Docker Desktop](https://www.docker.com/products/docker-desktop/)
* [Node.js](https://nodejs.org/) (LTS recomendado)
* [pnpm](https://pnpm.io/) (versión 9.x)
* [uv](https://github.com/astral-sh/uv) — gestor de entornos Python (para tests locales sin Docker)

---

## 5. Guía de Inicio Rápido (Local)

### Paso 1: Variables de entorno
```bash
cp .env.example .env
```

### Paso 2: Levantar Backend (API + Base de Datos)
```bash
docker-compose up -d --build
```
* **PostgreSQL 16** en `localhost:5432`
* **FastAPI** en `localhost:8000` — Swagger UI: [http://localhost:8000/docs](http://localhost:8000/docs)

### Paso 3: Instalar dependencias y construir paquetes
```bash
pnpm install
pnpm --filter "@reta-t/*" build
```

### Paso 4: Levantar frontends
```bash
pnpm dev:web   # http://localhost:3000
pnpm dev:pwa   # http://localhost:5173
```

### Paso 5: Correr tests del backend
```bash
cd backend/api
uv run pytest tests/ -v
```

---

## 6. Desarrollo asistido por Agentes de IA

Este repositorio incluye configuraciones detalladas para asistentes de IA como **Antigravity**, **Cursor** o **Claude Code**:

* **[AGENTS.md](AGENTS.md)**: Reglas compartidas del monorepo — arquitectura, stack, roles, roadmap y modelo de datos genérico.
* **[GEMINI.md](GEMINI.md)**: Overrides específicos de Antigravity — modo de trabajo, turbo mode, diseño.
* **`.agents/skills/`**: Habilidades cargadas bajo demanda:
  * `match-event-engine` — antes de crear/modificar `EventType` o `MatchEvent`
  * `pwa-offline-sync` — antes de tocar la cola offline de la PWA
  * `api-endpoint-scaffold` — al crear un nuevo endpoint FastAPI
  * `code-review-checklist` — al revisar un PR
