# Reta_T — Plataforma de Gestión Deportiva Amateur

**Reta_T** es la fuente de inteligencia deportiva de una comunidad amateur — pensada para la reta de calle y el torneo local de barrio. Este repositorio está organizado como un monorepo que gestiona el portal de administración, la aplicación de registro en tiempo real (PWA) y los paquetes compartidos entre ambas apps.

---

## 1. Estructura del Proyecto

El repositorio sigue una arquitectura de monorepo gestionado por `pnpm` y contenedores Docker para los servicios del backend:

```
reta-t/
├── apps/                  # Aplicaciones Frontend
│   ├── web-next/          # Portal principal (Next.js) - Administradores, ligas, estadísticas
│   └── registro-pwa/      # Captura de eventos en cancha (Vite PWA, offline-first)
├── packages/              # Paquetes compartidos (implementados)
│   ├── types/             # @reta-t/types — Role enum, User, AuthToken, payloads
│   ├── api-client/        # @reta-t/api-client — Cliente HTTP tipado con JWT
│   └── ui/                # @reta-t/ui — Componentes React compartidos (Button)
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

La **Fase 1 (Fundación)** está **completada**. El backend, la autenticación, los paquetes compartidos y los scaffolds de frontend están listos. La siguiente fase es **Ligas**.

### Backend (FastAPI)
* **Python 3.12-slim** y **FastAPI**: Lógica y endpoints REST.
* **SQLAlchemy 2.0** y **asyncpg**: ORM y driver asíncrono para PostgreSQL.
* **Alembic**: Manejo de migraciones de la base de datos (2 migraciones aplicadas: tabla `users` + actualización de roles).
* **PostgreSQL 16**: Base de datos relacional con soporte JSONB para el motor genérico de eventos deportivos (`Sport -> EventType -> MatchEvent`).
* **Seguridad**: Contraseñas hasheadas con bcrypt, tokens JWT con PyJWT, validación de entrada con Pydantic.
* **5 Roles del sistema**: `admin`, `organizer`, `match_manager`, `player`, `viewer`.
* **Endpoints implementados**:
  * **Salud**:
    * `GET /health`: Validación rápida del estado de la API.
    * `GET /health/db`: Validación de conectividad con PostgreSQL.
  * **Autenticación y Usuarios (`/auth`)**:
    * `POST /auth/register`: Registro de nuevos usuarios (valida email duplicado → 409).
    * `POST /auth/login`: Inicio de sesión y obtención de token JWT (valida usuario inactivo → 403).
    * `GET /auth/me`: Obtener información del usuario autenticado actual.
* **Tests**: 5 tests de integración con pytest (flujo completo, duplicados, contraseña incorrecta, sin token, roles).

### Paquetes Compartidos (`packages/`)
Evitan duplicación de código entre `web-next` y `registro-pwa`. Ambas apps los consumen vía `workspace:*`.

* **`@reta-t/types`**: Fuente de verdad TypeScript — `Role` enum (espejo exacto del backend Python), interfaces `User`, `RegisterPayload`, `LoginPayload`, `AuthToken`.
* **`@reta-t/api-client`**: Cliente HTTP tipado con soporte JWT. Funciones `register()`, `login()`, `me()`. Usa Fetch API nativa (sin dependencias externas). La URL base se configura por parámetro para soportar distintos entornos.
* **`@reta-t/ui`**: Componentes React compartidos. Incluye `Button` con variantes (`primary`, `secondary`, `danger`, `ghost`) y tamaños (`sm`, `md`, `lg`, `xl` para uso en cancha). Sin CSS embebido — cada app aplica sus propios estilos.

### Frontend (Scaffolds conectados)
* **Web App (Next.js)** en `apps/web-next`:
  * **Next.js 16.2** (React 19) estructurado bajo App Router.
  * **Tailwind CSS v4** para estilos rápidos.
  * TypeScript y ESLint preconfigurados.
  * Dependencias: `@reta-t/types`, `@reta-t/api-client`, `@reta-t/ui`.
* **Registro PWA (Vite)** en `apps/registro-pwa`:
  * **Vite** con **React 19** y TypeScript.
  * Soporte offline-first mediante **vite-plugin-pwa**.
  * Oxlint configurado.
  * Dependencias: `@reta-t/types`, `@reta-t/api-client`, `@reta-t/ui`.

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

### Paso 3: Instalar dependencias del Monorepo y levantar Frontends
Para instalar dependencias de Node.js en todo el monorepo ejecuta:
```bash
pnpm install
```
Una vez implementadas las aplicaciones, podrás iniciarlas con los siguientes comandos en la raíz:
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

