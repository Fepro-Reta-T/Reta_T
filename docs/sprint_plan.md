# 🚀 Propuesta de Próximo Sprint y Arquitectura: Panel de Arbitraje

Este documento establece los lineamientos técnicos y los objetivos para el siguiente ciclo de desarrollo de la plataforma **Reta-T**, de acuerdo a nuestro roadmap oficial (`AGENTS.md`).

---

## 📍 1. Contexto y Estado Actual

Acabamos de consolidar exitosamente la gestión administrativa en `apps/web-next`. Actualmente, el sistema es capaz de:
* Inscribir equipos y formar ligas.
* Generar fixtures (calendarios) automáticamente o manualmente.
* Simular y visualizar el avance de torneos (Tablas de Posiciones y Bracket de Liguilla) de forma interactiva.
* Consultar relaciones complejas desde PostgreSQL a través de FastAPI.

**El cuello de botella actual:** La plataforma genera partidos, pero en el mundo real necesitamos que el personal en cancha registre los goles, tarjetas y asistencias en tiempo real, muchas veces **sin conexión a internet**.

---

## 🎯 2. Objetivos del Nuevo Sprint

El objetivo principal de este sprint es construir el **Puente Operativo** entre los administradores de liga y el personal de cancha, enfocándonos en el **Desarrollo del Panel de Arbitraje (PWA)**.

### Hito 1: Quick-Wins de Seguridad (Next.js)
Antes de saltar a la PWA, debemos blindar el Dashboard administrativo:
* **Restricción de UI:** Ocultar acciones destructivas (ej. el botón "Eliminar equipo") en el perfil del equipo para usuarios con rol `PLAYER` o invitados.
* **Mecanismo:** Envolver componentes con validaciones estáticas `require_role(ORGANIZER, ADMIN)`.

### Hito 2: Asignación de Encargados (Backend -> Next.js)
Construir el flujo para delegar la administración de un partido:
* El Organizador visualizará el Fixture en Next.js.
* Podrá seleccionar un partido y asignar a un usuario (por email o link mágico) como `MATCH_MANAGER` (Árbitro/Encargado).
* Esta es la pieza clave que le dará permiso a un árbitro para ver un partido específico en su aplicación móvil.

### Hito 3: La PWA de Arbitraje (Vite + React)
El núcleo del sprint. La `apps/registro-pwa` debe construirse con una filosofía estricta de **"Captura Rápida Offline-First"**.

* **UI Minimalista Extrema:** Pantallas con alto contraste y botones gigantes (pensado para usarse bajo el sol, con guantes, o corriendo). Cero animaciones pesadas.
* **Modelo Genérico `MatchEvent`:** No alteraremos el marcador directamente. Cada gol o tarjeta se registrará como un evento en la tabla `MatchEvent`, apuntando a un `EventType` (definido en `packages/types`). 
* **Sincronización Offline:** 
  1. El encargado abre la app (descargada en su teléfono).
  2. Pierde conexión a internet en la cancha.
  3. Registra eventos (Goles). La app los guarda en caché local (`IndexedDB`).
  4. Al recuperar conexión, el motor de sincronización (basado en la skill `pwa-offline-sync`) envía los eventos en lote a FastAPI.
  5. FastAPI valida la idempotencia (evita contar el mismo gol dos veces si hay micro-cortes) y confirma la recepción.
  6. La PWA elimina la cola local.

---

## 🏗️ 3. Directrices Arquitectónicas para el Equipo

Para evitar colisiones de código y deudas técnicas, todo el equipo debe apegarse a estas reglas inquebrantables durante el sprint:

> [!CAUTION]
> **Responsabilidad Única por App**
> * **Next.js** = Administra, visualiza y configura.
> * **PWA** = SOLO captura eventos de partido. *Si una tarea agrega funcionalidad a la PWA que no sea "registrar partido", se está violando la arquitectura.*
> * **FastAPI** = Posee TODA la complejidad y lógica de negocio. Ni Next ni la PWA deben reimplementar cálculos.

> [!IMPORTANT]
> **Ecosistema de Paquetes (`packages/`)**
> No dupliques código. Si la PWA y Next.js necesitan hablar de "Partidos" o usar un "Botón Principal":
> * Los modelos de datos TS van en `packages/types`.
> * Los clientes de llamadas API van en `packages/api-client`.
> * Los botones, modales genéricos e inputs van en `packages/ui`.

> [!NOTE]
> **Modelo de Asistencia Opcional**
> Al registrar asistencia en la PWA, el encargado puede anotar jugadores por nombre crudo si no tienen cuenta en el sistema (el `user_id` en la base de datos es opcional). En fases futuras del roadmap, permitiremos que esos jugadores "reclamen" su historial al crear su cuenta.

---

## 📋 4. Siguientes Pasos (Checklist)

- [ ] Aprobar y mergear los PRs pendientes del Dashboard.
- [ ] Implementar el control de roles para el botón "Eliminar Equipo" en Next.js.
- [ ] Desarrollar endpoint en FastAPI para asignar `MATCH_MANAGER` a un partido.
- [ ] Levantar el cascarón visual de `apps/registro-pwa` (Pantalla de partido activo).
- [ ] Programar la lógica IndexedDB y la cola de `MatchEvent` en la PWA.
