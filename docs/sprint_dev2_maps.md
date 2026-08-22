# Sprint Plan - Dev 2: Integración de Google Maps (Canchas)

## 📌 Objetivo
Permitir a los organizadores registrar las canchas físicas donde se jugarán los partidos utilizando Google Maps, guardando las coordenadas exactas para la futura analítica de "Uso de Espacios Públicos" y búsquedas de cercanía.

## 🛠️ Archivos y Entornos Principales
* **Frontend:** `apps/web-next/src/app/canchas/` (Next.js)
* **Backend:** `backend/api/app/routers/cancha.py` (FastAPI)

## 📋 Tareas Asignadas
1. **Configuración Asíncrona (Regla de AGENTS.md):**
   - **Prohibido:** No debes conectar el backend de Python directamente a la API de Google Maps de manera síncrona, ya que eso congelaría el servidor esperando la respuesta de Google.
   - **Solución:** La geocodificación (convertir "Av. Reforma 123" a Latitud/Longitud) debe hacerse **100% en el Frontend (Next.js)** antes de enviar el formulario.

2. **UI de Búsqueda de Mapas:**
   - Implementar la librería de Autocomplete de Google Maps en el formulario de creación de Canchas en Next.js.
   - Cuando el usuario elija un lugar, extraer el objeto `geometry.location` (Lat/Lng) y el nombre del Municipio.

3. **Backend de Coordenadas:**
   - Asegurarte de que el modelo `Cancha` en PostgreSQL reciba y guarde correctamente las coordenadas `lat` y `lng`.
   - Modificar el endpoint de creación de canchas para que reciba directamente las coordenadas ya procesadas desde el frontend.

## ⚠️ Puntos de Cuidado (Conflictos Potenciales)
* **Variables de Entorno:** Nunca hardcodees la API Key de Google Maps en el código. Usa `.env.local` y variables `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY`.
* **Aislamiento:** Trabajarás sobre los componentes de `Canchas` y `Municipios`. No chocarás con el Dev 1 ni con el Dev 3. Total independencia.
