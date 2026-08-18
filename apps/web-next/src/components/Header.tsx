"use client";

import { useState, useEffect } from "react";
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
  const [isDark, setIsDark] = useState(true);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const theme = localStorage.getItem("theme");
      const isDarkMode = theme !== "light";
      setIsDark(isDarkMode);
      if (isDarkMode) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    }
  }, []);

  const toggleTheme = () => {
    const nextDark = !isDark;
    setIsDark(nextDark);
    if (nextDark) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("user");
    localStorage.removeItem("invitado");
    router.push("/");
  };

  const getInitials = (name: string | undefined | null) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map((n) => n[0])
      .filter(Boolean)
      .slice(0, 2)
      .join("")
      .toUpperCase();
  };

  return (
    <header className="w-full bg-card/70 backdrop-blur-md border-b border-secondary px-6 py-4 flex items-center justify-between sticky top-0 z-50 transition-colors">
      <Link href="/dashboard" className="flex items-center group">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/logo_completo.svg"
          alt="Reta-T"
          className="h-10 w-auto object-contain transition-transform group-hover:scale-105 dark:invert-0 invert"
        />
      </Link>

      <div className="relative flex items-center gap-3">
        {isInvitado ? (
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-xs bg-primary hover:bg-primary-light text-primary-foreground px-3 py-1.5 rounded-xl font-bold transition-all"
            >
              Iniciar Sesión
            </Link>
            
            <button
              type="button"
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="w-9 h-9 rounded-full bg-secondary border border-border flex items-center justify-center text-muted-foreground text-xs font-bold transition-colors cursor-pointer"
              title="Perfil de Invitado"
            >
              I
            </button>
          </div>
        ) : (
          <div>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="w-9 h-9 rounded-full bg-primary hover:bg-primary-light text-primary-foreground border border-primary/30 flex items-center justify-center text-sm font-black cursor-pointer transition-all shadow-md select-none"
            >
              {user ? getInitials(user.full_name) : "U"}
            </button>
          </div>
        )}

        {/* Dropdown del Perfil */}
        {dropdownOpen && (
          <>
            {/* Overlay para cerrar al hacer clic fuera */}
            <div
              className="fixed inset-0 z-40"
              onClick={() => setDropdownOpen(false)}
            />

            <div className="absolute right-0 top-11 w-56 bg-card border border-secondary rounded-2xl shadow-2xl p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="px-3 py-2.5 border-b border-secondary mb-1">
                <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">
                  {isInvitado ? "Modo Invitado" : "Usuario Conectado"}
                </p>
                <p className="text-sm font-bold text-foreground truncate">
                  {user ? user.full_name : "Invitado"}
                </p>
              </div>

              {/* Botón Switch Modo Oscuro / Claro */}
              <div
                onClick={toggleTheme}
                className="flex items-center justify-between px-3 py-2.5 text-xs font-bold text-foreground hover:bg-secondary/60 rounded-xl transition-colors cursor-pointer select-none"
              >
                <span className="flex items-center gap-2">
                  <svg
                    className="w-4 h-4 text-primary"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                    />
                  </svg>
                  <span>Modo Oscuro</span>
                </span>

                {/* Switch estético */}
                <div
                  className={`w-9 h-5 rounded-full p-0.5 transition-colors ${
                    isDark ? "bg-primary" : "bg-secondary border border-border"
                  }`}
                >
                  <div
                    className={`w-4 h-4 rounded-full bg-white transition-transform ${
                      isDark ? "translate-x-4" : "translate-x-0"
                    }`}
                  />
                </div>
              </div>

              {!isInvitado && (
                <>
                  <button
                    onClick={() => {
                      alert("Vista de perfil próximamente...");
                      setDropdownOpen(false);
                    }}
                    className="w-full text-left px-3 py-2.5 text-xs font-bold text-foreground hover:bg-secondary/60 rounded-xl transition-colors flex items-center gap-2"
                  >
                    <svg
                      className="w-4 h-4 text-muted-foreground"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                      />
                    </svg>
                    <span>Mi Perfil</span>
                  </button>

                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-3 py-2.5 text-xs font-bold text-red-600 hover:bg-red-500/10 rounded-xl transition-colors flex items-center gap-2 mt-1 border-t border-secondary/50 pt-2"
                  >
                    <svg
                      className="w-4 h-4 text-red-600"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                      />
                    </svg>
                    <span>Cerrar Sesión</span>
                  </button>
                </>
              )}
            </div>
          </>
        )}
      </div>
    </header>
  );
}
