# Sprint Plan - Dev 1: PWA de Arbitraje (Offline-First)

## 📌 Objetivo
Construir la herramienta de campo para los encargados de partido. Esta aplicación web progresiva permitirá registrar goles y asistencias en tiempo real, guardando los datos en caché si no hay internet y sincronizándolos posteriormente.

## 🛠️ Archivos y Entornos Principales
* **Frontend:** `apps/registro-pwa/` (React + Vite)
* **Backend:** `backend/api/app/routers/partido.py` y `sync.py`
* **Tipos Compartidos:** `packages/types/`

## 📋 Tareas Asignadas
1. **Asignación de Encargados (Backend & Next.js):**
   - Crear un endpoint en FastAPI para asignar un `match_manager_id` a un Partido existente.
   - En el Dashboard (`web-next`), agregar un botón simple para que el Organizador copie un "Enlace Mágico" o asigne a un usuario a un partido.

2. **UI de Captura (Registro PWA):**
   - Construir una pantalla de Partido Activo minimalista: dos botones gigantes para cada equipo (Gol, Tarjeta Amarilla, Tarjeta Roja).
   - Aplicar la regla de diseño: alto contraste, sin animaciones pesadas.

3. **Motor Offline y Sincronización:**
   - **Local:** Cada vez que el árbitro presiona "Gol", guardarlo en la base de datos local del navegador (IndexedDB) usando la skill `pwa-offline-sync`.
   - **Nube:** Crear un worker que, al recuperar el internet, tome todo el bloque de eventos de IndexedDB y lo dispare hacia el backend en un solo viaje (Batch payload).

## ⚠️ Puntos de Cuidado (Conflictos Potenciales)
* **Idempotencia:** Asegúrate de que el backend valide el `id` local generado por la PWA. Si la red parpadea y la PWA envía el gol dos veces, el backend debe ignorar el duplicado.
* **Aislamiento:** Tu trabajo casi no tocará Next.js, por lo que **no tendrás colisiones** con los Desarrolladores 2 y 3. Estás trabajando en una app paralela.
