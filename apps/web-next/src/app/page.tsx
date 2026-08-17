"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Home() {
  const router = useRouter();
  const [view, setView] = useState<"splash" | "roles">("splash");
  const [selectedRole, setSelectedRole] = useState<string | null>(null);

  const handleStart = () => {
    setView("roles");
  };

  const handleRoleSelect = (role: string) => {
    setSelectedRole(role);
  };

  const handleContinue = () => {
    if (selectedRole) {
      localStorage.setItem('userRole', selectedRole);
      router.push('/register');
    }
  };

  return (
    <main className="flex-1 flex flex-col min-h-screen bg-background text-foreground transition-colors duration-300">
      
      {/* PANTALLA 1: SPLASH / BIENVENIDA */}
      {view === "splash" && (
        <div className="flex-1 flex flex-col items-center justify-center p-8 space-y-10">
          <div className="flex justify-center">
            <img 
              src="/logo.png" 
              alt="Reta-T Logo" 
              className="w-64 h-auto max-w-full object-contain drop-shadow-xl"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
            <div className="text-4xl font-bold text-red-700">Reta-T</div>
          </div>

          <p className="text-lg text-muted-foreground text-center font-light tracking-wide">
            Pasión real, inteligencia viva
          </p>

          <button 
            onClick={handleStart}
            className="w-full max-w-xs py-4 rounded-full bg-primary hover:bg-primary-light text-primary-foreground font-bold text-lg shadow-lg shadow-primary/30 transition-all transform hover:scale-105 active:scale-95"
          >
            COMENZAR
          </button>
        </div>
      )}

      {/* PANTALLA 2: SELECCIÓN DE ROL */}
      {view === "roles" && (
        <div className="flex-1 flex flex-col items-center justify-center p-8">
          <div className="max-w-md w-full space-y-8">
            
            <div className="text-center flex justify-center mb-4">
              <div className="text-2xl font-bold text-red-700">Reta-T</div>
            </div>

            <div className="p-6 rounded-xl border bg-card text-card-foreground shadow-sm space-y-4">
              <h2 className="text-2xl font-bold text-foreground">¿Cuál es tu rol?</h2>
              <p className="text-sm text-muted-foreground">Selecciona cómo vas a usar Reta-T</p>
              
              <div className="space-y-3 pt-2">
                <button 
                  onClick={() => handleRoleSelect('organizador')}
                  className={`w-full p-4 rounded-lg text-left transition-all flex items-center gap-4 ${
                    selectedRole === 'organizador' 
                      ? 'bg-primary/10 border-2 border-primary' 
                      : 'bg-secondary hover:bg-secondary/80'
                  }`}
                >
                  <span className="text-2xl"></span>
                  <div>
                    <div className="font-semibold text-foreground">Organizador</div>
                    <div className="text-xs text-muted-foreground">Creo torneos, gestiono equipos y canchas</div>
                  </div>
                  {selectedRole === 'organizador' && (
                    <span className="ml-auto text-primary">✓</span>
                  )}
                </button>

                <button 
                  onClick={() => handleRoleSelect('encargado_campo')}
                  className={`w-full p-4 rounded-lg text-left transition-all flex items-center gap-4 ${
                    selectedRole === 'encargado_campo' 
                      ? 'bg-primary/10 border-2 border-primary' 
                      : 'bg-secondary hover:bg-secondary/80'
                  }`}
                >
                  <span className="text-2xl">📋</span>
                  <div>
                    <div className="font-semibold text-foreground">Encargado de campo</div>
                    <div className="text-xs text-muted-foreground">Registro partidos desde la cancha</div>
                  </div>
                  {selectedRole === 'encargado_campo' && (
                    <span className="ml-auto text-primary">✓</span>
                  )}
                </button>

                <button 
                  onClick={() => handleRoleSelect('municipio')}
                  className={`w-full p-4 rounded-lg text-left transition-all flex items-center gap-4 ${
                    selectedRole === 'municipio' 
                      ? 'bg-primary/10 border-2 border-primary' 
                      : 'bg-secondary hover:bg-secondary/80'
                  }`}
                >
                  <span className="text-2xl">🏛️</span>
                  <div>
                    <div className="font-semibold text-foreground">Municipio</div>
                    <div className="text-xs text-muted-foreground">Visualizo estadísticas de uso de espacios</div>
                  </div>
                  {selectedRole === 'municipio' && (
                    <span className="ml-auto text-primary">✓</span>
                  )}
                </button>
              </div>
            </div>

            <button 
              onClick={handleContinue}
              disabled={!selectedRole}
              className={`w-full py-4 rounded-xl font-bold text-lg shadow-lg transition-all ${
                selectedRole 
                  ? 'bg-primary hover:bg-primary-light text-primary-foreground shadow-primary/30 hover:scale-105' 
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              CONTINUAR
            </button>

            <div className="text-center text-sm text-muted-foreground">
              ¿Ya tienes cuenta?{" "}
              <Link href="/login" className="text-primary font-medium hover:underline">
                Iniciar sesión
              </Link>
            </div>
          </div>
        </div>
      )}

    </main>
  );
}