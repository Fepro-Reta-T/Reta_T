"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { torneosApi, inscripcionesApi } from "@/lib/api";
import type { Torneo, Equipo } from "@reta-t/types";
import AppLayout from "@/components/AppLayout";

// Estructuras borrador para los enfrentamientos con degradado de color oficial por equipo
const MOCK_PARTIDOS = [
  {
    id: "m1",
    jornada: "Jornada 1",
    fecha: "Sábado 22 de Agosto",
    hora: "18:00 hrs",
    cancha: "Cancha Central 1",
    local: "Toros FC",
    localColor: "#991b1b",
    localLogo: null,
    visitante: "Rayos de Puebla",
    visitanteColor: "#1e3a8a",
    visitanteLogo: null,
    estado: "Finalizado",
    marcadorLocal: 3,
    marcadorVisitante: 1,
  },
  {
    id: "m2",
    jornada: "Jornada 1",
    fecha: "Sábado 22 de Agosto",
    hora: "19:30 hrs",
    cancha: "Cancha Central 2",
    local: "Jaguares FC",
    localColor: "#d97706",
    localLogo: null,
    visitante: "Atlético San Pancho",
    visitanteColor: "#065f46",
    visitanteLogo: null,
    estado: "Programado",
    marcadorLocal: null,
    marcadorVisitante: null,
  },
];

