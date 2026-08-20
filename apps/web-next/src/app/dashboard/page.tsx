"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { canchasApi, equiposApi, torneosApi, authApi } from "@/lib/api";
import type { Torneo, Cancha, Equipo } from "@reta-t/types";
import AppLayout from "@/components/AppLayout";

interface UserProfile {
  id?: string;
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

function getCategoryBadgeClass(categoria: string) {
  const cat = (categoria || "").toLowerCase();
  if (cat.includes("varonil")) {
    return "bg-blue-500/15 text-blue-400 border-blue-500/30";
  }
  if (cat.includes("femenil")) {
    return "bg-pink-500/15 text-pink-400 border-pink-500/30";
  }
  if (cat.includes("mixto")) {
    return "bg-emerald-500/15 text-emerald-400 border-emerald-500/30";
  }
  return "bg-amber-500/15 text-amber-400 border-amber-500/30";
}

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

  const currentUserId = user?.id || (() => {
    if (typeof window !== "undefined") {
      const uStr = localStorage.getItem("user");
      if (uStr) {
        try {
          return JSON.parse(uStr).id;
        } catch {
          // ignore
        }
      }
    }
    return null;
  })();

  // 1. Torneos creados por el usuario (Prioridad 1)
  const misTorneos = currentUserId
    ? torneos.filter((t) => t.organizer_id === currentUserId)
    : [];

  // 2. Equipos creados por el usuario (Prioridad 2)
  const misEquiposCreados = currentUserId
    ? equipos.filter(
        (e: any) =>
          e.creator_id === currentUserId ||
          e.organizer_id === currentUserId ||
          e.datos_adicionales?.creador_id === currentUserId ||
          e.datos_adicionales?.organizer_id === currentUserId
      )
    : [];

  // 3. Equipos en los que juega el usuario (Prioridad 3)
  const equiposDondeJuega = currentUserId
    ? equipos.filter(
        (e: any) =>
          !misEquiposCreados.some((me) => me.id === e.id) &&
          (e.jugadores?.some((j: any) => j.user_id === currentUserId || j.id === currentUserId) ||
            e.datos_adicionales?.jugadores?.some((j: any) => j.user_id === currentUserId || j.id === currentUserId))
      )
    : [];

  // 4. Próximos partidos
  const proximosPartidos: any[] = [];

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
      <div className="p-4 md:p-8 pb-16 max-w-6xl mx-auto space-y-8 font-sans">
        
        {/* ========================================================================= */}
        {/* 1. ENCABEZADO Y SALUDO (SIEMPRE ARRIBA) */}
        {/* ========================================================================= */}
        <div className="bg-card rounded-3xl p-6 border border-secondary shadow-sm">
          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
            {greeting()}
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight mt-0.5">
            {user?.full_name ? user.full_name.split(" ")[0] : "Bienvenido a Reta_T"}
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Resumen rápido de equipos, torneos y actividad de tu comunidad.
          </p>
        </div>

