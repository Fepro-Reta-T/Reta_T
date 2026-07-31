# Reta_T — Plataforma de Gestión Deportiva Amateur

**Reta_T** no es solo un gestor de torneos; es la fuente de inteligencia deportiva de una comunidad amateur. Este repositorio está organizado como un monorepo que gestiona el portal de administración, la aplicación de registro en tiempo real (PWA) y el conjunto de utilidades compartidas.

---

## 1. Estructura del Proyecto

El repositorio sigue una arquitectura de monorepo gestionado por `pnpm` y contenedores Docker para los servicios del backend:

```
reta-t/
├── apps/                  # Aplicaciones de Frontend
│   ├── web-next/          # Portal principal (Next.js 16) - Administradores, ligas, estadísticas + MSW para desarrollo ágil
│   └── registro-pwa/      # Captura de eventos en cancha (Vite PWA, offline-first)
├── packages/              # Paquetes compartidos (¡Implementados!)
│   ├── types/             # Tipos y esquemas de datos TypeScript compartidos (@reta-t/types)
│   ├── api-client/        # Cliente HTTP unificado para consumir el backend (@reta-t/api-client)
│   └── ui/                # Componentes de diseño compartidos (@reta-t/ui)
├── backend/               # Backend en Python
│   └── api/               # API REST con FastAPI, SQLAlchemy y Alembic
│       ├── alembic/       # Migraciones de base de datos (0001, 0002, 0003_add_telefono)
│       └── app/
│           ├── core/      # Configuración de base de datos y variables de entorno
│           ├── models/    # Modelos ORM (SQLAlchemy) con soporte para roles y teléfono (OTP)
│           ├── repositories/ # Capa de acceso a datos
│           ├── routers/   # Endpoints de la API (health check, auth)
│           ├── schemas/   # Esquemas de validación (Pydantic)
│           └── services/  # Lógica de negocio centralizada
├── docker-compose.yml     # Orquestación local para PostgreSQL y la API FastAPI
├── package.json           # Scripts de control del monorepo (pnpm)
├── pnpm-workspace.yaml    # Configuración de espacios de trabajo de pnpm
├── AGENTS.md              # Reglas globales de desarrollo para agentes de IA
└── GEMINI.md              # Configuración y overrides específicos para Antigravity
```

---

## 2. Tecnologías y Estado de Implementación

El proyecto ha completado la **Fase 1 (Fundación)** e integraciones técnicas clave para soportar el **Paralelismo Ágil** en los siguientes sprints:

### Backend (FastAPI & PostgreSQL)
* **Python 3.12-slim** y **FastAPI**: Lógica y endpoints REST.
* **SQLAlchemy 2.0** y **asyncpg**: ORM y driver asíncrono para PostgreSQL.
* **Alembic**: Migraciones de base de datos (`0001_create_users_table`, `0002_update_role_enum`, `0003_add_telefono`).
* **Modelo `User`**: Incluye soporte para el campo `telefono` (único e indexado), dejando lista la estructura para el flujo de verificación OTP.
* **Endpoints implementados**:
  * `/health` y `/health/db`: Validación de estado y conectividad DB.
  * `/auth/register`, `/auth/login`, `/auth/me`: Autenticación con JWT.

### Paquetes Compartidos y Mocks (Monorepo)
* **`@reta-t/types`**: Define en TypeScript los roles (`Role` enum), esquemas de usuario y tipos compartidos.
* **`@reta-t/api-client`**: Cliente HTTP unificado usando la Fetch API nativa.
* **`@reta-t/ui`**: Componentes de interfaz comunes (botones de alto contraste para PWA, etc.).
* **MSW (Mock Service Worker)**: Instalado y configurado en `apps/web-next`. Permite al equipo de frontend maquetar las pantallas del Sprint 3 simulando respuestas de la API sin bloquearse esperando al backend.

