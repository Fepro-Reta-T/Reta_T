# Sprint Plan - Desarrollador 3: Gestión Avanzada de Equipos

## 1. Objetivo Principal
Transformar el módulo base de "Equipos" en un hub integral de administración donde capitanes y organizadores gestionen sus plantillas, evalúen su rendimiento histórico y apliquen métricas de control disciplinario. Todo el sistema debe operar optimizando las consultas para prevenir cuellos de botella en la base de datos.

## 2. Entorno de Desarrollo y Archivos Afectados
- Frontend: apps/web-next/src/app/equipos/ (Next.js)
- Backend Core: backend/api/app/routers/equipo.py y participante.py (FastAPI)

## 3. Desglose de Tareas Técnicas

### 3.1. Edición Integral y Restricciones Operativas
- Módulo CRUD Extendido: Proveer pantallas de administración para modificar el perfil del equipo (logotipos, esquemas de color corporativo, etc.).
- Seguridad por Capas: Bloquear estrictamente las modificaciones y eliminaciones para que únicamente los capitanes autenticados de su equipo o los administradores globales (Roles autorizados) puedan realizar transacciones destructivas.

### 3.2. Administración de Roster (Participantes)
- Formulario de Alta: Desarrollar la interfaz para registrar jugadores (Dorsal, Nombre, Posición).
- Diseño Híbrido: Alinear el registro con la regla de arquitectura del "Jugador Opcional": Inscribir temporalmente perfiles crudos bajo la entidad Participante sin requerir una cuenta (user_id opcional), posibilitando que estos jugadores asimilen su historial al registrarse en el futuro.

### 3.3. Historial Optimizado de Partidos
- Consultas Truncadas: Construir un endpoint (GET /equipos/{id}/partidos-recientes) que extraiga estrictamente los últimos 15 encuentros deportivos, ordenados cronológicamente.
- Prevención de Sobrecarga: Implementar obligatoriamente la restricción LIMIT 15 en la sentencia SQL para proteger la base de datos contra el escaneo ineficiente en equipos de larga trayectoria.

### 3.4. Implementación de Control Disciplinario
- Tabulador de Amonestaciones: Consultar la tabla de MatchEvents asociada al historial del equipo para cuantificar tarjetas rojas.
- Alertas Visuales: Incorporar notificaciones o distintivos de advertencia ("Jugador Suspendido") dentro del perfil del equipo que alerte visualmente al administrador de la liga de incumplimientos reglamentarios vigentes.

## 4. Lineamientos y Prevención de Conflictos
- Aislamiento de Trabajo: Su desarrollo se ejecuta integralmente dentro del hub de Equipos en el Dashboard, previniendo cualquier choque arquitectónico con el módulo cartográfico (Dev 2) y la aplicación offline (Dev 1).
