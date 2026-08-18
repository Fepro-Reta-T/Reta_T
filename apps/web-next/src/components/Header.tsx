"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Header() {
  const router = useRouter();
  const [user] = useState<{ full_name: string; email: string } | null>(() => {
    if (typeof window !== "undefined") {
      const userStr = localStorage.getItem("user");
      return userStr ? JSON.parse(userStr) : null;
    }
    return null;
  });
  
  const [isInvitado] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("invitado") === "true";
    }
    return false;
  });
  
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("user");
    localStorage.removeItem("invitado");
    router.push("/");
  };

  const getInitials = (name: string | undefined | null) => {
    if (!name) return "?";
    return name
      .split(" ")
      .map((n) => n[0])
      .filter(Boolean)
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  return (
    <header className="w-full bg-card/50 backdrop-blur-md border-b border-secondary px-6 py-4 flex items-center justify-between sticky top-0 z-50">
      <Link href="/dashboard" className="flex items-center group">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img 
          src="/logo_completo.svg" 
          alt="Reta-T" 
          className="h-10 w-auto object-contain transition-transform group-hover:scale-105 dark:invert-0 invert" 
        />
      </Link>

      <div className="relative">
        {isInvitado ? (
          <div className="flex items-center gap-3">
            <Link 
              href="/login" 
              className="text-xs bg-primary hover:bg-primary-light text-primary-foreground px-3 py-1.5 rounded-lg font-bold transition-all"
            >
              Iniciar Sesión
            </Link>
            <div className="w-8 h-8 rounded-full bg-secondary border border-border flex items-center justify-center text-muted-foreground text-xs font-semibold select-none cursor-not-allowed" title="Invitado">
              👤
            </div>
          </div>
        ) : (
          <div>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="w-9 h-9 rounded-full bg-primary hover:bg-primary-light text-primary-foreground border border-primary/20 flex items-center justify-center text-sm font-extrabold cursor-pointer transition-all shadow-md hover:shadow-primary/10 select-none"
            >
              {user ? getInitials(user.full_name) : "U"}
            </button>

            {dropdownOpen && (
              <>
                {/* Overlay transparente para cerrar al hacer clic fuera */}
                <div 
                  className="fixed inset-0 z-40" 
                  onClick={() => setDropdownOpen(false)}
                />
                
                <div className="absolute right-0 mt-2 w-48 bg-card border border-border rounded-xl shadow-2xl p-2 z-50 animate-[slide-up_0.2s_ease-out]">
                  <div className="px-3 py-2 border-b border-secondary mb-1">
                    <p className="text-xs text-muted-foreground truncate">Usuario</p>
                    <p className="text-sm font-semibold text-foreground truncate">
                      {user ? user.full_name : "Usuario Reta-T"}
                    </p>
                  </div>
                  
                  <button
                    onClick={() => {
                      alert("Vista de perfil próximamente...");
                      setDropdownOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 text-sm text-foreground hover:bg-secondary rounded-lg transition-colors"
                  >
                    👤 Mi Perfil
                  </button>
                  
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50/5 rounded-lg transition-colors mt-1"
                  >
                    🚪 Cerrar Sesión
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
