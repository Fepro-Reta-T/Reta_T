# Propuesta de Próximo Sprint y Arquitectura: Panel de Arbitraje

Este documento establece los lineamientos técnicos y los objetivos para el siguiente ciclo de desarrollo de la plataforma Reta-T, conforme a las directrices de arquitectura del proyecto (AGENTS.md).

## 1. Contexto y Estado Actual

Se ha consolidado exitosamente la gestión administrativa en `apps/web-next`. Actualmente, el sistema permite:
* Inscribir equipos y estructurar ligas.
* Generar fixtures (calendarios de partidos) automatizados.
* Simular y visualizar el avance de torneos mediante Tablas de Posiciones y Brackets de Liguilla.
* Gestionar relaciones de base de datos desde PostgreSQL a través de FastAPI.

**Limitante actual:** La plataforma requiere el puente operativo hacia el personal en cancha para registrar eventos (goles, amonestaciones, asistencias) en tiempo real, considerando escenarios sin conexión a internet.

## 2. Objetivos del Nuevo Sprint

El objetivo principal es construir el Panel de Arbitraje (PWA), permitiendo la captura de eventos de partido offline-first y la delegación de roles de encargado en cancha.

### Hito 1: Parches de Seguridad (Next.js)
Blindar el Dashboard administrativo mediante la restricción de acciones destructivas (ej. eliminación de equipos), asegurando que únicamente los roles `ORGANIZER` o `ADMIN` tengan acceso a estas interfaces mediante validaciones estáticas.

### Hito 2: Asignación de Encargados (Conexión Next.js y FastAPI)
Establecer el flujo de delegación operativa:
* Permitir al Organizador visualizar el Fixture y asignar un usuario (mediante enlace o selección) como `MATCH_MANAGER` de un partido específico.
* Otorgar permisos condicionales de escritura al usuario asignado exclusivamente para el periodo de ese partido.

### Hito 3: PWA de Arbitraje (Vite + React)
Construir el núcleo de captura en `apps/registro-pwa` bajo una arquitectura estricta de "Captura Rápida Offline-First".
* **Diseño Funcional:** Interfaz de alto contraste, botones de gran tamaño e interacciones mínimas para uso bajo estrés y luz solar directa.
* **Modelo Genérico (MatchEvent):** Registrar cada evento a nivel de log (Sport -> EventType -> MatchEvent) sin mutar directamente marcadores agregados.
* **Sincronización:** Guardar eventos en almacenamiento local (IndexedDB) durante el modo offline y despachar en lote hacia FastAPI al recuperar conectividad, utilizando validación de idempotencia en backend.

## 3. Distribución de Tareas (Para equipo de 3 Desarrolladores)

El trabajo de este sprint se puede paralelizar de manera eficiente asignando responsabilidades específicas por dominio de aplicación:

### Desarrollador 1: Backend Core (FastAPI y PostgreSQL)
Responsable de la lógica de negocio, bases de datos y sincronización.
* **Seguridad:** Implementar los endpoints y dependencias de autorización (`require_role`) para restringir la eliminación de entidades.
* **Asignación de Roles:** Crear los endpoints para asociar un `user_id` temporalmente como `match_manager_id` de un `Partido`.
* **Motor de Sincronización:** Desarrollar el endpoint receptor del lote de eventos offline. Implementar la validación de idempotencia para ignorar duplicados por microcortes de red.

### Desarrollador 2: Dashboard Administrativo (Next.js y UI)
Responsable del portal principal y la experiencia de los organizadores.
* **Refactorización de Roles UI:** Ocultar condicionalmente los botones y vistas destructivas (como borrar un equipo) basándose en los permisos del usuario activo.
* **Interfaz de Delegación:** Desarrollar el flujo visual sobre el Fixture para que el organizador envíe enlaces mágicos o asigne directamente a los encargados de cancha de los partidos.
* **Dependencias:** Utilizar e iterar sobre los componentes preexistentes en `packages/ui` y consumir los endpoints desarrollados por el Desarrollador 1 mediante `packages/api-client`.

### Desarrollador 3: Motor Offline en Cancha (Registro PWA Vite)
Responsable exclusivo de la experiencia de arbitraje y captura de datos en móviles.
* **Maquetado UI:** Construir el cascarón visual de la pantalla activa de un partido (marcadores, botones de eventos) siguiendo la regla de minimalismo y alto contraste.
* **Motor Local (IndexedDB):** Implementar la cola de eventos local y la persistencia de sesión del encargado en cancha sin conexión a red (apoyándose en la skill `pwa-offline-sync`).
* **Capa de Envío:** Integrar un service worker o un listener de estado de red (`useSyncStore`) que despache automáticamente la cola de `MatchEvent` hacia el endpoint de sincronización cuando detecte conexión, eliminando la cola al recibir confirmación HTTP 200.

## 4. Directrices Arquitectónicas Críticas

* **Responsabilidad Única por App:** Next.js configura y visualiza; la PWA registra en cancha de manera offline; FastAPI procesa y consolida.
* **Reutilización:** Modelos y tipos TypeScript deben radicar estrictamente en `packages/types`. Las implementaciones de red deben consumir `packages/api-client`. Todo componente visual compartido debe extraerse a `packages/ui`.
