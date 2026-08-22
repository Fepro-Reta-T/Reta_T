# Sprint Plan - Desarrollador 1: Panel de Arbitraje (PWA)

## 1. Objetivo Principal
Construir la herramienta operativa para los encargados de partido en cancha. Esta aplicación web progresiva (PWA) debe permitir el registro de eventos de partido (goles, tarjetas rojas, asistencias) en tiempo real, priorizando el funcionamiento sin conexión a internet (Offline-First) mediante almacenamiento en caché local.

## 2. Entorno de Desarrollo y Archivos Afectados
- Frontend: Directorio apps/registro-pwa/ (React + Vite).
- Backend Core: Modificación de backend/api/app/routers/partido.py y creación de rutas de sincronización en sync.py.
- Ecosistema: Consumo de modelos en packages/types/.

## 3. Desglose de Tareas Técnicas

### 3.1. Asignación de Encargados (Backend y Dashboard)
- Endpoint de Asignación: Crear una ruta en FastAPI que permita vincular un match_manager_id (identificador de usuario) a un partido específico ya existente.
- Flujo Visual (Next.js): Proveer a los usuarios con rol de Organizador una interfaz simplificada en el dashboard para asignar encargados a los partidos de su torneo, generando los permisos temporales necesarios.

### 3.2. Interfaz de Captura en Cancha (Registro PWA)
- Diseño Funcional: Desarrollar la pantalla del partido activo. La regla de arquitectura exige minimalismo extremo: controles de gran tamaño e interacción rápida, sin animaciones ni elementos que dificulten su uso bajo luz solar directa.
- Modelo de Eventos: Asegurar que cada acción (ej. registrar un gol) se empaquete como un MatchEvent en memoria.

### 3.3. Motor de Sincronización y Persistencia Local
- Caché Offline: Implementar IndexedDB utilizando el módulo de sincronización (useSyncStore / skill pwa-offline-sync) para persistir los eventos localmente en el instante en que ocurren.
- Sincronización en Lote (Batch Sync): Programar el flujo para que, al detectar la recuperación de conectividad de red, la PWA tome la cola entera de eventos locales y la despache al backend en una sola petición.

## 4. Lineamientos y Prevención de Conflictos
- Idempotencia Obligatoria: El endpoint receptor en FastAPI debe verificar identificadores únicos de cliente para cada evento. Esto previene la duplicación de datos (goles repetidos) si ocurren intermitencias de red durante el envío del lote.
- Aislamiento de Trabajo: Su desarrollo reside primordialmente en la PWA y módulos backend aislados, asegurando nula fricción con los Desarrolladores 2 y 3.