### Frontend (Next.js & Vite PWA)
* **Web App (Next.js)** en [apps/web-next](file:///c:/Users/Nestor/Documents/Proyecto/Reta_T/apps/web-next): Next.js 16 (App Router), React 19, Tailwind CSS v4 y MSW Provider configurado para entorno de desarrollo.
* **Registro PWA (Vite)** en [apps/registro-pwa](file:///c:/Users/Nestor/Documents/Proyecto/Reta_T/apps/registro-pwa): Vite + React 19 con soporte offline-first.

---

## 3. Principios de Arquitectura Obligatorios

1. **Paralelismo Backend / Frontend:**
   * El desarrollo del Sprint 2 (Base de Datos) y Sprint 3 (Pantallas) se realiza de forma **100% paralela**. 
   * El frontend usa MSW (`src/mocks/handlers.ts`) para simular la API mientras el backend prepara las migraciones. Al terminar, simplemente se apaga MSW.
2. **Geocodificación Asíncrona en el Cliente:**
   * Nunca bloquear endpoints de FastAPI con llamadas síncronas a APIs de terceros.
   * La geocodificación (Google Maps lat/lng a Municipio) debe resolverse en el frontend (Next.js) antes de enviar el formulario a FastAPI.
3. **Event Sourcing y Módulos Offline:**
   * Los eventos de cancha generados en la PWA incluyen `client_event_id` (UUID para idempotencia) y **`client_timestamp`** (fuente de verdad absoluta para ordenar el historial independientemente de cuándo se recupere la conexión a internet).
4. **Optimización de Consultas JSONB:**
   * El modelo genérico `Sport -> EventType -> MatchEvent` exige **índices GIN** en PostgreSQL sobre las llaves más consultadas (`player_id`, `minute`) para garantizar estadísticas ultrarrápidas.

---

## 4. Requisitos Previos

Asegúrate de tener instalado en tu máquina local:
* [Docker Desktop](https://www.docker.com/products/docker-desktop/)
* [Node.js](https://nodejs.org/) (versión LTS recomendada)
* [pnpm](https://pnpm.io/) (versión 9.x recomendada)

---

## 5. Guía de Inicio Rápido (Local)

### Paso 1: Configurar Variables de Entorno
Copia el archivo de ejemplo para crear tu configuración local:
```bash
cp .env.example .env
```

### Paso 2: Levantar el Backend (API y Base de Datos)
Usa Docker Compose para construir y levantar los contenedores en segundo plano:
```bash
docker-compose up -d --build
```
Esto levantará:
* **Base de datos (PostgreSQL 16)** en `localhost:5432`
* **Backend API (FastAPI)** en `localhost:8000`

Acceso a documentación:
* Documentación interactiva (Swagger UI): [http://localhost:8000/docs](http://localhost:8000/docs)

### Paso 3: Instalar dependencias y Construir Paquetes Compartidos
```bash
pnpm install
pnpm --filter "@reta-t/*" build
```

### Paso 4: Levantar Frontends
* **Next.js Web App**: `pnpm dev:web` (correrá en `http://localhost:3000`)
* **Registro PWA**: `pnpm dev:pwa` (correrá en `http://localhost:5173`)

*(Nota: En modo desarrollo local, Next.js cargará MSW en el navegador mostrando en consola `[MSW] Mocking enabled`, permitiendo probar interfaces de usuario sin depender de endpoints activos).*

---

## 6. Desarrollo asistido por Agentes de IA

Este repositorio incluye configuraciones detalladas para asistentes de IA como **Antigravity**, **Cursor** o **Claude Code**:

* **[AGENTS.md](file:///c:/Users/Nestor/Documents/Proyecto/Reta_T/AGENTS.md)**: Reglas compartidas del monorepo, principios de diseño y roadmap de fases.
* **`.agents/skills/`**: Habilidades cargadas bajo demanda por agentes de IA para tareas complejas (`match-event-engine`, `pwa-offline-sync`, `api-endpoint-scaffold`, `code-review-checklist`).
