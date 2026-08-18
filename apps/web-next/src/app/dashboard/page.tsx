"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { canchasApi, equiposApi, torneosApi, authApi } from "@/lib/api";
import type { Torneo, Cancha, Equipo } from "@reta-t/types";
import AppLayout from "@/components/AppLayout";

interface UserProfile {
  full_name: string;
  role: string;
  datos_adicionales?: Record<string, any> | null;
}

const FEED_SOCIAL_MOCK = [
  {
    id: "1",
    tipo: "gol",
    titulo: "Gol anotado en tiempo reglamentario",
    descripcion: "Iker anotó un gol al minuto 42 para el equipo Toros FC",
    tiempo: "Hace 15 min",
    liga: "Liga Nocturna Verano",
  },
  {
    id: "2",
    tipo: "resultado",
    titulo: "Partido Finalizado",
    descripcion: "Toros FC ganó 3 - 1 contra Rayos de Puebla",
    tiempo: "Hace 2 horas",
    liga: "Torneo Verano 2026",
  },
  {
    id: "3",
    tipo: "destacado",
    titulo: "Líder Goleador del Mes",
    descripcion: "Carlos Silva lidera la tabla de goleo con 12 tantos anotados",
    tiempo: "Actualizado hoy",
    liga: "Liga Dominical Sub-20",
  },
  {
    id: "4",
    tipo: "evento",
    titulo: "Próxima Fecha de Cuartos de Final",
    descripcion: "Se definieron los horarios para los encuentros del fin de semana",
    tiempo: "Hace 1 día",
    liga: "Torneo Intermunicipal",
  },
];

