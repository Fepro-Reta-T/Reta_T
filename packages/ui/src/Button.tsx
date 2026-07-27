import React from "react";

type ButtonVariant = "primary" | "secondary" | "danger" | "ghost";

/**
 * Tamaños disponibles:
 *   sm  → web-next (tablas, formularios inline)
 *   md  → web-next (acciones principales)
 *   lg  → uso general
 *   xl  → PWA de registro (uso en cancha, con sol, con guantes — GEMINI.md §Diseño)
 */
type ButtonSize = "sm" | "md" | "lg" | "xl";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Muestra indicador de carga y deshabilita el botón automáticamente. */
  isLoading?: boolean;
}

/**
 * Componente base compartido entre web-next y registro-pwa.
 *
 * Sin estilos embebidos — la variante y el tamaño se exponen como atributos
 * data-variant y data-size para que cada app los estilice desde su CSS global.
 *
 * Ejemplo de uso en web-next:
 *   <Button variant="primary" size="md" onClick={handleSubmit}>Guardar</Button>
 *
 * Ejemplo de uso en PWA:
 *   <Button variant="primary" size="xl" isLoading={saving}>Registrar gol</Button>
 */
export function Button({
  variant = "primary",
  size = "md",
  isLoading = false,
  disabled,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      data-variant={variant}
      data-size={size}
      disabled={disabled ?? isLoading}
      aria-busy={isLoading}
      {...props}
    >
      {isLoading ? <span aria-hidden="true">Cargando…</span> : children}
    </button>
  );
}
