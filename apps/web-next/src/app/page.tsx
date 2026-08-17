"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Home() {
  const router = useRouter();
  const [step, setStep] = useState<"splash" | "auth" | "roles">("splash");
  const [selectedRole, setSelectedRole] = useState<string | null>(null);

  // Iniciar la transición del logo después de 1.8 segundos
  useEffect(() => {
    const timer = setTimeout(() => {
      setStep("auth");
    }, 1800);
    return () => clearTimeout(timer);
  }, []);

  const handleRoleSelect = (role: string) => {
    setSelectedRole(role);
  };

  const handleContinue = () => {
    if (selectedRole) {
      localStorage.setItem('userRole', selectedRole);
      localStorage.removeItem('invitado'); // Se registra, ya no es invitado
      router.push('/register');
    }
  };

  const handleGuestAccess = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    localStorage.setItem('invitado', 'true');
    router.push('/dashboard');
  };

  return (
    <main className="relative flex-1 flex flex-col min-h-screen bg-gradient-to-tr from-neutral-950 via-zinc-900 to-red-950/20 text-foreground overflow-hidden">
      
      {/* Elementos decorativos de fondo */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-red-900/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-red-900/10 blur-[120px] pointer-events-none" />

      {/* CONTENEDOR DEL LOGO ANIMADO */}
      <div className={`flex-1 flex flex-col items-center justify-center p-6 transition-all duration-1000 ease-out ${
        step === "splash" 
          ? "transform translate-y-0" 
          : "transform -translate-y-20 md:-translate-y-28 pt-8 flex-none justify-start"
      }`}>
        <div className={`transition-all duration-1000 ease-out ${
          step === "splash" 
            ? "scale-100 filter drop-shadow-[0_0_25px_rgba(153,27,27,0.4)]" 
            : "scale-60 md:scale-50"
        }`}>
          <img 
            src="/logo_completo.svg" 
            alt="Reta-T Logo" 
            className="w-48 h-48 md:w-64 md:h-64 object-contain animate-[logo-in_1.2s_ease-out]"
          />
        </div>
      </div>

      {/* CONTENEDOR DE LA TARJETA DE OPCIONES (SLIDE-UP) */}
      <div className={`w-full max-w-md mx-auto px-6 pb-12 transition-all duration-1000 cubic-bezier(0.16, 1, 0.3, 1) ${
        step === "splash" 
          ? "transform translate-y-96 opacity-0 pointer-events-none h-0 overflow-hidden" 
          : "transform translate-y-0 opacity-100"
      }`}>
        {step === "auth" && (
          <div className="bg-card/85 backdrop-blur-md rounded-2xl border border-border p-6 shadow-2xl space-y-6 animate-[slide-up_0.8s_ease-out]">
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-extrabold text-foreground tracking-tight">Bienvenido a Reta-T</h2>
              <p className="text-sm text-muted-foreground">La fuente de inteligencia deportiva de tu comunidad</p>
            </div>

            <div className="space-y-4 pt-2">
              <Link 
                href="/login" 
                className="block w-full py-4 rounded-xl bg-primary hover:bg-primary-light text-primary-foreground text-center font-bold shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] active:scale-95"
              >
                INICIAR SESIÓN
              </Link>
              
              <button 
                onClick={() => setStep("roles")}
                className="w-full py-4 rounded-xl border border-secondary bg-secondary/50 hover:bg-secondary text-foreground text-center font-bold transition-all hover:scale-[1.02] active:scale-95"
              >
                REGISTRARSE / CREAR CUENTA
              </button>

              <button 
                onClick={handleGuestAccess}
                className="w-full py-4 rounded-xl border border-border/80 bg-neutral-900/40 hover:bg-neutral-900/80 text-muted-foreground hover:text-foreground text-center font-bold transition-all hover:scale-[1.02] active:scale-95 text-sm"
              >
                EXPLORAR COMO INVITADO
              </button>
            </div>
          </div>
        )}

        {step === "roles" && (
          <div className="bg-card/85 backdrop-blur-md rounded-2xl border border-border p-6 shadow-2xl space-y-6 animate-[slide-up_0.6s_ease-out]">
            <div className="space-y-1">
              <h2 className="text-xl font-bold text-foreground">¿Cuál es tu rol?</h2>
              <p className="text-xs text-muted-foreground">Selecciona cómo vas a usar Reta-T</p>
            </div>

            <div className="space-y-3">
              <button 
                onClick={() => handleRoleSelect('organizador')}
                className={`w-full p-4 rounded-xl text-left transition-all flex items-center gap-4 border ${
                  selectedRole === 'organizador' 
                    ? 'bg-primary/10 border-primary shadow-lg shadow-primary/5' 
                    : 'bg-secondary/40 border-transparent hover:bg-secondary/80'
                }`}
              >
                <span className="text-2xl">🏆</span>
                <div>
                  <div className="font-semibold text-foreground text-sm">Organizador</div>
                  <div className="text-xs text-muted-foreground">Creo torneos, gestiono equipos y canchas</div>
                </div>
                {selectedRole === 'organizador' && (
                  <span className="ml-auto text-primary font-bold">✓</span>
                )}
              </button>

              <button 
                onClick={() => handleRoleSelect('encargado_campo')}
                className={`w-full p-4 rounded-xl text-left transition-all flex items-center gap-4 border ${
                  selectedRole === 'encargado_campo' 
                    ? 'bg-primary/10 border-primary shadow-lg shadow-primary/5' 
                    : 'bg-secondary/40 border-transparent hover:bg-secondary/80'
                }`}
              >
                <span className="text-2xl">📋</span>
                <div>
                  <div className="font-semibold text-foreground text-sm">Encargado de campo</div>
                  <div className="text-xs text-muted-foreground">Registro partidos desde la cancha</div>
                </div>
                {selectedRole === 'encargado_campo' && (
                  <span className="ml-auto text-primary font-bold">✓</span>
                )}
              </button>
            </div>

            <div className="flex gap-3 pt-2">
              <button 
                onClick={() => setStep("auth")}
                className="w-1/3 py-3 rounded-xl border border-secondary hover:bg-secondary/50 text-foreground font-bold transition-all active:scale-95 text-sm"
              >
                ATRÁS
              </button>
              <button 
                onClick={handleContinue}
                disabled={!selectedRole}
                className={`flex-1 py-3 rounded-xl font-bold transition-all active:scale-95 text-sm ${
                  selectedRole 
                    ? 'bg-primary hover:bg-primary-light text-primary-foreground shadow-lg shadow-primary/20' 
                    : 'bg-neutral-800 text-neutral-500 cursor-not-allowed'
                }`}
              >
                CONTINUAR
              </button>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}