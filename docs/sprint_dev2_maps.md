# Sprint Plan - Desarrollador 2: Integración de Geocodificación y Mapas

## 1. Objetivo Principal
Permitir a los organizadores registrar las canchas físicas donde se jugarán los partidos utilizando Google Maps, guardando las coordenadas exactas para habilitar la analítica futura de "Uso de Espacios Públicos" y búsquedas de cercanía geográfica.

## 2. Entorno de Desarrollo y Archivos Afectados
- Frontend: apps/web-next/src/app/canchas/ (Next.js)
- Backend Core: backend/api/app/routers/cancha.py (FastAPI)

## 3. Desglose de Tareas Técnicas

### 3.1. Arquitectura de Geocodificación (Regla Estricta)
- Bloqueo Síncrono Prohibido: Se prohíbe conectar el backend de Python de manera síncrona a la API de Google Maps, para evitar la congelación de los hilos del servidor.
- Resolución Asíncrona Frontend: Toda conversión de direcciones (ej. de calle a Latitud/Longitud) debe ejecutarse 100% del lado del cliente en Next.js antes de disparar el formulario hacia la base de datos.

### 3.2. Módulo Visual de Búsqueda
- Integración de API: Implementar la librería de Autocomplete de Google Maps dentro del formulario de creación de Canchas en Next.js.
- Extracción de Coordenadas: Al seleccionar un lugar validado, el sistema debe parsear el objeto geometry.location (Latitud/Longitud) y extraer el identificador del Municipio correspondiente.

### 3.3. Recepción en Backend
- Adaptación de Modelos: Asegurar que el esquema Pydantic y el modelo SQLAlchemy de Cancha reciban y tipen correctamente las variables espaciales (lat y lng).
- Refactorización de Endpoints: Ajustar la creación de canchas para que reciba las coordenadas ya procesadas y validadas por el frontend.

## 4. Lineamientos y Prevención de Conflictos
- Gestión de Secretos: Jamás codificar las credenciales de la API de Google Maps en texto claro. Configurar exclusivamente mediante el archivo .env.local y variables de entorno seguras (NEXT_PUBLIC_GOOGLE_MAPS_API_KEY).
- Aislamiento de Trabajo: Su flujo de trabajo interactúa exclusivamente con los catálogos de Canchas y Municipios, garantizando independencia total respecto al Desarrollador 1 y 3.
