# Reta_T — Plataforma de Gestión Deportiva Amateur

**Reta_T** no es solo un gestor de torneos; es la fuente de inteligencia deportiva de una comunidad amateur. Este repositorio está organizado como un monorepo que gestiona el portal de administración, la aplicación de registro en tiempo real (PWA) y el backend centralizado de lógica de negocio.

---

## 1. Estructura del Proyecto

El repositorio sigue una arquitectura de monorepo gestionado por `pnpm` y contenedores Docker para los servicios del backend:

```
reta-t/
├── apps/                  # Aplicaciones Frontend (Fases Futuras)
│   ├── web-next/          # Portal principal (Next.js) - Administradores, ligas, estadísticas
│   └── registro-pwa/      # Captura de eventos en cancha (Vite PWA, offline-first)
├── packages/              # Paquetes compartidos (Fases Futuras)
│   ├── ui/                # Componentes de diseño compartidos
│   ├── types/             # Tipos y esquemas de datos TypeScript compartidos
│   └── api-client/        # Cliente HTTP unificado para consumir el backend
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

Actualmente el proyecto se encuentra en la **Fase 1 (Fundación)** del roadmap:

### Backend (FastAPI)
* **Python 3.12-slim** y **FastAPI**: Lógica y endpoints REST.
* **SQLAlchemy 2.0** y **asyncpg**: ORM y driver asíncrono para PostgreSQL.
* **PostgreSQL 16**: Base de datos relacional con soporte JSONB para el motor genérico de eventos deportivos (`Sport -> EventType -> MatchEvent`).
* **Endpoints implementados**:
  * `/health`: Validación rápida del estado de la API.
  * `/health/db`: Validación de conectividad y estado de la base de datos (PostgreSQL).

### Infraestructura y Monorepo
* **Docker Compose**: Levanta de forma local e independiente la base de datos y el contenedor de la API FastAPI.
* **pnpm Workspaces**: Configuración del monorepo para las aplicaciones cliente.

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

