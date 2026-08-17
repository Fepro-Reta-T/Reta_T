"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { canchasApi, equiposApi, torneosApi, authApi } from "@/lib/api";
import AppLayout from "@/components/AppLayout";

interface UserProfile {
  full_name: string;
  role: string;
  datos_adicionales?: Record<string, any> | null;
}

export default function DashboardPage() {
  const [stats, setStats] = useState({ canchas: 0, equipos: 0, torneos: 0 });
  const [loading, setLoading] = useState(true);
  const [isInvitado, setIsInvitado] = useState(false);
  const [user, setUser] = useState<UserProfile | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsInvitado(localStorage.getItem("invitado") === "true");
    }
    cargarDatos();
  }, []);

  async function cargarDatos() {
    try {
      const [canchas, equipos, torneos] = await Promise.all([
        canchasApi.listar(),
        equiposApi.listar(),
        torneosApi.listar(),
      ]);
      setStats({ canchas: canchas.length, equipos: equipos.length, torneos: torneos.length });

      // Intentar cargar perfil (puede fallar si es invitado)
      try {
        const perfil = await authApi.me();
        setUser(perfil as UserProfile);
      } catch {
        // invitado, no hay sesión
      }
    } catch (error) {
      console.error("Error al cargar dashboard:", error);
    } finally {
      setLoading(false);
    }
  }

  const isOrganizer = user?.role === "organizer" || user?.role === "admin";

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Buenos días";
    if (hour < 18) return "Buenas tardes";
    return "Buenas noches";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <AppLayout>
      <div className="p-4 md:p-8 pb-8 max-w-5xl mx-auto">

        {/* Saludo */}
        <div className="mb-8">
          <p className="text-muted-foreground text-sm">{greeting()},</p>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">
            {user ? user.full_name.split(" ")[0] : "Bienvenido"}
          </h1>
          {user && (
            <span className="inline-flex items-center gap-1.5 mt-1 px-2.5 py-0.5 rounded-full bg-primary/15 text-primary text-xs font-medium capitalize">
              <span className="w-1.5 h-1.5 rounded-full bg-primary" />
              {user.role === "organizer" ? "Organizador" :
               user.role === "match_manager" ? "Árbitro" :
               user.role === "player" ? "Jugador" :
               user.role === "viewer" ? "Visualizador" : user.role}
            </span>
          )}
        </div>

        {/* Cards de Estadísticas */}
        <div className="grid grid-cols-3 gap-3 md:gap-4 mb-8">
          {[
            { label: "Torneos", value: stats.torneos, icon: "🏆", href: "/torneos", color: "from-amber-500/10 to-amber-500/5 border-amber-500/20" },
            { label: "Equipos", value: stats.equipos, icon: "🛡️", href: "/equipos", color: "from-blue-500/10 to-blue-500/5 border-blue-500/20" },
            { label: "Canchas", value: stats.canchas, icon: "📍", href: "/canchas", color: "from-emerald-500/10 to-emerald-500/5 border-emerald-500/20" },
          ].map((card) => (
            <Link
              key={card.label}
              href={card.href}
              className={`bg-gradient-to-br ${card.color} border rounded-2xl p-4 md:p-5 hover:scale-[1.02] transition-transform`}
            >
              <div className="text-2xl mb-2">{card.icon}</div>
              <p className="text-3xl font-bold text-foreground">{card.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{card.label}</p>
            </Link>
          ))}
        </div>

        {/* Acciones rápidas — solo para organizadores */}
        {isOrganizer && !isInvitado && (
          <div className="mb-8">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">Acciones Rápidas</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { href: "/torneos/nuevo", label: "+ Nuevo Torneo", sub: "Crea una liguilla o bracket" },
                { href: "/partidos", label: "+ Nuevo Partido", sub: "Programa un partido" },
                { href: "/canchas/nueva", label: "+ Nueva Cancha", sub: "Registra una cancha" },
              ].map((action) => (
                <Link
                  key={action.href}
                  href={action.href}
                  className="bg-card border border-secondary hover:border-primary/50 rounded-2xl p-4 transition-all group"
                >
                  <p className="font-semibold text-foreground group-hover:text-primary transition-colors">{action.label}</p>
                  <p className="text-xs text-muted-foreground mt-1">{action.sub}</p>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Últimos torneos */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Torneos Recientes</h2>
            <Link href="/torneos" className="text-xs text-primary hover:underline">Ver todos</Link>
          </div>
          {stats.torneos === 0 ? (
            <div className="bg-card border border-dashed border-secondary rounded-2xl p-8 text-center">
              <div className="text-4xl mb-3">🏆</div>
              <p className="text-muted-foreground text-sm">
                {isInvitado
                  ? "Inicia sesión para ver los torneos de tu comunidad."
                  : isOrganizer
                  ? "No tienes torneos aún. ¡Crea el primero!"
                  : "Aún no hay torneos registrados."}
              </p>
              {isOrganizer && !isInvitado && (
                <Link href="/torneos/nuevo" className="mt-4 inline-block px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary-light transition-colors">
                  Crear Torneo
                </Link>
              )}
            </div>
          ) : (
            <Link href="/torneos" className="bg-card border border-secondary rounded-2xl p-4 flex items-center justify-between hover:border-primary/50 transition-colors">
              <span className="text-foreground font-medium">Ver los {stats.torneos} torneos</span>
              <span className="text-muted-foreground">→</span>
            </Link>
          )}
        </div>

        {/* Banner Invitado */}
        {isInvitado && (
          <div className="mt-8 p-5 rounded-2xl border border-primary/30 bg-primary/5 text-center">
            <p className="text-sm text-muted-foreground mb-3">
              Estás explorando como <strong>Invitado</strong>. Crea una cuenta para organizar torneos y equipos.
            </p>
            <div className="flex justify-center gap-4">
              <Link href="/login" className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary-light transition-colors">
                Iniciar Sesión
              </Link>
              <Link href="/" className="px-4 py-2 border border-secondary text-foreground rounded-lg text-sm hover:border-primary/50 transition-colors">
                Registrarse
              </Link>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}