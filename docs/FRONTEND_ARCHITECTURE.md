# Arquitectura y Guía de Diseño Frontend — Reta-T

Documento de referencia para la estructura visual, patrones de componentes y lineamientos de experiencia de usuario (UX/UI) del proyecto **Reta-T**.

---

## 🏛️ Estructura General del Monorepo Frontend

| Aplicación / Paquete | Tecnología | Propósito y Enfoque |
|----------------------|------------|----------------------|
| `apps/web-next` | Next.js (App Router) | Portal principal para usuarios, organizadores, coaches y espectadores. Paneles, directores, estadísticas y exploración. |
| `apps/registro-pwa` | Vite + PWA | Aplicación offline-first ultra ligera para la captura rápida de eventos de partido en cancha. |
| `packages/types` | TypeScript | Definiciones de tipos unificadas (User, Torneo, Equipo, Cancha, Role, EventType). |
| `packages/ui` | React + Tailwind | Biblioteca de componentes visuales compartidos entre frontends. |

---

## 🎨 Principios de Diseño Visual (`web-next`)

1. **Soporte Dual de Tema (Modo Claro y Modo Oscuro)**:
   - La plataforma cuenta con soporte nativo para **Modo Claro** y **Modo Oscuro** (mediante CSS Variables en `:root:not(.dark)` y `.dark`).
   - Todo componente debe usar clases semánticas de Tailwind (`bg-background`, `text-foreground`, `bg-card`, `border-secondary`) sin hardcodear colores fijos para que se adapte limpiamente a ambos temas.
   - En Modo Oscuro destaca el acento cálido corporativo (`#98493A`) sobre fondos neutros oscuros.

2. **Tipografía Alegre y Dinámica (Poppins / Outfit)**:
   - **Poppins** es la fuente oficial seleccionada para la interfaz (redondeada, vibrante, amigable y legible).
   - **Outfit** se utiliza para acentos geométricos y deportivos.

3. **Dashboard Resumen (Pattern de Tarjetas Cortas)**:
   - **Límite de elementos**: 2 a 3 tarjetas visibles por sección en la pantalla principal.
   - **Gradient Fade (Difuminado)**: Efecto visual tenue al final de las listas cuando hay más elementos disponibles.
   - **Navegación clara**: Botón secundario `"Mostrar más"` para ver el directorio completo + Botón primario de acción directa (`"+ Registrar equipo"`, `"+ Organizar torneo"`).

5. **Código de Colores Distintivo por Categoría/Rama**:
   - Cada categoría o rama de equipo/torneo debe identificarse con insignias (badges) de colores distintivos y bien contrastados:
     - 🟦 **Varonil**: Azul Cobalto (`bg-blue-500/15 text-blue-400 border-blue-500/30`)
     - 🟪 **Femenil**: Magenta / Rosa Cálido (`bg-pink-500/15 text-pink-400 border-pink-500/30`)
     - 🟩 **Mixto**: Esmeralda / Verde Menta (`bg-emerald-500/15 text-emerald-400 border-emerald-500/30`)
     - 🟨 **Libre / Juvenil / Sub-XX**: Ámbar / Dorado (`bg-amber-500/15 text-amber-400 border-amber-500/30`)

---

## ⚡ Reglas para Agentes de IA y Desarrolladores

- **Enfoque Principal Mobile-First (Teléfonos Móviles)**: Toda vista debe diseñarse y optimizarse **primariamente para dispositivos móviles** (smartphones). Las áreas táctiles deben ser amplias (mínimo 44px de altura/ancho), las listas deben navegarse sin esfuerzo con una sola mano y el diseño responsive en escritorio es una extensión expansiva de la experiencia móvil.
- **Cero Emojis en la UI**: Queda estrictamente **prohibido el uso de emojis** (ej. ⚽, 🏆, 📋, 👀) en componentes de producción, tarjetas o menús. Usar en su lugar iconografía vectorial profesional (SVG / Lucide Icons) o insignias tipográficas limpias.
- **Consulta previa de tipos**: Antes de agregar propiedades a componentes, verificar que existan en `packages/types`.
- **Manejo de estados vacíos (Empty States)**: Toda sección (Equipos, Torneos, Canchas) debe contar con una tarjeta vacía descriptiva si el arreglo contiene 0 elementos.
- **Fallbacks nativos**: No usar imágenes externas caídas o placeholders genéricos; generar iniciales con colores del club en su lugar.
- **Sin sobrecarga de información**: Evitar atiborrar tarjetas o tarjetas de resumen con datos excesivos; mostrar solo lo esencial y permitir profundizar mediante clics.
- **Menús y navegación espaciosos**: Mantener márgenes y espaciados generosos (`gap-4`, `p-6`) para que las opciones de menú y listas jamás se vean amontonadas o apretadas.
- **Botones con alta visibilidad**: Los llamados a la acción (CTA) primarios (`+ Registrar equipo`, `+ Organizar torneo`, `Guardar`, `Continuar`) deben destacar a simple vista con contrastes claros, tipografía bold y tamaños táctiles cómodos.
- **Validación en Modo Claro y Oscuro**: Probar siempre que cualquier elemento nuevo sea perfectamente visible y estético en ambos temas (Claro y Oscuro).