export default function DashboardPage() {
  const [torneos, setTorneos] = useState<Torneo[]>([]);
  const [canchas, setCanchas] = useState<Cancha[]>([]);
  const [equipos, setEquipos] = useState<Equipo[]>([]);
  const [loading, setLoading] = useState(true);
  const [isInvitado, setIsInvitado] = useState(false);
  const [user, setUser] = useState<UserProfile | null>(null);

  // Control de pestaña activa en sección de exploración
  const [explorarTab, setExplorarTab] = useState<"social" | "canchas" | "equipos">("social");

  useEffect(() => {
    if (typeof window !== "undefined") {
      setIsInvitado(localStorage.getItem("invitado") === "true");
    }
    cargarDatos();
  }, []);

  async function cargarDatos() {
    try {
      const [canchasData, equiposData, torneosData] = await Promise.all([
        canchasApi.listar(),
        equiposApi.listar(),
        torneosApi.listar(),
      ]);
      setCanchas(canchasData);
      setEquipos(equiposData);
      setTorneos(torneosData);

      try {
        const perfil = await authApi.me();
        setUser(perfil as UserProfile);
      } catch {
        // Invitado
      }
    } catch (error) {
      console.error("Error al cargar datos del dashboard:", error);
    } finally {
      setLoading(false);
    }
  }

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Buenos días";
    if (hour < 18) return "Buenas tardes";
    return "Buenas noches";
  };

  if (loading) {
    return (
      <AppLayout>
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="p-4 md:p-8 pb-16 max-w-6xl mx-auto space-y-8">
        
        {/* Encabezado y Saludo */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-card rounded-3xl p-6 border border-secondary shadow-sm">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              {greeting()}
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight mt-0.5">
              {user ? user.full_name.split(" ")[0] : "Bienvenido a Reta_T"}
            </h1>
            {user && (
              <div className="inline-flex items-center gap-2 mt-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold capitalize">
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                {user.role === "organizer"
                  ? "Organizador / Coach"
                  : user.role === "match_manager"
                  ? "Encargado de Partido"
                  : user.role === "player"
                  ? "Jugador / Coach"
                  : user.role === "viewer"
                  ? "Visualizador"
                  : user.role}
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/equipos/nuevo"
              className="px-4 py-2.5 bg-primary hover:bg-primary-light text-primary-foreground font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-md"
            >
              + Nuevo Equipo
            </Link>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* SECCIÓN PRINCIPAL DEL COACH 1: EQUIPOS DIRIGIDOS */}
        {/* ========================================================================= */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-black text-foreground tracking-tight">
                Equipos Dirigidos
              </h2>
              <p className="text-xs text-muted-foreground">
                Clubes bajo tu dirección deportiva y gestión de plantilla.
              </p>
            </div>
            <Link
              href="/equipos"
              className="text-xs font-bold text-primary hover:underline"
            >
              Ver Directorio ({equipos.length}) →
            </Link>
          </div>

          {equipos.length === 0 ? (
            <div className="bg-card border border-dashed border-secondary rounded-3xl p-8 text-center space-y-3">
              <h3 className="text-base font-bold text-foreground">
                Aún no diriges ningún equipo
              </h3>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                Registra tu primer equipo deportivo para dar de alta a tus jugadores y participar en torneos.
              </p>
              <Link
                href="/equipos/nuevo"
                className="inline-block px-5 py-2.5 bg-primary text-primary-foreground font-bold rounded-xl text-xs uppercase tracking-wider hover:bg-primary-light transition-colors shadow"
              >
                Registrar Mi Primer Equipo
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {equipos.slice(0, 3).map((equipo) => {
                const clubColor = equipo.color || "#991b1b";
                const tipoEquipo = equipo.datos_adicionales?.tipo_equipo || "Club";

                return (
                  <div
                    key={equipo.id}
                    className="bg-card rounded-3xl border border-secondary p-5 hover:shadow-xl transition-all flex flex-col justify-between group hover:border-primary/40 relative overflow-hidden"
                    style={{
                      background: `linear-gradient(135deg, ${clubColor}35 0%, rgba(24,24,27,0.95) 75%)`,
                    }}
                  >
                    <div className="flex items-start justify-between gap-3 relative z-10">
                      <div className="flex items-center gap-3">
                        {/* Escudo PNG Nativo (Sin silueta de círculo) */}
                        <div className="w-14 h-14 flex items-center justify-center overflow-hidden flex-shrink-0 p-1">
                          {equipo.logo_url ? (
                            <img
                              src={equipo.logo_url}
                              alt={equipo.nombre}
                              className="max-w-full max-h-full object-contain filter drop-shadow-md"
                            />
                          ) : (
                            <div
                              className="w-12 h-12 rounded-xl flex items-center justify-center font-black text-white text-lg"
                              style={{ backgroundColor: clubColor }}
                            >
                              {equipo.nombre.charAt(0)}
                            </div>
                          )}
                        </div>

                        <div className="truncate">
                          <h3 className="text-base font-bold text-foreground leading-tight group-hover:text-primary transition-colors truncate">
                            {equipo.nombre}
                          </h3>
                          <span className="text-[10px] uppercase font-extrabold text-muted-foreground tracking-wider block mt-0.5">
                            Rama: {tipoEquipo}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-secondary flex items-center justify-between relative z-10">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-2.5 h-2.5 rounded-full border border-white/20"
                          style={{ backgroundColor: clubColor }}
                        />
                        <span className="text-[11px] font-semibold text-muted-foreground uppercase">
                          {(equipo as any).sport?.nombre || equipo.datos_adicionales?.sport_nombre || "Club Deportivo"}
                        </span>
                      </div>

                      <Link
                        href={`/equipos/${equipo.id}`}
                        className="text-xs font-black text-primary hover:underline cursor-pointer"
                      >
                        Gestionar Plantilla →
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ========================================================================= */}
        {/* SECCIÓN PRINCIPAL DEL COACH 2: TORNEOS EN LOS QUE PARTICIPO */}
        {/* ========================================================================= */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-black text-foreground tracking-tight">
                Torneos en los que Participo
              </h2>
              <p className="text-xs text-muted-foreground">
                Competencias activas donde compiten tus equipos.
              </p>
            </div>
            <Link
              href="/torneos"
              className="text-xs font-bold text-primary hover:underline"
            >
              Explorar Torneos ({torneos.length}) →
            </Link>
          </div>

          {torneos.length === 0 ? (
            <div className="bg-card border border-dashed border-secondary rounded-3xl p-8 text-center space-y-3">
              <h3 className="text-base font-bold text-foreground">
                No estás participando en ningún torneo actualmente
              </h3>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                Inscribe tu equipo en los torneos disponibles de tu comunidad.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {torneos.slice(0, 2).map((torneo) => {
                const portada = torneo.datos_adicionales?.imagen_portada || "/Futbol 7.jpg";

                return (
                  <div
                    key={torneo.id}
                    className="group relative rounded-3xl overflow-hidden border border-secondary bg-card shadow-lg flex flex-col justify-between h-64 hover:border-primary/50 transition-all"
                  >
                    <img
                      src={portada}
                      alt={torneo.nombre}
                      className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/50 to-black/20" />

                    <div className="relative z-10 p-5 flex justify-between items-start">
                      <span className="text-xs uppercase tracking-widest font-extrabold text-white bg-white/20 backdrop-blur-md px-3 py-1 rounded-full border border-white/20 capitalize">
                        Categoría: {torneo.categoria}
                      </span>
                      {torneo.sport && (
                        <span className="text-xs uppercase tracking-widest font-extrabold text-primary-light bg-primary/30 backdrop-blur-md px-3 py-1 rounded-full border border-primary/30">
                          {torneo.sport.nombre}
                        </span>
                      )}
                    </div>

                    <div className="relative z-10 p-6 space-y-3">
                      <h3 className="text-xl sm:text-2xl font-black text-white drop-shadow-md leading-tight">
                        {torneo.nombre}
                      </h3>

                      <div className="flex items-center justify-between pt-2 border-t border-white/10">
                        <span className="text-xs font-semibold text-white/80">
                          {torneo.equipos ? torneo.equipos.length : 0} Equipos inscritos
                        </span>

                        <Link
                          href={`/torneos/${torneo.id}`}
                          className="px-4 py-2 bg-primary hover:bg-primary-light text-primary-foreground font-bold rounded-xl text-xs uppercase tracking-wider transition-colors shadow-md"
                        >
                          Ver Torneo →
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Tarjetas de Estadísticas Principales */}
        <div className="grid grid-cols-3 gap-3 sm:gap-4">
          {[
            { label: "Torneos Disponibles", value: torneos.length, href: "/torneos" },
            { label: "Equipos Registrados", value: equipos.length, href: "/equipos" },
            { label: "Canchas Disponibles", value: canchas.length, href: "/canchas" },
          ].map((stat, idx) => (
            <Link
              key={idx}
              href={stat.href}
              className="bg-card border border-secondary hover:border-primary/50 rounded-2xl p-4 sm:p-5 transition-all hover:scale-[1.02] shadow-sm flex flex-col justify-between"
            >
              <span className="text-2xl sm:text-4xl font-black text-foreground tracking-tight">
                {stat.value}
              </span>
              <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider mt-2">
                {stat.label}
              </span>
            </Link>
          ))}
        </div>

        {/* SECCIÓN INFERIOR: EXPLORACIÓN DE LA COMUNIDAD */}
        <div className="bg-card rounded-3xl border border-secondary p-6 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-secondary">
            <div>
              <h2 className="text-lg font-black text-foreground tracking-tight">
                Explora en la Comunidad
              </h2>
              <p className="text-xs text-muted-foreground">
                Feed social de eventos, estadísticas de liga, canchas y equipos.
              </p>
            </div>

            <div className="flex bg-background rounded-xl p-1 border border-secondary w-fit overflow-x-auto">
              <button
                onClick={() => setExplorarTab("social")}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                  explorarTab === "social"
                    ? "bg-primary text-primary-foreground shadow"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Actividad Social
              </button>
              <button
                onClick={() => setExplorarTab("canchas")}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                  explorarTab === "canchas"
                    ? "bg-primary text-primary-foreground shadow"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Canchas ({canchas.length})
              </button>
              <button
                onClick={() => setExplorarTab("equipos")}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                  explorarTab === "equipos"
                    ? "bg-primary text-primary-foreground shadow"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Equipos ({equipos.length})
              </button>
            </div>
          </div>

          {/* Pestaña: Feed Social */}
          {explorarTab === "social" && (
            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {FEED_SOCIAL_MOCK.map((item) => (
                  <div
                    key={item.id}
                    className="bg-background rounded-2xl border border-secondary p-4 flex flex-col justify-between space-y-3 hover:border-primary/40 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-primary/10 text-primary border border-primary/20">
                        {item.tipo}
                      </span>
                      <span className="text-[10px] font-semibold text-muted-foreground">
                        {item.tiempo}
                      </span>
                    </div>

                    <div>
                      <h4 className="font-bold text-foreground text-sm">
                        {item.titulo}
                      </h4>
                      <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                        {item.descripcion}
                      </p>
                    </div>

                    <div className="pt-2 border-t border-secondary/50 flex items-center justify-between text-[11px] font-semibold text-muted-foreground">
                      <span>{item.liga}</span>
                      <span className="text-primary hover:underline cursor-pointer">
                        Detalles →
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Pestaña: Canchas */}
          {explorarTab === "canchas" && (
            <div>
              {canchas.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground text-xs">
                  No hay canchas registradas aún.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {canchas.slice(0, 3).map((cancha) => (
                    <div
                      key={cancha.id}
                      className="bg-background rounded-2xl border border-secondary p-4 flex flex-col justify-between hover:border-primary/40 transition-colors"
                    >
                      <div>
                        <h4 className="font-bold text-foreground text-sm truncate">
                          {cancha.nombre}
                        </h4>
                        <p className="text-xs text-muted-foreground mt-1 truncate">
                          {cancha.direccion || "Dirección no especificada"}
                        </p>
                      </div>

                      <div className="mt-4 pt-3 border-t border-secondary/50 flex items-center justify-between">
                        <span className="text-[10px] uppercase font-bold text-muted-foreground">
                          Capacidad: {cancha.capacidad || 100} personas
                        </span>
                        <Link
                          href="/canchas"
                          className="text-xs font-bold text-primary hover:underline"
                        >
                          Ver →
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Pestaña: Equipos */}
          {explorarTab === "equipos" && (
            <div>
              {equipos.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground text-xs">
                  No hay equipos registrados aún.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {equipos.slice(0, 3).map((equipo) => (
                    <div
                      key={equipo.id}
                      className="bg-background rounded-2xl border border-secondary p-4 flex items-center justify-between hover:border-primary/40 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center text-xs font-black text-white uppercase shadow"
                          style={{ backgroundColor: equipo.color || "#3b82f6" }}
                        >
                          {equipo.nombre.charAt(0)}
                        </div>
                        <div>
                          <h4 className="font-bold text-foreground text-sm truncate">
                            {equipo.nombre}
                          </h4>
                          <span className="text-[10px] text-muted-foreground font-semibold">
                            Equipo Registrado
                          </span>
                        </div>
                      </div>

                      <Link
                        href={`/equipos/${equipo.id}`}
                        className="text-xs font-bold text-primary hover:underline"
                      >
                        Ver →
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Banner Invitado */}
        {isInvitado && (
          <div className="p-6 rounded-3xl border border-primary/30 bg-primary/5 text-center space-y-3">
            <p className="text-xs text-muted-foreground">
              Estás explorando como <strong>Invitado</strong>. Crea una cuenta para gestionar torneos y equipos.
            </p>
            <div className="flex justify-center gap-3">
              <Link
                href="/login"
                className="px-5 py-2 bg-primary text-primary-foreground rounded-xl text-xs font-bold hover:bg-primary-light transition-colors"
              >
                Iniciar Sesión
              </Link>
              <Link
                href="/"
                className="px-5 py-2 border border-secondary text-foreground rounded-xl text-xs font-bold hover:border-primary/50 transition-colors"
              >
                Registrarse
              </Link>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}