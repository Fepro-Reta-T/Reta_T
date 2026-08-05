"use client"; // Necesario para usar estados

import { useState } from "react";

export default function Home() {
  // Estado para controlar si estamos en la pantalla de inicio o en la de roles
  const [view, setView] = useState<"splash" | "roles">("splash");

  // Función para pasar a la siguiente pantalla
  const handleStart = () => {
    setView("roles");
  };

  return (
    <main className="flex-1 flex flex-col min-h-screen bg-background text-foreground transition-colors duration-300">
      
      {/* --- PANTALLA 1: SPLASH / BIENVENIDA --- */}
      {view === "splash" && (
        <div className="flex-1 flex flex-col items-center justify-center p-8 space-y-10">
          
          {/* El Logo Grande */}
          <div className="flex justify-center">
            {/* Asegúrate de que tu logo se llame 'logo.png' y esté en la carpeta 'public' */}
            <img 
              src="/logo.png" 
              alt="Reta-T Logo" 
              className="w-64 h-auto max-w-full object-contain drop-shadow-xl" 
            />
          </div>

          {/* Slogan */}
          <p className="text-lg text-muted-foreground text-center font-light tracking-wide">
            Pasión real, inteligencia viva
          </p>

          {/* Botón Principal (Rojo Vino) */}
          <button 
            onClick={handleStart}
            className="w-full max-w-xs py-4 rounded-full bg-primary hover:bg-primary-light text-primary-foreground font-bold text-lg shadow-lg shadow-primary/30 transition-all transform hover:scale-105 active:scale-95"
          >
            COMENZAR
          </button>
        </div>
      )}

      {/* --- PANTALLA 2: SELECCIÓN DE ROL (La que ya teníamos) --- */}
      {view === "roles" && (
        <div className="flex-1 flex flex-col items-center justify-center p-8">
          <div className="max-w-md w-full space-y-8">
            
            {/* Mini Logo o Título */}
            <div className="text-center flex justify-center mb-4">
              <img src="/logo.png" alt="Reta-T" className="w-20 h-auto object-contain" />
            </div>

            {/* Tarjeta de selección de rol */}
            <div className="p-6 rounded-xl border bg-card text-card-foreground shadow-sm space-y-4">
              <h2 className="text-2xl font-bold">¿Cuál es tu rol?</h2>
              <p className="text-sm text-muted-foreground">Selecciona cómo vas a usar Reta-T</p>
              
              <div className="space-y-3 pt-2">
                <button className="w-full p-4 rounded-lg bg-secondary hover:bg-secondary/80 text-left transition-colors flex items-center gap-4">
                  <span className="text-2xl">🏅</span>
                  <div>
                    <div className="font-semibold text-card-foreground">Organizador</div>
                    <div className="text-xs text-muted-foreground">Creo torneos, gestiono equipos y canchas</div>
                  </div>
                </button>

                <button className="w-full p-4 rounded-lg bg-secondary hover:bg-secondary/80 text-left transition-colors flex items-center gap-4">
                  <span className="text-2xl">📋</span>
                  <div>
                    <div className="font-semibold text-card-foreground">Encargado de campo</div>
                    <div className="text-xs text-muted-foreground">Registro partidos desde la cancha</div>
                  </div>
                </button>

                <button className="w-full p-4 rounded-lg bg-secondary hover:bg-secondary/80 text-left transition-colors flex items-center gap-4">
                  <span className="text-2xl">🏛️</span>
                  <div>
                    <div className="font-semibold text-card-foreground">Municipio</div>
                    <div className="text-xs text-muted-foreground">Visualizo estadísticas de uso de espacios</div>
                  </div>
                </button>
              </div>
            </div>

            <button className="w-full py-4 rounded-xl bg-primary hover:bg-primary-light text-primary-foreground font-bold text-lg shadow-lg shadow-primary/30 transition-all">
              CONTINUAR
            </button>

            <div className="text-center text-sm text-muted-foreground">
              ¿Ya tienes cuenta? <span className="text-primary font-medium cursor-pointer hover:underline">Iniciar sesión</span>
            </div>
          </div>
        </div>
      )}

    </main>
  );
}