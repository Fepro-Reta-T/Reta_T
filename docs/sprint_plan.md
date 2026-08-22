# Propuesta de Sprint Oficial: Árbitros, Mapas y Equipos

Con base en la visión operativa del proyecto, el siguiente sprint técnico se ejecutará dividiendo la fuerza de trabajo en **tres ejes fundamentales**, asegurando que cada desarrollador (Dev) posea un área de responsabilidad clara que no colisione con el resto del equipo.

---

## 1. Distribución de Tareas por Desarrollador

### Desarrollador 1: El Panel de Arbitraje (PWA de Cancha)
**Misión:** Construir la herramienta de campo que alimentará la plataforma con datos reales.
* **Maquetado UI (Vite):** Crear pantallas de alto contraste y botones grandes para registrar goles, asistencias y tarjetas (apto para uso exterior).
* **Motor Offline (IndexedDB):** Implementar la capacidad de registrar todos los eventos de un partido sin internet.
* **Sincronización:** Desarrollar la pasarela que envía en lote (y de forma idempotente) el acta del partido hacia FastAPI en cuanto el dispositivo recupere conexión.
* **Asignación de Partido (Apoyo):** Asegurar el mecanismo de login en la PWA para que el árbitro solo pueda visualizar y editar el partido que el Organizador le asignó.

### Desarrollador 2: Módulo de Canchas y Geocodificación (Google Maps)
**Misión:** Profesionalizar la logística geográfica de los torneos.
* **Integración Frontend (Next.js):** Incorporar un mapa interactivo (Google Maps API) en el formulario de registro de canchas para que el organizador coloque un pin exacto.
* **Resolución Geográfica:** Capturar la latitud/longitud y traducirla al municipio correspondiente.
* **Criterio Arquitectónico (AGENTS.md):** La consulta a la API externa (geocodificación) debe resolverse **100% asíncronamente en el frontend (Next.js)**. FastAPI solo debe recibir los datos limpios (coordenadas listas) para guardarlos, evitando bloquear los hilos del servidor de Python esperando a Google.

### Desarrollador 3: Gestión Avanzada de Equipos y Roster
**Misión:** Dar autonomía a los equipos y optimizar el rendimiento de la base de datos.
* **Administración de Plantilla:** Interfaz en Next.js para editar el perfil del equipo, así como dar de alta (registrar) o de baja (quitar) jugadores del roster oficial.
* **Analítica de Equipo:** Panel de estadísticas agregadas por equipo.
* **Historial Optimizado:** Implementar un carrusel o lista de resultados que muestre **estrictamente los últimos 15 partidos jugados**. 
* **Criterio Arquitectónico:** Las consultas a PostgreSQL (`torneo_repository.py`) deben incluir obligatoriamente la cláusula `.limit(15)` en el historial para evitar una sobrecarga de memoria cuando el torneo esté muy avanzado.

---

## 2. Propuestas Adicionales (Para redondear el Sprint)

Para que estas tres vías funcionen a la perfección sin generar huecos lógicos, propongo **dos requisitos transversales** que los desarrolladores deben tomar en cuenta al construir sus módulos:

1. **Permisos y Roles (Para el Dev 3):** Al habilitar que se puedan "editar equipos o quitar jugadores", es imperativo que el desarrollador implemente candados (validación de rol). Un jugador normal (`PLAYER`) no debería poder quitar a un compañero del equipo. Solo el "Capitán" (dueño del equipo) o el Organizador del torneo deben ver el botón de "Eliminar jugador".
2. **El Enlace de Asignación (Para el Dev 2 o 1):** Como la PWA está aislada, necesitamos que el Organizador en Next.js presione un botón en el fixture que diga "Asignar Árbitro" e ingrese el correo del encargado. Esto es indispensable para que el Dev 1 sepa qué partido mostrar cuando el árbitro inicie sesión en su teléfono.

---

## 3. Directrices de Calidad del Equipo
* Toda lógica compleja vive en **FastAPI**.
* Todo componente visual reciclable se extrae a `packages/ui`.
* **Zero Trust:** Nunca confíen en la validación del frontend. FastAPI debe volver a verificar que quien elimina a un jugador o registra una cancha realmente tiene el rol necesario.