const MOCK_TABLA_GOLEO = [
  { pos: 1, jugador: "Carlos Silva", equipo: "Toros FC", goles: 8 },
  { pos: 2, jugador: "Iker Ramírez", equipo: "Rayos de Puebla", goles: 6 },
  { pos: 3, jugador: "Mateo Hernández", equipo: "Jaguares FC", goles: 5 },
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

export default function DetalleTorneoPage() {
  const params = useParams();
  const router = useRouter();
  const torneoId = params.id as string;

  const [torneo, setTorneo] = useState<Torneo | null>(null);
  const [equipos, setEquipos] = useState<Equipo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modales de Expansión Completa
  const [modalEquiposOpen, setModalEquiposOpen] = useState(false);
  const [modalCalendarioOpen, setModalCalendarioOpen] = useState(false);
  const [modalPosicionesOpen, setModalPosicionesOpen] = useState(false);
  const [modalGoleoOpen, setModalGoleoOpen] = useState(false);
  const [modalEliminarOpen, setModalEliminarOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [isInvitado] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("invitado") === "true";
    }
    return false;
  });

  const [isOrganizer] = useState(() => {
    if (typeof window !== "undefined") {
      const userStr = localStorage.getItem("user");
      if (userStr) {
        try {
          const u = JSON.parse(userStr);
          return u.role === "organizer" || u.role === "admin";
        } catch {}
      }
    }
    return false;
  });

  useEffect(() => {
    async function cargarDatos() {
      try {
        const torneoData = await torneosApi.obtener(torneoId);
        const equiposInscritos = await inscripcionesApi.listarEquiposInscritos(torneoId);

        setTorneo(torneoData);
        setEquipos(equiposInscritos);
        setError(null);
      } catch (err) {
        setError("Error al cargar los datos del torneo");
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    if (torneoId) {
      cargarDatos();
    }
  }, [torneoId]);

  async function handleConfirmEliminar() {
    setDeleting(true);
    try {
      await torneosApi.eliminar(torneoId);
      router.push("/torneos");
    } catch (err) {
      alert("Error al eliminar el torneo");
      console.error(err);
      setDeleting(false);
      setModalEliminarOpen(false);
    }
  }

  if (loading) {
    return (
      <AppLayout>
        <div className="min-h-screen bg-background flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent" />
        </div>
      </AppLayout>
    );
  }

  if (error || !torneo) {
    return (
      <AppLayout>
        <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
          <p className="text-red-500 font-bold text-lg mb-4">
            {error || "Torneo no encontrado"}
          </p>
          <Link
            href="/torneos"
            className="min-h-[44px] px-6 py-2.5 bg-primary text-primary-foreground font-extrabold rounded-xl text-xs uppercase tracking-wider hover:bg-primary-light transition-colors shadow flex items-center justify-center"
          >
            ← Volver a Torneos
          </Link>
        </div>
      </AppLayout>
    );
  }

  const portada = torneo.datos_adicionales?.imagen_portada || "/Futbol 7.jpg";
  const reglas = torneo.datos_adicionales?.reglas;
  const badgeClass = getCategoryBadgeClass(torneo.categoria);

  // Cálculo estético de tabla de posiciones basado en los equipos inscritos
  const tablaPosiciones = equipos.map((eq, idx) => ({
    pos: idx + 1,
    equipo: eq.nombre,
    color: eq.color || "#991b1b",
    logo_url: eq.logo_url,
    pj: 3,
    pg: 2 - (idx % 2),
    pe: idx % 2,
    pp: 0,
    gf: 7 - idx,
    gc: 3 + idx,
    dg: 4 - idx * 2,
    pts: (2 - (idx % 2)) * 3 + (idx % 2),
  }));

  return (
    <AppLayout>
      <div className="p-4 md:p-8 pb-24 max-w-5xl mx-auto space-y-6 font-sans">
        
        {/* Enlace Volver */}
        <Link
          href="/torneos"
          className="inline-flex items-center gap-1.5 text-xs font-extrabold text-muted-foreground hover:text-foreground transition-colors"
        >
          ← Volver a Catálogo de Torneos
        </Link>

        {/* HERO BANNER DE PORTADA DEL TORNEO CON DEGRADADO SUAVE */}
        <div className="relative w-full h-60 sm:h-72 rounded-3xl overflow-hidden border border-secondary shadow-xl group bg-card">
          <img
            src={portada}
            alt={torneo.nombre}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          {/* Degradado progresivo hacia el fondo semántico */}
          <div className="absolute inset-0 bg-gradient-to-t from-card via-card/75 via-45% to-black/30" />

          <div className="absolute inset-0 p-6 sm:p-8 flex flex-col justify-end z-10 space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`text-xs uppercase tracking-widest font-extrabold backdrop-blur-md px-3 py-1 rounded-full border capitalize shadow-sm ${badgeClass}`}>
                Categoría: {torneo.categoria}
              </span>
              {torneo.sport && (
                <span className="text-xs uppercase tracking-widest font-extrabold text-foreground bg-card/80 backdrop-blur-md px-3 py-1 rounded-full border border-secondary shadow-sm">
                  {torneo.sport.nombre}
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-4xl font-black text-foreground tracking-tight leading-tight drop-shadow-sm">
              {torneo.nombre}
            </h1>
          </div>
        </div>

        {/* BARRA DE ACCIONES PRINCIPALES (UBICADA DEBAJO DEL BANNER) */}
        <div className="flex flex-wrap items-center gap-3 bg-card p-4 rounded-3xl border border-secondary shadow-sm">
          {!isInvitado && (
            <Link
              href={`/torneos/${torneo.id}/inscribir`}
              className="flex-1 sm:flex-none min-h-[44px] px-6 py-3 bg-primary hover:bg-primary-light text-primary-foreground font-black text-xs uppercase tracking-wider rounded-2xl transition-all shadow-md text-center flex items-center justify-center gap-2"
            >
              <span>+ Inscribir Equipo</span>
            </Link>
          )}

          {isOrganizer && !isInvitado && (
            <Link
              href={`/partidos/nuevo?torneo_id=${torneo.id}`}
              className="flex-1 sm:flex-none min-h-[44px] px-6 py-3 bg-secondary hover:bg-secondary/80 text-foreground border border-secondary font-black text-xs uppercase tracking-wider rounded-2xl transition-all shadow-sm text-center flex items-center justify-center gap-2"
            >
              <span>Programar Partido</span>
            </Link>
          )}
        </div>

        {/* DASHBOARD MODULAR INTERACTIVO (4 TARJETAS DE VISTA PREVIA) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* TARJETA 1: EQUIPOS PARTICIPANTES (PREVIEW CON DEGRADADO) */}
          <div
            onClick={() => setModalEquiposOpen(true)}
            className="bg-card rounded-3xl border border-secondary p-6 shadow-sm hover:border-primary/50 transition-all cursor-pointer group flex flex-col justify-between space-y-4 hover:shadow-xl"
          >
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-black text-primary uppercase tracking-widest bg-primary/10 px-2.5 py-1 rounded-md border border-primary/20">
                  Resumen de Clubes
                </span>
                <h3 className="text-xl font-black text-foreground tracking-tight mt-2">
                  Equipos Inscritos
                </h3>
              </div>
              <span className="text-2xl font-black text-foreground bg-background px-3 py-1.5 rounded-2xl border border-secondary shadow-inner">
                {equipos.length}
              </span>
            </div>

            {/* Escudos PNG sobre Degradado del Color Oficial del Club (Sin Silueta Circular) */}
            <div className="flex items-center gap-2.5 overflow-hidden py-2">
              {equipos.length === 0 ? (
                <p className="text-xs text-muted-foreground">Sin equipos inscritos aún.</p>
              ) : (
                equipos.slice(0, 4).map((eq) => {
                  const clubColor = eq.color || "#991b1b";
                  return (
                    <div
                      key={eq.id}
                      className="w-12 h-12 rounded-2xl flex items-center justify-center p-1 border border-white/10 flex-shrink-0 shadow-md relative overflow-hidden"
                      style={{
                        background: `linear-gradient(135deg, ${clubColor}30 0%, var(--color-card) 100%)`,
                      }}
                      title={eq.nombre}
                    >
                      {eq.logo_url ? (
                        <img
                          src={eq.logo_url}
                          alt={eq.nombre}
                          className="max-w-full max-h-full object-contain filter drop-shadow-md"
                        />
                      ) : (
                        <span className="text-sm font-black text-white uppercase">
                          {eq.nombre.charAt(0)}
                        </span>
                      )}
                    </div>
                  );
                })
              )}
              {equipos.length > 4 && (
                <div className="w-10 h-10 rounded-2xl bg-secondary flex items-center justify-center text-xs font-black text-muted-foreground border border-secondary">
                  +{equipos.length - 4}
                </div>
              )}
            </div>

            <div className="pt-3 border-t border-secondary flex items-center justify-end">
              <button
                type="button"
                className="min-h-[40px] px-4 py-2 bg-secondary hover:bg-secondary/80 text-foreground font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all shadow-sm flex items-center justify-center cursor-pointer"
              >
                Ver Clubes ({equipos.length}) →
              </button>
            </div>
          </div>

          {/* TARJETA 2: ROL DE JUEGOS (PREVIEW CON DEGRADADO DE COLOR OFICIAL) */}
          <div
            onClick={() => setModalCalendarioOpen(true)}
            className="bg-card rounded-3xl border border-secondary p-6 shadow-sm hover:border-primary/50 transition-all cursor-pointer group flex flex-col justify-between space-y-4 hover:shadow-xl"
          >
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-black text-primary uppercase tracking-widest bg-primary/10 px-2.5 py-1 rounded-md border border-primary/20">
                  Próximo Encuentro
                </span>
                <h3 className="text-xl font-black text-foreground tracking-tight mt-2">
                  Rol de Juegos
                </h3>
              </div>
              <span className="text-xs font-extrabold text-muted-foreground bg-background px-3 py-1.5 rounded-2xl border border-secondary">
                Jornada 1
              </span>
            </div>

            {/* Preview del Próximo Partido alineado simétricamente con min-w-0 */}
            {MOCK_PARTIDOS.length > 0 && (
              <div className="bg-background rounded-2xl border border-secondary p-3 flex items-center justify-between gap-2 overflow-hidden">
                <div
                  className="flex items-center gap-2 flex-1 min-w-0 p-2 rounded-xl"
                  style={{
                    background: `linear-gradient(90deg, ${MOCK_PARTIDOS[0].localColor}40 0%, transparent 100%)`,
                  }}
                >
                  <span
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: MOCK_PARTIDOS[0].localColor }}
                  />
                  <span className="font-bold text-xs text-foreground truncate min-w-0">
                    {MOCK_PARTIDOS[0].local}
                  </span>
                </div>

                <span className="px-2.5 py-1 bg-secondary rounded-lg font-black text-xs text-foreground flex-shrink-0">
                  VS
                </span>

                <div
                  className="flex items-center gap-2 flex-1 min-w-0 justify-end p-2 rounded-xl text-right"
                  style={{
                    background: `linear-gradient(270deg, ${MOCK_PARTIDOS[0].visitanteColor}40 0%, transparent 100%)`,
                  }}
                >
                  <span className="font-bold text-xs text-foreground truncate min-w-0">
                    {MOCK_PARTIDOS[0].visitante}
                  </span>
                  <span
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: MOCK_PARTIDOS[0].visitanteColor }}
                  />
                </div>
              </div>
            )}

            <div className="pt-3 border-t border-secondary flex items-center justify-end">
              <button
                type="button"
                className="min-h-[40px] px-4 py-2 bg-secondary hover:bg-secondary/80 text-foreground font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all shadow-sm flex items-center justify-center cursor-pointer"
              >
                Ver Rol de Juegos →
              </button>
            </div>
          </div>

          {/* TARJETA 3: TABLA DE POSICIONES (PREVIEW) */}
          <div
            onClick={() => setModalPosicionesOpen(true)}
            className="bg-card rounded-3xl border border-secondary p-6 shadow-sm hover:border-primary/50 transition-all cursor-pointer group flex flex-col justify-between space-y-4 hover:shadow-xl"
          >
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-black text-primary uppercase tracking-widest bg-primary/10 px-2.5 py-1 rounded-md border border-primary/20">
                  Clasificación General
                </span>
                <h3 className="text-xl font-black text-foreground tracking-tight mt-2">
                  Tabla de Posiciones
                </h3>
              </div>
              <span className="text-xs font-extrabold text-muted-foreground bg-background px-3 py-1.5 rounded-2xl border border-secondary">
                Fase Regular
              </span>
            </div>

            <div className="space-y-2">
              {tablaPosiciones.length === 0 ? (
                <p className="text-xs text-muted-foreground">Sin datos de tabla.</p>
              ) : (
                tablaPosiciones.slice(0, 2).map((tp) => (
                  <div
                    key={tp.pos}
                    className="flex items-center justify-between text-xs font-bold bg-background p-2 rounded-xl border border-secondary/50"
                  >
                    <div className="flex items-center gap-2 truncate min-w-0">
                      <span className="text-muted-foreground font-black flex-shrink-0">#{tp.pos}</span>
                      <span
                        className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                        style={{ backgroundColor: tp.color }}
                      />
                      <span className="truncate min-w-0">{tp.equipo}</span>
                    </div>
                    <span className="text-primary font-black px-2 py-0.5 rounded bg-primary/10 flex-shrink-0">
                      {tp.pts} pts
                    </span>
                  </div>
                ))
              )}
            </div>

            <div className="pt-3 border-t border-secondary flex items-center justify-end">
              <button
                type="button"
                className="min-h-[40px] px-4 py-2 bg-secondary hover:bg-secondary/80 text-foreground font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all shadow-sm flex items-center justify-center cursor-pointer"
              >
                Ver Tabla →
              </button>
            </div>
          </div>

          {/* TARJETA 4: LÍDERES DE GOLEO (PREVIEW) */}
          <div
            onClick={() => setModalGoleoOpen(true)}
            className="bg-card rounded-3xl border border-secondary p-6 shadow-sm hover:border-primary/50 transition-all cursor-pointer group flex flex-col justify-between space-y-4 hover:shadow-xl"
          >
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-black text-primary uppercase tracking-widest bg-primary/10 px-2.5 py-1 rounded-md border border-primary/20">
                  Estadística Individual
                </span>
                <h3 className="text-xl font-black text-foreground tracking-tight mt-2">
                  Líderes de Goleo
                </h3>
              </div>
              <span className="text-xs font-extrabold text-muted-foreground bg-background px-3 py-1.5 rounded-2xl border border-secondary">
                Goleador #1
              </span>
            </div>

            <div className="bg-background p-3 rounded-2xl border border-secondary flex items-center justify-between gap-2">
              <div className="flex items-center gap-3 truncate min-w-0">
                <div className="w-8 h-8 rounded-full bg-primary/10 text-primary font-black text-xs flex items-center justify-center border border-primary/20 flex-shrink-0">
                  1
                </div>
                <div className="truncate min-w-0">
                  <p className="font-bold text-xs text-foreground truncate min-w-0">
                    {MOCK_TABLA_GOLEO[0].jugador}
                  </p>
                  <p className="text-[10px] text-muted-foreground truncate min-w-0">
                    {MOCK_TABLA_GOLEO[0].equipo}
                  </p>
                </div>
              </div>
              <span className="text-xl font-black text-primary flex-shrink-0">
                {MOCK_TABLA_GOLEO[0].goles} Goles
              </span>
            </div>

            <div className="pt-3 border-t border-secondary flex items-center justify-end">
              <button
                type="button"
                className="min-h-[40px] px-4 py-2 bg-secondary hover:bg-secondary/80 text-foreground font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all shadow-sm flex items-center justify-center cursor-pointer"
              >
                Ver Goleadores →
              </button>
            </div>
          </div>

        </div>

        {/* REGLAS DEL TORNEO (UBICADAS ARRIBA DE LA ZONA DE PELIGRO) */}
        <div className="bg-card rounded-3xl border border-secondary p-6 shadow-sm space-y-3">
          <div className="pb-3 border-b border-secondary">
            <h3 className="text-lg font-black text-foreground tracking-tight">
              Reglas y Detalles del Torneo
            </h3>
            <p className="text-xs text-muted-foreground">
              Indicaciones oficiales escritas por la organización del torneo.
            </p>
          </div>

          {reglas ? (
            <div className="bg-background rounded-2xl border border-secondary p-5 whitespace-pre-wrap text-sm text-foreground leading-relaxed">
              {reglas}
            </div>
          ) : (
            <p className="text-xs text-muted-foreground py-4 text-center">
              El organizador no ha especificado reglas adicionales para este torneo.
            </p>
          )}
        </div>

        {/* ZONA DE PELIGRO Y ELIMINACIÓN DE TORNEO (HASTA ABAJO DE TODO) */}
        {isOrganizer && !isInvitado && (
          <div className="p-6 rounded-3xl border border-red-500/30 bg-red-500/5 shadow-sm space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h4 className="text-sm font-black text-red-600 uppercase tracking-wider">
                  Zona de Peligro del Torneo
                </h4>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Eliminar este torneo borrará de forma permanente sus partidos, inscripciones y estadísticas.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setModalEliminarOpen(true)}
                className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-black text-xs uppercase tracking-wider rounded-2xl transition-all shadow-md self-start sm:self-auto"
              >
                Eliminar Torneo
              </button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* MODALES EMERGENTES DE EXPANSIÓN COMPLETA */}
        {/* ========================================================================= */}

        {/* 1. MODAL COMPLETO DE EQUIPOS */}
        {modalEquiposOpen && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
            <div className="bg-card rounded-3xl border border-secondary max-w-2xl w-full p-6 shadow-2xl space-y-5 max-h-[85vh] flex flex-col animate-in zoom-in-95 duration-200">
              <div className="flex justify-between items-center pb-3 border-b border-secondary">
                <div>
                  <h3 className="text-xl font-black text-foreground tracking-tight">
                    Equipos Inscritos ({equipos.length})
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Lista oficial de clubes participantes en la liguilla.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setModalEquiposOpen(false)}
                  className="text-muted-foreground hover:text-foreground text-xl font-bold p-1"
                >
                  ✕
                </button>
              </div>

              <div className="overflow-y-auto flex-1 p-1">
                {equipos.length === 0 ? (
                  <p className="text-xs text-muted-foreground py-8 text-center">
                    Aún no hay equipos inscritos en este torneo.
                  </p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {equipos.map((eq) => {
                      const clubColor = eq.color || "#991b1b";
                      return (
                        <div
                          key={eq.id}
                          className="bg-background rounded-2xl border border-secondary p-4 flex items-center gap-4 relative overflow-hidden shadow-sm"
                          style={{
                            background: `linear-gradient(135deg, ${clubColor}25 0%, var(--color-card) 80%)`,
                          }}
                        >
                          {/* Escudo PNG Nativo (Sin silueta circular) */}
                          <div className="w-14 h-14 rounded-2xl flex items-center justify-center overflow-hidden flex-shrink-0 p-1">
                            {eq.logo_url ? (
                              <img
                                src={eq.logo_url}
                                alt={eq.nombre}
                                className="max-w-full max-h-full object-contain filter drop-shadow-md"
                              />
                            ) : (
                              <span className="text-xl font-black text-white uppercase">
                                {eq.nombre.charAt(0)}
                              </span>
                            )}
                          </div>

                          <div className="flex-1 truncate">
                            <h4 className="font-bold text-foreground text-sm truncate">
                              {eq.nombre}
                            </h4>
                            <div className="flex items-center gap-2 mt-1">
                              <span
                                className="w-2.5 h-2.5 rounded-full border border-white/20"
                                style={{ backgroundColor: clubColor }}
                              />
                              <span className="text-[10px] uppercase font-bold text-muted-foreground">
                                Club Registrado
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-secondary flex items-center justify-between gap-3">
                {!isInvitado && (
                  <Link
                    href={`/torneos/${torneo.id}/inscribir`}
                    className="px-5 py-2.5 bg-primary text-primary-foreground font-black text-xs uppercase tracking-wider rounded-xl hover:bg-primary-light transition-all shadow"
                  >
                    + Inscribir Nuevo Club
                  </Link>
                )}
                <button
                  type="button"
                  onClick={() => setModalEquiposOpen(false)}
                  className="px-5 py-2.5 bg-secondary text-foreground rounded-xl font-bold text-xs hover:bg-secondary/80 transition-colors ml-auto"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 2. MODAL COMPLETO DE ROL DE JUEGOS (CON DEGRADADO POR EQUIPO) */}
        {modalCalendarioOpen && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
            <div className="bg-card rounded-3xl border border-secondary max-w-2xl w-full p-6 shadow-2xl space-y-5 max-h-[85vh] flex flex-col animate-in zoom-in-95 duration-200">
              <div className="flex justify-between items-center pb-3 border-b border-secondary">
                <div>
                  <h3 className="text-xl font-black text-foreground tracking-tight">
                    Rol de Juegos Completo
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Calendario oficial de jornadas y marcadores.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setModalCalendarioOpen(false)}
                  className="text-muted-foreground hover:text-foreground text-xl font-bold p-1"
                >
                  ✕
                </button>
              </div>

              <div className="overflow-y-auto flex-1 p-1 space-y-3">
                {MOCK_PARTIDOS.map((match) => (
                  <div
                    key={match.id}
                    className="bg-background rounded-2xl border border-secondary p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm relative overflow-hidden"
                  >
                    <div>
                      <span className="text-[10px] font-black text-primary uppercase tracking-widest bg-primary/10 px-2.5 py-1 rounded-md border border-primary/20">
                        {match.jornada}
                      </span>
                      <p className="text-xs font-bold text-foreground mt-1.5">
                        {match.fecha} • {match.hora}
                      </p>
                      <p className="text-xs text-muted-foreground">{match.cancha}</p>
                    </div>

                    <div className="flex items-center gap-2 bg-card p-2 rounded-2xl border border-secondary flex-1 max-w-md">
                      {/* Lado Local con Degradado de su Color Oficial */}
                      <div
                        className="flex items-center gap-2 flex-1 min-w-0 justify-end text-right p-2 rounded-xl transition-all"
                        style={{
                          background: `linear-gradient(90deg, ${match.localColor}40 0%, transparent 100%)`,
                        }}
                      >
                        <span className="font-bold text-xs text-foreground truncate min-w-0">
                          {match.local}
                        </span>
                        <span
                          className="w-3.5 h-3.5 rounded-full border border-white/20 flex-shrink-0 shadow-sm"
                          style={{ backgroundColor: match.localColor }}
                        />
                      </div>

                      {/* Marcador */}
                      <div className="px-3 py-1 bg-background rounded-xl font-black text-xs border border-secondary shadow-inner flex-shrink-0">
                        {match.estado === "Finalizado"
                          ? `${match.marcadorLocal} - ${match.marcadorVisitante}`
                          : "VS"}
                      </div>

                      {/* Lado Visitante con Degradado de su Color Oficial */}
                      <div
                        className="flex items-center gap-2 flex-1 min-w-0 text-left p-2 rounded-xl transition-all"
                        style={{
                          background: `linear-gradient(270deg, ${match.visitanteColor}40 0%, transparent 100%)`,
                        }}
                      >
                        <span
                          className="w-3.5 h-3.5 rounded-full border border-white/20 flex-shrink-0 shadow-sm"
                          style={{ backgroundColor: match.visitanteColor }}
                        />
                        <span className="font-bold text-xs text-foreground truncate min-w-0">
                          {match.visitante}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-3 border-t border-secondary flex justify-end">
                <button
                  type="button"
                  onClick={() => setModalCalendarioOpen(false)}
                  className="px-5 py-2.5 bg-secondary text-foreground rounded-xl font-bold text-xs hover:bg-secondary/80 transition-colors"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 3. MODAL COMPLETO DE TABLA DE POSICIONES */}
        {modalPosicionesOpen && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
            <div className="bg-card rounded-3xl border border-secondary max-w-3xl w-full p-6 shadow-2xl space-y-5 max-h-[85vh] flex flex-col animate-in zoom-in-95 duration-200">
              <div className="flex justify-between items-center pb-3 border-b border-secondary">
                <div>
                  <h3 className="text-xl font-black text-foreground tracking-tight">
                    Tabla General de Posiciones Completa
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Estadísticas clasificatorias acumuladas del torneo.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setModalPosicionesOpen(false)}
                  className="text-muted-foreground hover:text-foreground text-xl font-bold p-1"
                >
                  ✕
                </button>
              </div>

              <div className="overflow-y-auto flex-1 p-1">
                {tablaPosiciones.length === 0 ? (
                  <p className="text-xs text-muted-foreground py-8 text-center">
                    Inscribe equipos para ver la tabla clasificatoria.
                  </p>
                ) : (
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-secondary text-muted-foreground font-black uppercase text-[10px] tracking-wider">
                        <th className="py-2.5 px-2 text-center">Pos</th>
                        <th className="py-2.5 px-4">Equipo</th>
                        <th className="py-2.5 px-2 text-center">PJ</th>
                        <th className="py-2.5 px-2 text-center">PG</th>
                        <th className="py-2.5 px-2 text-center">PE</th>
                        <th className="py-2.5 px-2 text-center">PP</th>
                        <th className="py-2.5 px-2 text-center">GF</th>
                        <th className="py-2.5 px-2 text-center">GC</th>
                        <th className="py-2.5 px-2 text-center">DG</th>
                        <th className="py-2.5 px-3 text-center text-primary font-black">Pts</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-secondary/50 font-semibold text-foreground">
                      {tablaPosiciones.map((row) => (
                        <tr key={row.pos} className="hover:bg-secondary/30 transition-colors">
                          <td className="py-3 px-2 text-center font-bold">{row.pos}</td>
                          <td className="py-3 px-4 flex items-center gap-2">
                            <span
                              className="w-2.5 h-2.5 rounded-full border border-white/20"
                              style={{ backgroundColor: row.color }}
                            />
                            <span className="font-bold">{row.equipo}</span>
                          </td>
                          <td className="py-3 px-2 text-center">{row.pj}</td>
                          <td className="py-3 px-2 text-center">{row.pg}</td>
                          <td className="py-3 px-2 text-center">{row.pe}</td>
                          <td className="py-3 px-2 text-center">{row.pp}</td>
                          <td className="py-3 px-2 text-center">{row.gf}</td>
                          <td className="py-3 px-2 text-center">{row.gc}</td>
                          <td className="py-3 px-2 text-center font-bold">
                            {row.dg > 0 ? `+${row.dg}` : row.dg}
                          </td>
                          <td className="py-3 px-3 text-center font-black text-primary text-base bg-primary/10 rounded-lg">
                            {row.pts}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>

              <div className="pt-3 border-t border-secondary flex justify-end">
                <button
                  type="button"
                  onClick={() => setModalPosicionesOpen(false)}
                  className="px-5 py-2.5 bg-secondary text-foreground rounded-xl font-bold text-xs hover:bg-secondary/80 transition-colors"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 4. MODAL COMPLETO DE LÍDERES DE GOLEO */}
        {modalGoleoOpen && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
            <div className="bg-card rounded-3xl border border-secondary max-w-xl w-full p-6 shadow-2xl space-y-5 max-h-[85vh] flex flex-col animate-in zoom-in-95 duration-200">
              <div className="flex justify-between items-center pb-3 border-b border-secondary">
                <div>
                  <h3 className="text-xl font-black text-foreground tracking-tight">
                    Líderes de Goleo Completos
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Tabla individual de anotadores del torneo.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setModalGoleoOpen(false)}
                  className="text-muted-foreground hover:text-foreground text-xl font-bold p-1"
                >
                  ✕
                </button>
              </div>

              <div className="overflow-y-auto flex-1 p-1 space-y-3">
                {MOCK_TABLA_GOLEO.map((gol) => (
                  <div
                    key={gol.pos}
                    className="bg-background rounded-2xl border border-secondary p-4 flex items-center justify-between shadow-sm"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 text-primary font-black text-xs flex items-center justify-center border border-primary/20">
                        {gol.pos}
                      </div>
                      <div>
                        <h4 className="font-bold text-foreground text-sm">
                          {gol.jugador}
                        </h4>
                        <span className="text-[10px] text-muted-foreground font-semibold">
                          {gol.equipo}
                        </span>
                      </div>
                    </div>

                    <span className="text-xl font-black text-primary">
                      {gol.goles} Goles
                    </span>
                  </div>
                ))}
              </div>

              <div className="pt-3 border-t border-secondary flex justify-end">
                <button
                  type="button"
                  onClick={() => setModalGoleoOpen(false)}
                  className="px-5 py-2.5 bg-secondary text-foreground rounded-xl font-bold text-xs hover:bg-secondary/80 transition-colors"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 5. MODAL DE CONFIRMACIÓN DE ELIMINACIÓN (ZONA DE PELIGRO) */}
        {modalEliminarOpen && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
            <div className="bg-card rounded-3xl border border-red-500/40 max-w-md w-full p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in duration-200">
              <div className="space-y-2 text-center">
                <div className="w-12 h-12 rounded-full bg-red-500/10 text-red-500 font-black text-xl flex items-center justify-center mx-auto border border-red-500/20">
                  !
                </div>
                <h3 className="text-xl font-black text-foreground tracking-tight">
                  ¿Confirmar Eliminación del Torneo?
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Esta acción es irreversible. Se eliminarán permanentemente el torneo{" "}
                  <strong className="text-foreground">{torneo.nombre}</strong>, sus partidos, inscripciones y estadísticas asociadas.
                </p>
              </div>

              <div className="pt-4 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setModalEliminarOpen(false)}
                  disabled={deleting}
                  className="flex-1 py-3 bg-secondary hover:bg-secondary/80 text-foreground font-bold text-xs uppercase tracking-wider rounded-xl transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleConfirmEliminar}
                  disabled={deleting}
                  className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white font-black text-xs uppercase tracking-wider rounded-xl transition-colors shadow-lg disabled:opacity-50"
                >
                  {deleting ? "Eliminando..." : "Sí, Eliminar"}
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </AppLayout>
  );
}