        {/* ========================================================================= */}
        {/* 2. MIS TORNEOS CREADOS (PRIORIDAD 1) - SOLO SI EXISTEN CREADOS POR EL USUARIO */}
        {/* ========================================================================= */}
        {misTorneos.length > 0 && (
          <div className="space-y-4 pt-2">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-black text-foreground tracking-tight">
                  Mis Torneos Organizados
                </h2>
                <p className="text-xs text-muted-foreground">
                  Torneos y competencias creados y gestionados por ti.
                </p>
              </div>
              <Link
                href="/torneos/nuevo"
                className="px-4 py-2 bg-primary hover:bg-primary-light text-primary-foreground text-xs font-extrabold uppercase tracking-wider rounded-xl transition-all shadow-sm flex items-center justify-center min-h-[40px]"
              >
                + Nuevo Torneo
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {misTorneos.map((torneo) => {
                const portada = torneo.datos_adicionales?.imagen_portada || "/Futbol 7.jpg";
                const badgeClass = getCategoryBadgeClass(torneo.categoria);

                return (
                  <div
                    key={torneo.id}
                    className="group relative rounded-3xl overflow-hidden border border-secondary bg-card shadow-lg flex flex-col justify-between h-60 hover:border-primary/50 transition-all"
                  >
                    <img
                      src={portada}
                      alt={torneo.nombre}
                      className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-card via-black/40 to-transparent" />

                    <div className="relative z-10 p-5 flex justify-between items-start">
                      <span className={`text-xs uppercase tracking-widest font-extrabold backdrop-blur-md px-3 py-1 rounded-full border ${badgeClass}`}>
                        Categoría: {torneo.categoria}
                      </span>
                      {torneo.sport && (
                        <span className="text-xs uppercase tracking-widest font-extrabold text-primary-light bg-primary/30 backdrop-blur-md px-3 py-1 rounded-full border border-primary/30">
                          {torneo.sport.nombre}
                        </span>
                      )}
                    </div>

                    <div className="relative z-10 p-5 space-y-2">
                      <h3 className="text-xl sm:text-2xl font-black text-white drop-shadow-md leading-tight">
                        {torneo.nombre}
                      </h3>

                      <div className="flex items-center justify-between pt-2 border-t border-white/10">
                        <span className="text-xs font-semibold text-white/80">
                          {torneo.equipos ? torneo.equipos.length : 0} Equipos inscritos
                        </span>

                        <Link
                          href={`/torneos/${torneo.id}`}
                          className="min-h-[38px] px-4 py-2 bg-primary hover:bg-primary-light text-primary-foreground font-bold rounded-xl text-xs uppercase tracking-wider transition-colors shadow-md flex items-center justify-center"
                        >
                          Gestionar →
                        </Link>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 3. MIS EQUIPOS CREADOS (PRIORIDAD 2) - SOLO SI EXISTEN CREADOS POR EL USUARIO */}
        {/* ========================================================================= */}
        {misEquiposCreados.length > 0 && (
          <div className="space-y-4 pt-2">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-black text-foreground tracking-tight">
                  Mis Equipos Creados
                </h2>
                <p className="text-xs text-muted-foreground">
                  Equipos deportivos bajo tu administración.
                </p>
              </div>
              <Link
                href="/equipos/nuevo"
                className="px-4 py-2 bg-primary hover:bg-primary-light text-primary-foreground text-xs font-extrabold uppercase tracking-wider rounded-xl transition-all shadow-sm flex items-center justify-center min-h-[40px]"
              >
                + Registrar equipo
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {misEquiposCreados.map((equipo) => {
                const clubColor = equipo.color || "#991b1b";
                const tipoEquipo = equipo.datos_adicionales?.tipo_equipo || "Club";
                const badgeClass = getCategoryBadgeClass(tipoEquipo);

                return (
                  <div
                    key={equipo.id}
                    className="bg-card rounded-3xl border border-secondary p-5 hover:shadow-xl transition-all flex flex-col justify-between group hover:border-primary/40 relative overflow-hidden"
                    style={{
                      background: `linear-gradient(135deg, ${clubColor}22 0%, var(--color-card) 75%)`,
                    }}
                  >
                    <div className="flex items-start justify-between gap-3 relative z-10">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 flex items-center justify-center overflow-hidden flex-shrink-0">
                          {equipo.logo_url ? (
                            <img
                              src={equipo.logo_url}
                              alt={equipo.nombre}
                              className="max-w-full max-h-full object-contain filter drop-shadow-md"
                            />
                          ) : (
                            <div
                              className="w-12 h-12 rounded-xl flex items-center justify-center font-black text-white text-lg shadow"
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
                          <span className={`text-[10px] uppercase font-extrabold px-2.5 py-0.5 rounded-full border inline-block mt-1 ${badgeClass}`}>
                            Rama: {tipoEquipo}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-secondary flex items-center justify-between gap-2 relative z-10">
                      <span className="text-[11px] font-semibold text-muted-foreground uppercase truncate">
                        {(equipo as any).sport?.nombre || equipo.datos_adicionales?.sport_nombre || "Club Deportivo"}
                      </span>

                      <Link
                        href={`/equipos/${equipo.id}`}
                        className="min-h-[38px] px-3.5 py-1.5 bg-primary hover:bg-primary-light text-primary-foreground font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center justify-center cursor-pointer"
                      >
                        Gestionar
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 4. EQUIPOS EN LOS QUE JUEGA (PRIORIDAD 3) - SOLO SI PERTENECE COMO JUGADOR */}
        {/* ========================================================================= */}
        {equiposDondeJuega.length > 0 && (
          <div className="space-y-4 pt-2">
            <div>
              <h2 className="text-xl font-black text-foreground tracking-tight">
                Equipos donde participas
              </h2>
              <p className="text-xs text-muted-foreground">
                Equipos en los que estás registrado como jugador.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {equiposDondeJuega.map((equipo) => (
                <div
                  key={equipo.id}
                  className="bg-card rounded-3xl border border-secondary p-4 flex items-center justify-between hover:border-primary/40 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-white text-base shadow"
                      style={{ backgroundColor: equipo.color || "#3b82f6" }}
                    >
                      {equipo.nombre.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-bold text-foreground text-sm truncate">
                        {equipo.nombre}
                      </h3>
                      <span className="text-[10px] text-muted-foreground font-semibold uppercase">
                        Jugador Activo
                      </span>
                    </div>
                  </div>

                  <Link
                    href={`/equipos/${equipo.id}`}
                    className="min-h-[36px] px-3 py-1.5 bg-secondary hover:bg-secondary/80 text-foreground font-bold text-xs rounded-xl transition-colors"
                  >
                    Ver Plantilla →
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 5. PRÓXIMOS PARTIDOS (PRIORIDAD 4) - SOLO SI HAY PARTIDOS DEL USUARIO */}
        {/* ========================================================================= */}
        {proximosPartidos.length > 0 && (
          <div className="space-y-4 pt-2">
            <div>
              <h2 className="text-xl font-black text-foreground tracking-tight">
                Próximos Partidos
              </h2>
              <p className="text-xs text-muted-foreground">
                Tus encuentros agendados en competencias activas.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-3">
              {/* Partidos agendados */}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 6. ZONA DE EXPLORACIÓN DE LA COMUNIDAD (AL FINAL - OPCIÓN A: CARRUSELES HORIZONTALES) */}
        {/* ========================================================================= */}
        <div className="bg-card rounded-3xl border border-secondary p-6 shadow-sm space-y-8 pt-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-4 border-b border-secondary">
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-primary">
                Explora tu comunidad
              </span>
              <h2 className="text-xl font-black text-foreground tracking-tight">
                Actividad Deportivo General
              </h2>
              <p className="text-xs text-muted-foreground">
                Descubre los torneos, equipos y canchas activas en tu zona.
              </p>
            </div>

            {/* Pills de acceso directo */}
            <div className="flex items-center gap-2 pt-2 sm:pt-0">
              <Link
                href="/torneos"
                className="px-3 py-1.5 bg-background border border-secondary hover:border-primary/50 rounded-xl text-xs font-bold text-foreground transition-all flex items-center gap-1.5"
              >
                <span>Torneos</span>
                <span className="bg-primary/20 text-primary px-1.5 py-0.5 rounded-md text-[10px] font-black">
                  {torneos.length}
                </span>
              </Link>
              <Link
                href="/equipos"
                className="px-3 py-1.5 bg-background border border-secondary hover:border-primary/50 rounded-xl text-xs font-bold text-foreground transition-all flex items-center gap-1.5"
              >
                <span>Equipos</span>
                <span className="bg-primary/20 text-primary px-1.5 py-0.5 rounded-md text-[10px] font-black">
                  {equipos.length}
                </span>
              </Link>
              <Link
                href="/canchas"
                className="px-3 py-1.5 bg-background border border-secondary hover:border-primary/50 rounded-xl text-xs font-bold text-foreground transition-all flex items-center gap-1.5"
              >
                <span>Canchas</span>
                <span className="bg-primary/20 text-primary px-1.5 py-0.5 rounded-md text-[10px] font-black">
                  {canchas.length}
                </span>
              </Link>
            </div>
          </div>

          {/* Carrusel Horizontal 1: Torneos de la Comunidad */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black uppercase tracking-wider text-foreground">
                Torneos de la Comunidad
              </h3>
              <Link
                href="/torneos"
                className="text-xs font-bold text-primary hover:underline"
              >
                Ver todos ({torneos.length}) →
              </Link>
            </div>

            {torneos.length === 0 ? (
              <div className="text-center py-6 text-xs text-muted-foreground bg-background/50 rounded-2xl border border-secondary/50">
                No hay torneos registrados en la comunidad por ahora.
              </div>
            ) : (
              <div className="flex gap-4 overflow-x-auto pb-3 snap-x snap-mandatory scrollbar-thin scrollbar-thumb-secondary">
                {torneos.map((torneo) => {
                  const portada = torneo.datos_adicionales?.imagen_portada || "/Futbol 7.jpg";
                  const badgeClass = getCategoryBadgeClass(torneo.categoria);

                  return (
                    <div
                      key={torneo.id}
                      className="snap-start flex-shrink-0 w-72 sm:w-80 group relative rounded-2xl overflow-hidden border border-secondary bg-background shadow-md flex flex-col justify-between h-52 hover:border-primary/50 transition-all"
                    >
                      <img
                        src={portada}
                        alt={torneo.nombre}
                        className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-card via-black/50 to-transparent" />

                      <div className="relative z-10 p-3.5 flex justify-between items-start">
                        <span className={`text-[10px] uppercase tracking-widest font-extrabold backdrop-blur-md px-2.5 py-0.5 rounded-full border ${badgeClass}`}>
                          {torneo.categoria}
                        </span>
                        {torneo.sport && (
                          <span className="text-[10px] uppercase font-extrabold text-primary-light bg-primary/30 backdrop-blur-md px-2 py-0.5 rounded-full border border-primary/30">
                            {torneo.sport.nombre}
                          </span>
                        )}
                      </div>

                      <div className="relative z-10 p-4 space-y-2">
                        <h4 className="text-base font-black text-white drop-shadow leading-snug truncate">
                          {torneo.nombre}
                        </h4>

                        <div className="flex items-center justify-between pt-2 border-t border-white/10">
                          <span className="text-[11px] font-semibold text-white/80">
                            {torneo.equipos ? torneo.equipos.length : 0} Equipos
                          </span>

                          <Link
                            href={`/torneos/${torneo.id}`}
                            className="min-h-[34px] px-3 py-1.5 bg-primary hover:bg-primary-light text-primary-foreground font-bold rounded-xl text-xs uppercase tracking-wider transition-colors shadow flex items-center justify-center"
                          >
                            Ver →
                          </Link>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Carrusel Horizontal 2: Equipos de la Comunidad */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black uppercase tracking-wider text-foreground">
                Equipos Destacados
              </h3>
              <Link
                href="/equipos"
                className="text-xs font-bold text-primary hover:underline"
              >
                Ver todos ({equipos.length}) →
              </Link>
            </div>

            {equipos.length === 0 ? (
              <div className="text-center py-6 text-xs text-muted-foreground bg-background/50 rounded-2xl border border-secondary/50">
                No hay equipos en la comunidad aún.
              </div>
            ) : (
              <div className="flex gap-4 overflow-x-auto pb-3 snap-x snap-mandatory scrollbar-thin scrollbar-thumb-secondary">
                {equipos.map((equipo) => {
                  const clubColor = equipo.color || "#3b82f6";
                  const tipoEquipo = equipo.datos_adicionales?.tipo_equipo || "Club";

                  return (
                    <div
                      key={equipo.id}
                      className="snap-start flex-shrink-0 w-64 bg-background rounded-2xl border border-secondary p-4 flex flex-col justify-between hover:border-primary/40 transition-all space-y-3"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-white text-base shadow flex-shrink-0"
                          style={{ backgroundColor: clubColor }}
                        >
                          {equipo.nombre.charAt(0)}
                        </div>
                        <div className="truncate">
                          <h4 className="font-bold text-foreground text-sm truncate">
                            {equipo.nombre}
                          </h4>
                          <span className="text-[10px] text-muted-foreground font-semibold uppercase">
                            {tipoEquipo}
                          </span>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-secondary flex items-center justify-between">
                        <span className="text-[10px] text-muted-foreground font-bold uppercase truncate">
                          {(equipo as any).sport?.nombre || "Deporte"}
                        </span>
                        <Link
                          href={`/equipos/${equipo.id}`}
                          className="text-xs font-bold text-primary hover:underline"
                        >
                          Ver →
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Actividad Social / Feed */}
          <div className="space-y-3 pt-2">
            <h3 className="text-sm font-black uppercase tracking-wider text-foreground">
              Novedades y Actividad Reciente
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {FEED_SOCIAL_MOCK.slice(0, 2).map((item) => (
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