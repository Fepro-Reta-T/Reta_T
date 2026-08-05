"use client"; // <--- ESTO ES CRUCIAL. Permite usar useState en el layout.

import type { Metadata } from "next";
import { useState, useEffect } from "react";
import "./globals.css";
import { MSWProvider } from "../components/MSWProvider";

// La metadata solo puede estar en un Server Component. 
// Al poner "use client", tenemos que sacar el objeto metadata de aquí.
// Usaremos un title por defecto en el HTML.

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [theme, setTheme] = useState<"light" | "dark">("dark");

  useEffect(() => {
    // Por defecto arrancamos en modo oscuro (como en tu Figma)
    document.documentElement.classList.add("dark");
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    document.documentElement.classList.remove("light", "dark");
    document.documentElement.classList.add(newTheme);
  };

  return (
    <html lang="es" className="h-full antialiased">
      <body className="min-h-full flex flex-col font-sans bg-background text-foreground transition-colors duration-300">
        
        {/* Botón de cambio de tema */}
        <div className="absolute top-4 right-4 z-50">
          <button
            onClick={toggleTheme}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-primary text-primary-foreground font-bold shadow-lg hover:opacity-90 transition-opacity"
          >
            {theme === "dark" ? "☀️ Claro" : "🌙 Oscuro"}
          </button>
        </div>

        {/* El contenido principal */}
        <MSWProvider>
          {children}
        </MSWProvider>
      </body>
    </html>
  );
}