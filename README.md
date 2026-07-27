# Reta_T — Plataforma de Gestión Deportiva Amateur

**Reta_T** no es solo un gestor de torneos; es la fuente de inteligencia deportiva de una comunidad amateur. Este repositorio está organizado como un monorepo que gestiona el portal de administración, la aplicación de registro en tiempo real (PWA) y el conjunto de utilidades compartidas.

---

## 1. Estructura del Proyecto

El repositorio sigue una arquitectura de monorepo gestionado por `pnpm` y contenedores Docker para los servicios del backend:

```
reta-t/
├── apps/                  # Aplicaciones de Frontend
│   ├── web-next/          # Portal principal (Next.js) - Administradores, ligas, estadísticas
│   └── registro-pwa/      # Captura de eventos en cancha (Vite PWA, offline-first)
├── packages/              # Paquetes compartidos (¡Implementados!)
│   ├── types/             # Tipos y esquemas de datos TypeScript compartidos (@reta-t/types)
│   ├── api-client/        # Cliente HTTP unificado para consumir el backend (@reta-t/api-client)
│   └── ui/                # Componentes de diseño compartidos (@reta-t/ui)
├── backend/               # Backend en Python
│   └── api/               # API REST con FastAPI, SQLAlchemy y Alembic
│       ├── app/
│       │   ├── core/      # Configuración de base de datos y variables de entorno
│       │   ├── models/    # Modelos ORM (SQLAlchemy)
│       │   ├── repositories/ # Capa de acceso a datos
│       │   ├── routers/   # Endpoints de la API (ej: health check)
│       │   ├── schemas/   # Esquemas de validación (Pydantic)
│       │   └── services/  # Lógica de negocio centralizada
│       └── tests/         # Pruebas automatizadas (pytest)
├── docker-compose.yml     # Orquestación local para PostgreSQL y la API FastAPI
├── package.json           # Scripts de control del monorepo (pnpm)
├── pnpm-workspace.yaml    # Configuración de espacios de trabajo de pnpm
├── AGENTS.md              # Reglas globales de desarrollo para agentes de IA
└── GEMINI.md              # Configuración y overrides específicos para Antigravity
```

---

## 2. Tecnologías y Estado de Implementación

El proyecto ha completado de forma exitosa la **Fase 1 (Fundación)** y la integración inicial del monorepo:

### Backend (FastAPI)
* **Python 3.12-slim** y **FastAPI**: Lógica y endpoints REST.
* **SQLAlchemy 2.0** y **asyncpg**: ORM y driver asíncrono para PostgreSQL.
* **Alembic**: Manejo de migraciones de la base de datos (migraciones iniciales y de roles ya aplicadas).
* **PostgreSQL 16**: Base de datos relacional con soporte JSONB para el motor genérico de eventos deportivos (`Sport -> EventType -> MatchEvent`).
* **Endpoints implementados**:
  * **Salud**:
    * `/health`: Validación rápida del estado de la API.
    * `/health/db`: Validación de conectividad y estado de la base de datos (PostgreSQL).
  * **Autenticación y Usuarios (`/auth`)**:
    * `/auth/register` (POST): Registro de nuevos usuarios.
    * `/auth/login` (POST): Inicio de sesión y obtención de token JWT.
    * `/auth/me` (GET): Obtener información del usuario autenticado actual.

### Paquetes Compartidos (Monorepo)
* **`@reta-t/types`**: Define en TypeScript el modelo de roles (`Role` enum de 5 elementos) e interfaces de usuario/login equivalentes al backend.
* **`@reta-t/api-client`**: Proveedor de servicios HTTP usando la Fetch API nativa, con soporte para autorización JWT y mapeo de endpoints `/auth/*`.
* **`@reta-t/ui`**: Componentes de interfaz comunes. Incluye el componente flexible `Button` preparado para soportar los requerimientos de la PWA móvil offline (botones grandes `xl` de alto contraste) y la densidad de información de la Web.

