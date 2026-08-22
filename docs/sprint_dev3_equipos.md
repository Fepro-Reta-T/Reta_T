# Sprint Plan - Dev 3: Gestión Avanzada de Equipos

## 📌 Objetivo
Convertir el módulo de "Equipos" de una simple entidad a un verdadero hub de administración donde los dueños de equipo (capitanes) y organizadores puedan modificar su alineación, analizar su desempeño y ver su historial de partidos recientes sin afectar el rendimiento global de la BD.

## 🛠️ Archivos y Entornos Principales
* **Frontend:** `apps/web-next/src/app/equipos/` (Next.js)
* **Backend:** `backend/api/app/routers/equipo.py` y `participante.py` (FastAPI)

## 📋 Tareas Asignadas
1. **Edición Completa del Equipo (CRUD):**
   - Habilitar pantalla de edición para cambiar logotipo, colores hexadecimales y nombre.
   - Restringir la edición y la opción de "Borrar Equipo" estrictamente a usuarios con el rol adecuado o que sean creadores/dueños del equipo (Capitanes) vs Organizadores.

2. **Roster / Plantilla de Jugadores (`Participante`):**
   - Permitir registrar jugadores (con número de dorsal, posición y nombre).
   - Como propone la arquitectura: Registrar a los jugadores primero como `Participantes` crudos (asistencia sin cuenta). Dejar el modelo preparado para que en el futuro un usuario real reclame este perfil (`user_id`).

3. **Historial de Partidos (Limitado a 15):**
   - Desarrollar un endpoint en backend `GET /equipos/{id}/partidos-recientes` que devuelva **solo** los últimos 15 partidos jugados por este equipo ordenados por fecha.
   - Este límite estricto en la consulta SQL (`LIMIT 15`) prevendrá la saturación de memoria de la base de datos cuando los equipos acumulen decenas de partidos históricos.

4. **Propuesta Adicional (Control Disciplinario):**
   - Agregar una pequeña tabla de suspensiones en el perfil del equipo. Si en el historial se acumulan tarjetas rojas para un participante de este equipo, mostrar una alerta de "Jugador Suspendido" que sirva visualmente al organizador de la liga.

## ⚠️ Puntos de Cuidado (Conflictos Potenciales)
* **Dependencias Visuales:** Trabajarás sobre los componentes de UI del Dashboard de Equipos, lo que no interfiere con los mapas (Dev 2) ni con la aplicación móvil (Dev 1). 
* Todo este módulo puede desarrollarse de principio a fin en completo aislamiento.
