# Frontend Architecture & UI Guidelines — Reta-T

Este documento establece las reglas universales de diseño, estructura y experiencia de usuario (UX/UI) para las aplicaciones frontend de **Reta-T** (`apps/web-next` y `apps/registro-pwa`). Todo desarrollador (humano o agente de IA) debe seguir estos lineamientos sin excepción.

---

## 1. Separación de Responsabilidades por App

- **`apps/web-next` (Portal Principal)**:
  - **Objetivo**: Administración, exploración de la comunidad, gestión de equipos/torneos, estadísticas y dashboards.
  - **Estilo**: Oscuro moderno, limpio y profesional. Densidad de información equilibrada, sin saturar con elementos innecesarios.
  - **Identidad visual**: Fondo oscuro neutro con acentos en degradados cálidos (paleta principal `#98493A`), tarjetas con bordes suaves (`rounded-3xl`, `border-secondary`) y tipografía clara.

- **`apps/registro-pwa` (Captura de Campo)**:
  - **Objetivo**: Registro exclusivo de eventos de partido en tiempo real (goles, tarjetas, faltas, asistencia).
  - **Estilo**: Ultra-minimalista, alto contraste, botones gigantes optimizados para uso en cancha con sol directo y operación rápida con una mano.
  - **Cero distracciones**: Sin menús secundarios, banners ni animaciones pesadas.

---

## 2. Patron de Diseño para el Dashboard (`web-next`)

Para mantener el Dashboard intuitivo, limpio y fácil de navegar, se establece el siguiente patrón de **Resumen Contextual**:

### Estructura de Secciones (Equipos, Torneos, Canchas)
1. **Vista previa corta**: Muestra **máximo 2 a 3 tarjetas** por sección.
2. **Efecto Gradient Fade (Difuminado)**:
   - Si existen más elementos de los que se muestran en pantalla (ej. más de 2 equipos/torneos), la lista debe incluir un difuminado suave inferior (`bg-gradient-to-t from-background via-background/60 to-transparent`) que sugiera visualmente que la lista continúa.
3. **Barra de Acciones Inferior**:
   - Cada sección termina con sus acciones principales alineadas en la parte inferior:
     - Botón secundario: **"Mostrar más (N)"** o **"Mostrar todos"** (redirige al directorio completo).
     - Botón primario: **"+ Registrar equipo"** / **"+ Organizar torneo"** (acción directa).

---

## 3. Manejo de Botones y Permisos de Acción

- **Autenticados vs. Invitados**:
  - Los botones de creación (`+ Registrar equipo`, `+ Organizar torneo`) son visibles para los usuarios autenticados según sus permisos de backend.
  - Los usuarios **Invitados** ven un banner informativo o botones que los invitan a iniciar sesión/registrarse.
- **Acciones directas sin intermediarios**:
  - Evitar selectores de rol visuales o pestañas de "Modo Coach / Modo Jugador" innecesarias.
  - El sistema detecta dinámicamente los datos del usuario y le otorga acceso a sus acciones sin requerir una selección previa de rol en pantalla.

---

## 4. Estándares de Código Frontend

- **Reutilización obligatoria (`packages/`)**:
  - Los tipos de datos compartidos residen en `packages/types`.
  - El cliente HTTP de API reside en `packages/api-client` (o `lib/api`).
  - Componentes UI globales (Layouts, Navbars, Modales) residen en `packages/ui` o `src/components`.
---

## 5. Legibilidad, Espaciado, Tipografía y Temas

- **Diseño Mobile-First (Énfasis en Smartphones)**:
  - Todo componente y vista debe diseñarse y probarse **primariamente en dispositivos móviles** (ancho de 360px a 430px).
  - Los elementos interactivos deben contar con áreas táctiles (touch targets) cómodas de al menos 44px de altura. La versión de escritorio es una extensión adaptativa de la experiencia móvil.
- **Soporte Dual de Tema (Modo Claro y Modo Oscuro)**:
  - La aplicación cuenta con conmutación nativa de temas (Claro y Oscuro).
  - Todo componente nuevo debe usar variables semánticas de Tailwind (`bg-background`, `text-foreground`, `bg-card`, `border-secondary`) y probarse en ambos modos.
- **Tipografía Oficial (Poppins / Outfit)**:
  - La fuente principal recomendada para la interfaz es **Poppins** (redondeada, alegre, vibrante y muy legible).
  - Se utiliza **Outfit** para acentos deportivos.
- **Cero sobrecarga de información**:
  - Cada sección debe presentar únicamente los datos principales y esenciales para evitar saturar visualmente al usuario.
  - La información detallada se descubre progresivamente al hacer clic en un elemento (patrón *Progressive Disclosure*).
- **Menús y contenedores espaciosos (Sin amontonar)**:
  - Mantener espaciados generosos (`gap-4`, `p-6`, `space-y-6`) entre elementos y dentro de los bloques de menú.
  - Evitar colocar botones de acción pegados a títulos o textos explicativos si esto genera una sensación de saturación.
- **Prohibido el uso de Emojis decorativos**:
  - No utilizar emojis (ej. ⚽, 🏆, 📋, 👀) en componentes de producción, tarjetas o botones. Usar en su lugar iconografía vectorial limpia (SVG / Lucide) o insignias tipográficas.
- **Sistema Semántico de Colores por Categoría**:
  - **Varonil**: Azul Cobalto (`bg-blue-500/15 text-blue-400 border-blue-500/30`)
  - **Femenil**: Magenta / Rosa Cálido (`bg-pink-500/15 text-pink-400 border-pink-500/30`)
  - **Mixto**: Esmeralda / Verde Menta (`bg-emerald-500/15 text-emerald-400 border-emerald-500/30`)
  - **Libre / Juvenil**: Ámbar / Dorado (`bg-amber-500/15 text-amber-400 border-amber-500/30`)