### Frontend (Scaffolds y Conectividad)
* **Web App (Next.js)** en [apps/web-next](file:///c:/Users/Nestor/Documents/Proyecto/Reta_T/apps/web-next):
  * **Next.js 16.2** (React 19) estructurado bajo App Router.
  * **Tailwind CSS v4** para estilos rápidos.
  * Vinculado con dependencias de workspace locales (`@reta-t/*`).
* **Registro PWA (Vite)** en [apps/registro-pwa](file:///c:/Users/Nestor/Documents/Proyecto/Reta_T/apps/registro-pwa):
  * **Vite** con **React 19** y TypeScript.
  * Soporte offline-first mediante **vite-plugin-pwa**.
  * Vinculado con dependencias de workspace locales (`@reta-t/*`).

### Infraestructura y Monorepo
* **Docker Compose**: Levanta de forma local e independiente la base de datos y el contenedor de la API FastAPI.
* **pnpm Workspaces**: Configuración del monorepo para la orquestación y enlace de dependencias en `apps/*` y `packages/*`.
* **Scripts Centralizados**: Scripts de inicio en la raíz de `package.json` para facilitar el desarrollo local de ambos frontends.
* **CI/CD (GitHub Actions)**: Configuración en `.github/workflows/backend-tests.yml` para correr automáticamente las pruebas del backend (`pytest`) en cada commit o pull request.

---

## 3. Requisitos Previos

Asegúrate de tener instalado en tu máquina local:
* [Docker Desktop](https://www.docker.com/products/docker-desktop/)
* [Node.js](https://nodejs.org/) (versión LTS recomendada)
* [pnpm](https://pnpm.io/) (versión 9.x recomendada)

---

## 4. Guía de Inicio Rápido (Local)

### Paso 1: Configurar Variables de Envío
Copia el archivo de ejemplo para crear tu configuración local:
```bash
cp .env.example .env
```
*(Nota: Ajusta los valores de `.env` si es necesario, pero los valores por defecto sirven para desarrollo local con Docker)*.

### Paso 2: Levantar el Backend (API y Base de Datos)
Usa Docker Compose para construir y levantar los contenedores en segundo plano:
```bash
docker-compose up -d --build
```
Esto levantará:
* **Base de datos (PostgreSQL 16)** en `localhost:5432`
* **Backend API (FastAPI)** en `localhost:8000` con recarga automática (*hot-reload*) al modificar código de la carpeta `backend/api`.

Puedes validar que todo funciona correctamente accediendo a:
* Endpoint de Salud: [http://localhost:8000/health](http://localhost:8000/health)
* Validación de DB: [http://localhost:8000/health/db](http://localhost:8000/health/db)
* Documentación interactiva de la API (Swagger UI): [http://localhost:8000/docs](http://localhost:8000/docs)

### Paso 3: Instalar dependencias y Construir Paquetes Compartidos
Para instalar dependencias de Node.js en todo el monorepo ejecuta:
```bash
pnpm install
```

Antes de ejecutar las aplicaciones frontend, debes compilar los paquetes TypeScript compartidos:
```bash
# Compilar todos los paquetes compartidos
pnpm --filter "@reta-t/*" build
```

### Paso 4: Levantar Frontends
Una vez compilados los paquetes compartidos, podrás iniciar los servidores de desarrollo con los siguientes comandos en la raíz:
* **Next.js Web App**: `pnpm dev:web` (correrá en `http://localhost:3000`)
* **Registro PWA**: `pnpm dev:pwa` (correrá en `http://localhost:5173`)

*(Nota: Los frontends corren de forma nativa fuera de Docker a través de pnpm y se comunican con la API en `http://localhost:8000`)*.

---

## 5. Desarrollo asistido por Agentes de IA

Este repositorio incluye configuraciones detalladas para asistentes de IA como **Antigravity**, **Cursor** o **Claude Code** para asegurar consistencia en la arquitectura y evitar código redundante:

* **[AGENTS.md](file:///c:/Users/Nestor/Documents/Proyecto/Reta_T/AGENTS.md)**: Reglas compartidas del monorepo, principios de diseño (Complejidad en Backend, Offline-first en PWA, Modelo genérico Sport -> EventType -> MatchEvent) y el roadmap de fases.
* **[GEMINI.md](file:///c:/Users/Nestor/Documents/Proyecto/Reta_T/GEMINI.md)**: Overrides y reglas de ejecución automática en Turbo Mode específicos para Antigravity.
* **`.agent/rules/`**: Instrucciones específicas por tecnología (arquitectura, backend-fastapi, frontend-nextjs, pwa-vite, database, security, git-workflow).
* **`.agents/skills/`**: Habilidades cargadas bajo demanda por Antigravity para tareas complejas como:
  * `match-event-engine`: Antes de tocar el motor de eventos.
  * `pwa-offline-sync`: Para el motor de sincronización offline de la PWA.
  * `api-endpoint-scaffold`: Estructura para crear nuevos endpoints de backend.
  * `code-review-checklist`: Para revisar PRs alineado a las reglas.

