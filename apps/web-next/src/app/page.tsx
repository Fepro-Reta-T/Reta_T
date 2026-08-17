"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Home() {
  const router = useRouter();
  const [step, setStep] = useState<"splash" | "auth">("splash");

  // Iniciar la transición del logo después de 1.8 segundos
  useEffect(() => {
    const timer = setTimeout(() => {
      setStep("auth");
    }, 1800);
    return () => clearTimeout(timer);
  }, []);

  const handleGuestAccess = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    localStorage.setItem('invitado', 'true');
    router.push('/dashboard');
  };

  return (
    <main className="relative flex-1 flex flex-col min-h-screen bg-gradient-to-tr from-black via-black to-[#98493A]/25 text-foreground overflow-hidden">
      
      {/* Elementos decorativos de fondo */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-[#98493A]/15 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-[#98493A]/15 blur-[120px] pointer-events-none" />

      {/* CONTENEDOR CENTRAL DE TRANSICIÓN CRUZADA */}
      <div className="flex-1 flex items-center justify-center p-6 relative">
        
        {/* LOGO CON SHIMMER (SE DESVANECE SUAVEMENTE) */}
        <div className={`transition-all duration-1000 ease-out absolute ${
          step === "splash" 
            ? "opacity-100 scale-100 pointer-events-auto" 
            : "opacity-0 scale-90 pointer-events-none"
        }`}>
          <div className="relative overflow-hidden rounded-3xl p-4 filter drop-shadow-[0_0_30px_rgba(152,73,58,0.45)]">
            <img 
              src="/logo_completo.svg" 
              alt="Reta-T Logo" 
              className="w-48 h-48 md:w-64 md:h-64 object-contain animate-[logo-in_1.2s_ease-out]"
            />
            {/* Brillo Metálico Animado */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 translate-x-[-150%] animate-[shine_2s_infinite_ease-in-out_0.6s]" />
          </div>
        </div>

        {/* TARJETA DE AUTENTICACIÓN (FUNDO EN EL MISMO LUGAR) */}
        <div className={`w-full max-w-md transition-all duration-1000 cubic-bezier(0.16, 1, 0.3, 1) ${
          step === "splash" 
            ? "opacity-0 scale-95 pointer-events-none absolute" 
            : "opacity-100 scale-100 relative pointer-events-auto"
        }`}>
          {step === "auth" && (
            <div className="bg-card/85 backdrop-blur-md rounded-2xl border border-border p-6 shadow-2xl space-y-6">
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
                
                <Link 
                  href="/register"
                  className="block w-full py-4 rounded-xl border border-secondary bg-secondary/50 hover:bg-secondary text-foreground text-center font-bold transition-all hover:scale-[1.02] active:scale-95"
                >
                  REGISTRARSE / CREAR CUENTA
                </Link>

                <button 
                  onClick={handleGuestAccess}
                  className="w-full py-4 rounded-xl border border-border/80 bg-neutral-900/40 hover:bg-neutral-900/80 text-muted-foreground hover:text-foreground text-center font-bold transition-all hover:scale-[1.02] active:scale-95 text-sm"
                >
                  EXPLORAR COMO INVITADO
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}