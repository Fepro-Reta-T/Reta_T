"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { torneosApi, inscripcionesApi, partidosApi } from "@/lib/api";
import type { Torneo, Equipo, Partido } from "@reta-t/types";
import AppLayout from "@/components/AppLayout";
import { BracketPreview } from "@/components/BracketPreview";

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
  const [partidos, setPartidos] = useState<Partido[]>([]);
  const [loading, setLoading] = useState(true);

  const [error, setError] = useState<string | null>(null);

  // Modales de Expansión Completa
  const [modalEquiposOpen, setModalEquiposOpen] = useState(false);
  const [modalCalendarioOpen, setModalCalendarioOpen] = useState(false);
  const [modalPosicionesOpen, setModalPosicionesOpen] = useState(false);
  const [modalGoleoOpen, setModalGoleoOpen] = useState(false);
  const [modalEliminarOpen, setModalEliminarOpen] = useState(false);
  const [modalInvitarOpen, setModalInvitarOpen] = useState(false);
  const [modalSolicitudesOpen, setModalSolicitudesOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [copiado, setCopiado] = useState(false);

  // Solicitudes de inscripción
  const [solicitudes, setSolicitudes] = useState<any[]>([]);
  const [loadingSolicitudes, setLoadingSolicitudes] = useState(false);
  const [procesandoSolicitudId, setProcesandoSolicitudId] = useState<string | null>(null);

  const [isInvitado] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("invitado") === "true";
    }
    return false;
  });

  const [currentUser] = useState<{ id?: string; role?: string } | null>(() => {
    if (typeof window !== "undefined") {
      const userStr = localStorage.getItem("user");
      if (userStr) {
        try {
          return JSON.parse(userStr);
        } catch {}
      }
    }
    return null;
  });

  const isDuenoOAdmin =
    !isInvitado &&
    Boolean(currentUser) &&
    (currentUser?.role === "admin" ||
      currentUser?.role === "organizer" ||
      (Boolean(torneo?.organizer_id) && torneo?.organizer_id === currentUser?.id));

  useEffect(() => {
    async function cargarDatos() {
      try {
        const torneoData = await torneosApi.obtener(torneoId);
        const equiposInscritos = await inscripcionesApi.listarEquiposInscritos(torneoId);
        let partidosTorneo: Partido[] = [];
        try {
          partidosTorneo = await partidosApi.listarPorTorneo(torneoId);
        } catch {
          partidosTorneo = [];
        }

        setTorneo(torneoData);
        setEquipos(equiposInscritos);
        setPartidos(partidosTorneo);
        setError(null);

        // Cargar solicitudes si es organizador/admin
        if (
          !isInvitado &&
          currentUser &&
          (currentUser.role === "admin" ||
            currentUser.role === "organizer" ||
            torneoData.organizer_id === currentUser.id)
        ) {
          try {
            const sols = await inscripcionesApi.listarSolicitudes(torneoId);
            setSolicitudes(sols);
          } catch {
            setSolicitudes([]);
          }
        }
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
  }, [torneoId, isInvitado, currentUser]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const searchParams = new URLSearchParams(window.location.search);
      if (searchParams.get("created") === "true") {
        setModalInvitarOpen(true);
        // Limpiamos el query param sin recargar
        router.replace(`/torneos/${torneoId}`);
      }
    }
  }, [torneoId, router]);

  async function handleCopiarEnlace() {
    if (typeof window !== "undefined") {
      const url = `${window.location.origin}/torneos/${torneoId}/unirse`;
      await navigator.clipboard.writeText(url);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 2500);
    }
  }

  async function handleProcesarSolicitud(equipoId: string, accion: "ACEPTAR" | "RECHAZAR") {
    try {
      setProcesandoSolicitudId(equipoId);
      await inscripcionesApi.procesarSolicitud(torneoId, equipoId, accion);
      const nuevasSolicitudes = await inscripcionesApi.listarSolicitudes(torneoId);
      setSolicitudes(nuevasSolicitudes);
      const equiposActualizados = await inscripcionesApi.listarEquiposInscritos(torneoId);
      setEquipos(equiposActualizados);
    } catch (err: any) {
      alert(err.message || "Error al procesar la solicitud");
      console.error(err);
    } finally {
      setProcesandoSolicitudId(null);
    }
  }


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

  // Mapa rápido de equipos por ID
  const equipoMap = new Map<string, Equipo>();
  equipos.forEach((e) => equipoMap.set(e.id, e));

  // Cálculo REAL de tabla de posiciones basado en los partidos jugados
  const statsMap = new Map<
    string,
    { equipo: string; color: string; logo_url?: string | null; pj: number; pg: number; pe: number; pp: number; gf: number; gc: number; dg: number; pts: number }
  >();

  equipos.forEach((eq) => {
    statsMap.set(eq.id, {
      equipo: eq.nombre,
      color: eq.color || "#991b1b",
      logo_url: eq.logo_url,
      pj: 0,
      pg: 0,
      pe: 0,
      pp: 0,
      gf: 0,
      gc: 0,
      dg: 0,
      pts: 0,
    });
  });

  partidos.forEach((p) => {
    const estado = p.datos_adicionales?.estado;
    const ml = p.datos_adicionales?.marcador_local;
    const mv = p.datos_adicionales?.marcador_visitante;

    if (estado === "Finalizado" && typeof ml === "number" && typeof mv === "number") {
      const el = statsMap.get(p.equipo_local_id);
      const ev = statsMap.get(p.equipo_visitante_id);

      if (el && ev) {
        el.pj += 1;
        ev.pj += 1;
        el.gf += ml;
        el.gc += mv;
        ev.gf += mv;
        ev.gc += ml;
        el.dg = el.gf - el.gc;
        ev.dg = ev.gf - ev.gc;

        if (ml > mv) {
          el.pg += 1;
          el.pts += 3;
          ev.pp += 1;
        } else if (mv > ml) {
          ev.pg += 1;
          ev.pts += 3;
          el.pp += 1;
        } else {
          el.pe += 1;
          el.pts += 1;
          ev.pe += 1;
          ev.pts += 1;
        }
      }
    }
  });

  const tablaPosiciones = Array.from(statsMap.values()).sort((a, b) => {
    if (b.pts !== a.pts) return b.pts - a.pts;
    if (b.dg !== a.dg) return b.dg - a.dg;
    if (b.gf !== a.gf) return b.gf - a.gf;
    return a.equipo.localeCompare(b.equipo);
  }).map((row, idx) => ({ pos: idx + 1, ...row }));

  // Agrupación de partidos reales por jornada para el Bracket/Rol de Juegos
  const jornadasMap = new Map<number, Partido[]>();
  partidos.forEach((p) => {
    const j = p.datos_adicionales?.jornada || 1;
    if (!jornadasMap.has(j)) jornadasMap.set(j, []);
    jornadasMap.get(j)!.push(p);
  });
  const jornadasOrdenadas = Array.from(jornadasMap.entries()).sort(([a], [b]) => a - b);

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

        {/* HERO BANNER DE PORTADA DEL TORNEO */}
        <div className="relative w-full h-60 sm:h-72 rounded-3xl overflow-hidden border border-secondary shadow-xl group bg-card">
          <img
            src={portada}
            alt={torneo.nombre}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
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

        {/* DETALLES GENERALES */}
        <div className="bg-card rounded-3xl border border-secondary p-5 shadow-sm space-y-3">
          <h3 className="text-sm font-black uppercase tracking-wider text-muted-foreground border-b border-secondary pb-2">
            Detalles Generales del Torneo
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <span className="block text-[10px] font-bold text-muted-foreground uppercase">Deporte</span>
              <span className="block text-sm font-black text-foreground mt-0.5">{torneo.sport?.nombre || "N/A"}</span>
            </div>
            <div>
              <span className="block text-[10px] font-bold text-muted-foreground uppercase">Categoría</span>
              <span className="block text-sm font-black text-foreground mt-0.5">{torneo.categoria}</span>
            </div>
            <div>
              <span className="block text-[10px] font-bold text-muted-foreground uppercase">Tipo</span>
              <span className="block text-sm font-black text-foreground mt-0.5 uppercase">
                {torneo.datos_adicionales?.formato?.tipo_formato || "N/A"}
              </span>
            </div>
            <div>
              <span className="block text-[10px] font-bold text-muted-foreground uppercase">Cupo</span>
              <span className="block text-sm font-black text-foreground mt-0.5">
                {torneo.max_equipos || torneo.datos_adicionales?.formato?.num_equipos || "Sin Límite"}
              </span>
            </div>
          </div>
        </div>

        {/* BARRA DE ACCIONES PRINCIPALES (VERTICAL) */}
        <div className="flex flex-col gap-3">
          <button
            type="button"
            onClick={() => setModalInvitarOpen(true)}
            className="w-full min-h-[52px] px-6 py-3 bg-primary hover:bg-primary-light text-primary-foreground font-black text-sm uppercase tracking-wider rounded-2xl transition-all shadow-md text-center flex items-center justify-center gap-2"
          >
            <span>🔗 Invitar por Enlace</span>
          </button>

          {isDuenoOAdmin && (
            <button
              type="button"
              onClick={() => setModalSolicitudesOpen(true)}
              className="w-full min-h-[52px] px-6 py-3 bg-secondary hover:bg-secondary/80 text-foreground border border-secondary font-black text-sm uppercase tracking-wider rounded-2xl transition-all shadow-sm text-center flex items-center justify-center gap-2 relative"
            >
              <span>Solicitudes</span>
              {solicitudes.filter((s) => s.estado === "PENDIENTE").length > 0 && (
                <span className="absolute top-1/2 -translate-y-1/2 right-4 px-2 py-0.5 bg-primary text-primary-foreground text-[10px] font-black rounded-full shadow-sm border border-primary/20">
                  {solicitudes.filter((s) => s.estado === "PENDIENTE").length}
                </span>
              )}
            </button>
          )}

          {isDuenoOAdmin && (
            <Link
              href={`/partidos/nuevo?torneo_id=${torneo.id}`}
              className="w-full min-h-[52px] px-6 py-3 bg-secondary hover:bg-secondary/80 text-foreground border border-secondary font-black text-sm uppercase tracking-wider rounded-2xl transition-all shadow-sm text-center flex items-center justify-center gap-2"
            >
              <span>Programar Partido</span>
            </Link>
          )}
        </div>



        {/* DASHBOARD MODULAR INTERACTIVO (4 TARJETAS DE VISTA PREVIA CON DATOS REALES) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          
          {/* TARJETA 1: EQUIPOS PARTICIPANTES */}
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

          {/* TARJETA 2: ROL DE JUEGOS Y BRACKET (DATOS REALES) */}
          <div
            onClick={() => setModalCalendarioOpen(true)}
            className="bg-card rounded-3xl border border-secondary p-6 shadow-sm hover:border-primary/50 transition-all cursor-pointer group flex flex-col justify-between space-y-4 hover:shadow-xl"
          >
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-black text-primary uppercase tracking-widest bg-primary/10 px-2.5 py-1 rounded-md border border-primary/20">
                  Fixture & Encontrazos
                </span>
                <h3 className="text-xl font-black text-foreground tracking-tight mt-2">
                  Rol de Juegos
                </h3>
              </div>
              <span className="text-xs font-extrabold text-muted-foreground bg-background px-3 py-1.5 rounded-2xl border border-secondary">
                {partidos.length} Partidos
              </span>
            </div>

            {partidos.length === 0 ? (
              <div className="bg-background rounded-2xl border border-secondary p-4 text-center">
                <p className="text-xs text-muted-foreground font-semibold">
                  Aún no se ha generado el fixture de encuentros.
                </p>
              </div>
            ) : (
              <div className="bg-background rounded-2xl border border-secondary p-3 flex items-center justify-between gap-2 overflow-hidden">
                {(() => {
                  const p = partidos[0];
                  const eqLoc = equipoMap.get(p.equipo_local_id) || p.equipo_local;
                  const eqVis = equipoMap.get(p.equipo_visitante_id) || p.equipo_visitante;
                  const colorLoc = eqLoc?.color || "#991b1b";
                  const colorVis = eqVis?.color || "#1e3a8a";

                  return (
                    <>
                      <div
                        className="flex items-center gap-2 flex-1 min-w-0 p-2 rounded-xl"
                        style={{
                          background: `linear-gradient(90deg, ${colorLoc}40 0%, transparent 100%)`,
                        }}
                      >
                        <span
                          className="w-3 h-3 rounded-full flex-shrink-0"
                          style={{ backgroundColor: colorLoc }}
                        />
                        <span className="font-bold text-xs text-foreground truncate min-w-0">
                          {eqLoc?.nombre || "Local"}
                        </span>
                      </div>

                      <span className="px-2.5 py-1 bg-secondary rounded-lg font-black text-xs text-foreground flex-shrink-0">
                        {p.datos_adicionales?.marcador_local != null
                          ? `${p.datos_adicionales.marcador_local} - ${p.datos_adicionales.marcador_visitante}`
                          : "VS"}
                      </span>

                      <div
                        className="flex items-center gap-2 flex-1 min-w-0 justify-end p-2 rounded-xl text-right"
                        style={{
                          background: `linear-gradient(270deg, ${colorVis}40 0%, transparent 100%)`,
                        }}
                      >
                        <span className="font-bold text-xs text-foreground truncate min-w-0">
                          {eqVis?.nombre || "Visitante"}
                        </span>
                        <span
                          className="w-3 h-3 rounded-full flex-shrink-0"
                          style={{ backgroundColor: colorVis }}
                        />
                      </div>
                    </>
                  );
                })()}
              </div>
            )}

            <div className="pt-3 border-t border-secondary flex items-center justify-end">
              <button
                type="button"
                className="min-h-[40px] px-4 py-2 bg-secondary hover:bg-secondary/80 text-foreground font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all shadow-sm flex items-center justify-center cursor-pointer"
              >
                Ver Fixture Completo →
              </button>
            </div>
          </div>



          {/* TARJETA 4: LÍDERES DE GOLEO REAL (ESTADO LIMPIO) */}
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
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
                  </svg>
                </div>
                <div className="truncate min-w-0">
                  <p className="font-bold text-xs text-foreground truncate min-w-0">
                    Sin goles registrados
                  </p>
                  <p className="text-[10px] text-muted-foreground truncate min-w-0">
                    Los goles capturados en la PWA aparecerán aquí.
                  </p>
                </div>
              </div>
              <span className="text-xl font-black text-primary flex-shrink-0">
                0 Goles
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

        {/* ESTRUCTURA DEL TORNEO (BRACKET / LIGA) */}
        {torneo.datos_adicionales?.formato && (
          <div className="bg-card rounded-3xl border border-secondary p-6 shadow-sm overflow-hidden">
            <h3 className="text-xl font-black text-foreground tracking-tight mb-4 flex items-center gap-2">
              Estructura del Torneo
              <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-widest bg-secondary/50 px-2.5 py-1 rounded-full border border-secondary">
                Previsualización Oficial
              </span>
            </h3>
            <BracketPreview
              numEquipos={torneo.max_equipos || torneo.datos_adicionales.formato.num_equipos || equipos.length || 4}
              tipoFormato={torneo.datos_adicionales.formato.tipo_formato}
              terCerLugar={torneo.datos_adicionales.formato.tercer_lugar}
              clasificados={torneo.datos_adicionales.formato.clasificados_playoffs}
              numGrupos={torneo.datos_adicionales.formato.num_grupos}
              equiposPorGrupo={torneo.datos_adicionales.formato.equipos_por_grupo}
              clasificadosPorGrupo={torneo.datos_adicionales.formato.clasificados_por_grupo}
              teamNames={equipos.map(e => e.nombre)}
            />
          </div>
        )}

        {/* REGLAS DEL TORNEO */}
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

        {/* ZONA DE PELIGRO Y ELIMINACIÓN DE TORNEO */}
        {isDuenoOAdmin && (
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

        {/* 2. MODAL COMPLETO DE ROL DE JUEGOS Y BRACKET (JORNADAS REALES) */}
        {modalCalendarioOpen && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
            <div className="bg-card rounded-3xl border border-secondary max-w-3xl w-full p-6 shadow-2xl space-y-5 max-h-[85vh] flex flex-col animate-in zoom-in-95 duration-200">
              <div className="flex justify-between items-center pb-3 border-b border-secondary">
                <div>
                  <h3 className="text-xl font-black text-foreground tracking-tight">
                    Rol de Juegos & Bracket por Jornadas
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Calendario oficial de partidos del torneo ({partidos.length} en total).
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

              <div className="overflow-y-auto flex-1 p-1 space-y-6">
                {partidos.length === 0 ? (
                  <div className="py-12 text-center space-y-4">
                    <p className="text-sm font-bold text-muted-foreground">
                      Aún no hay partidos en este torneo.
                    </p>
                    {isDuenoOAdmin && equipos.length >= 2 && (
                      <Link
                        href={`/partidos/nuevo?torneo_id=${torneo.id}`}
                        className="inline-block px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs uppercase tracking-wider rounded-2xl shadow transition-all"
                      >
                        Programar Partidos Ahora
                      </Link>
                    )}
                  </div>
                ) : (
                  jornadasOrdenadas.map(([jornadaNum, partidosJornada]) => (
                    <div key={jornadaNum} className="space-y-3">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black uppercase tracking-widest bg-primary/10 text-primary px-3 py-1 rounded-xl border border-primary/20">
                          Jornada {jornadaNum}
                        </span>
                        <div className="h-[1px] bg-secondary flex-1" />
                      </div>

                      <div className="grid grid-cols-1 gap-3">
                        {partidosJornada.map((match) => {
                          const eqLoc = equipoMap.get(match.equipo_local_id) || match.equipo_local;
                          const eqVis = equipoMap.get(match.equipo_visitante_id) || match.equipo_visitante;
                          const colorLoc = eqLoc?.color || "#991b1b";
                          const colorVis = eqVis?.color || "#1e3a8a";

                          const tieneMarcador = match.datos_adicionales?.marcador_local != null;

                          return (
                            <div
                              key={match.id}
                              className="bg-background rounded-2xl border border-secondary p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm relative overflow-hidden"
                            >
                              <div className="text-xs">
                                <p className="font-bold text-foreground">
                                  {match.fecha ? new Date(match.fecha).toLocaleString("es-MX") : "Fecha por definir"}
                                </p>
                                <p className="text-muted-foreground text-[10px]">
                                  {match.cancha?.nombre || "Cancha por definir"}
                                </p>
                              </div>

                              <div className="flex items-center gap-2 bg-card p-2 rounded-2xl border border-secondary flex-1 max-w-md">
                                <div
                                  className="flex items-center gap-2 flex-1 min-w-0 justify-end text-right p-2 rounded-xl"
                                  style={{
                                    background: `linear-gradient(90deg, ${colorLoc}40 0%, transparent 100%)`,
                                  }}
                                >
                                  <span className="font-bold text-xs text-foreground truncate min-w-0">
                                    {eqLoc?.nombre || "Local"}
                                  </span>
                                  <span
                                    className="w-3.5 h-3.5 rounded-full border border-white/20 flex-shrink-0 shadow-sm"
                                    style={{ backgroundColor: colorLoc }}
                                  />
                                </div>

                                <div className="px-3 py-1 bg-background rounded-xl font-black text-xs border border-secondary shadow-inner flex-shrink-0">
                                  {tieneMarcador
                                    ? `${match.datos_adicionales?.marcador_local} - ${match.datos_adicionales?.marcador_visitante}`
                                    : "VS"}
                                </div>

                                <div
                                  className="flex items-center gap-2 flex-1 min-w-0 text-left p-2 rounded-xl"
                                  style={{
                                    background: `linear-gradient(270deg, ${colorVis}40 0%, transparent 100%)`,
                                  }}
                                >
                                  <span
                                    className="w-3.5 h-3.5 rounded-full border border-white/20 flex-shrink-0 shadow-sm"
                                    style={{ backgroundColor: colorVis }}
                                  />
                                  <span className="font-bold text-xs text-foreground truncate min-w-0">
                                    {eqVis?.nombre || "Visitante"}
                                  </span>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))
                )}
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

        {/* 3. MODAL COMPLETO DE TABLA DE POSICIONES (REAL) */}
        {modalPosicionesOpen && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
            <div className="bg-card rounded-3xl border border-secondary max-w-3xl w-full p-6 shadow-2xl space-y-5 max-h-[85vh] flex flex-col animate-in zoom-in-95 duration-200">
              <div className="flex justify-between items-center pb-3 border-b border-secondary">
                <div>
                  <h3 className="text-xl font-black text-foreground tracking-tight">
                    Tabla General de Posiciones
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

        {/* 4. MODAL COMPLETO DE GOLEADORES */}
        {modalGoleoOpen && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
            <div className="bg-card rounded-3xl border border-secondary max-w-xl w-full p-6 shadow-2xl space-y-5 max-h-[85vh] flex flex-col animate-in zoom-in-95 duration-200">
              <div className="flex justify-between items-center pb-3 border-b border-secondary">
                <div>
                  <h3 className="text-xl font-black text-foreground tracking-tight">
                    Tabla de Goleo Individual
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Registro acumulado de goleadores del torneo.
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

              <div className="overflow-y-auto flex-1 p-4 text-center space-y-2">
                <div className="w-12 h-12 mx-auto rounded-full bg-primary/10 text-primary flex items-center justify-center border border-primary/20">
                  <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
                  </svg>
                </div>
                <p className="font-bold text-sm text-foreground">
                  Aún no hay goles registrados en este torneo.
                </p>
                <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                  A medida que los partidos se jueguen y se registren en la PWA de arbitraje, los goleadores aparecerán automáticamente en esta tabla.
                </p>
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

        {/* MODAL CONFIRMAR ELIMINACIÓN */}
        {modalEliminarOpen && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
            <div className="bg-card rounded-3xl border border-red-500/30 max-w-md w-full p-6 shadow-2xl space-y-4 animate-in zoom-in-95 duration-200">
              <h3 className="text-lg font-black text-red-500">¿Eliminar Torneo?</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Esta acción no se puede deshacer. Se eliminarán permanentemente el torneo{" "}
                <strong className="text-foreground">"{torneo.nombre}"</strong> y todos sus datos asociados.
              </p>
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setModalEliminarOpen(false)}
                  disabled={deleting}
                  className="px-4 py-2 bg-secondary hover:bg-secondary/80 text-foreground font-bold text-xs rounded-xl transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleConfirmEliminar}
                  disabled={deleting}
                  className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white font-black text-xs uppercase tracking-wider rounded-xl transition-colors shadow disabled:opacity-50"
                >
                  {deleting ? "Eliminando..." : "Sí, Eliminar"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL INVITAR EQUIPOS / COMPARTIR ENLACE */}
        {modalInvitarOpen && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
            <div className="bg-card rounded-3xl border border-secondary max-w-lg w-full p-6 shadow-2xl space-y-5 animate-in zoom-in-95 duration-200">
              <div className="flex justify-between items-center pb-3 border-b border-secondary">
                <div>
                  <h3 className="text-xl font-black text-foreground tracking-tight">
                    Invitar Equipos al Torneo
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Comparte este enlace público con capitanes y directores técnicos.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setModalInvitarOpen(false)}
                  className="text-muted-foreground hover:text-foreground text-xl font-bold p-1"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <div className="p-4 bg-background rounded-2xl border border-secondary space-y-2">
                  <span className="block text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground">
                    Enlace de Inscripción Pública
                  </span>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value={typeof window !== "undefined" ? `${window.location.origin}/torneos/${torneo.id}/unirse` : `/torneos/${torneo.id}/unirse`}
                      className="w-full bg-secondary/50 border border-secondary rounded-xl px-3 py-2 text-xs font-mono text-foreground select-all focus:outline-none"
                    />
                    <button
                      type="button"
                      onClick={handleCopiarEnlace}
                      className={`min-w-[100px] px-4 py-2 rounded-xl font-black text-xs uppercase tracking-wider transition-all flex-shrink-0 flex items-center justify-center gap-1.5 ${
                        copiado
                          ? "bg-emerald-600 text-white"
                          : "bg-primary hover:bg-primary-light text-primary-foreground"
                      }`}
                    >
                      {copiado ? (
                        <>
                          <svg className="w-4 h-4 text-white animate-in zoom-in spin-in-180 duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                          <span>¡Copiado!</span>
                        </>
                      ) : (
                        <span>Copiar</span>
                      )}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-background rounded-2xl border border-secondary">
                    <span className="block text-[10px] uppercase font-bold text-muted-foreground">
                      Cupo Máximo
                    </span>
                    <span className="text-sm font-black text-foreground mt-0.5 block">
                      {equipos.length} / {torneo.max_equipos || "Ilimitado"}
                    </span>
                  </div>

                  <div className="p-3 bg-background rounded-2xl border border-secondary">
                    <span className="block text-[10px] uppercase font-bold text-muted-foreground">
                      Fecha Límite
                    </span>
                    <span className="text-sm font-black text-foreground mt-0.5 block">
                      {torneo.fecha_cierre_inscripcion
                        ? new Date(torneo.fecha_cierre_inscripcion).toLocaleDateString()
                        : "Sin fecha de corte"}
                    </span>
                  </div>
                </div>

                <p className="text-[11px] text-muted-foreground">
                  Los capitanes podrán postular su equipo. Podrás revisar y aprobar cada solicitud desde el panel de solicitudes de este torneo.
                </p>
              </div>

              <div className="pt-3 border-t border-secondary flex justify-end">
                <button
                  type="button"
                  onClick={() => setModalInvitarOpen(false)}
                  className="px-5 py-2.5 bg-secondary text-foreground rounded-xl font-bold text-xs hover:bg-secondary/80 transition-colors"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL BANDEJA DE SOLICITUDES DE INSCRIPCIÓN */}
        {modalSolicitudesOpen && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
            <div className="bg-card rounded-3xl border border-secondary max-w-xl w-full p-6 shadow-2xl space-y-5 max-h-[85vh] flex flex-col animate-in zoom-in-95 duration-200">
              <div className="flex justify-between items-center pb-3 border-b border-secondary">
                <div>
                  <h3 className="text-xl font-black text-foreground tracking-tight">
                    Solicitudes de Inscripción
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Revisa y aprueba los equipos que han solicitado unirse a través del enlace de invitación.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setModalSolicitudesOpen(false)}
                  className="text-muted-foreground hover:text-foreground text-xl font-bold p-1"
                >
                  ✕
                </button>
              </div>

              <div className="overflow-y-auto flex-1 p-1 space-y-3">
                {solicitudes.length === 0 ? (
                  <div className="text-center py-10 space-y-2">
                    <p className="font-bold text-sm text-foreground">
                      No hay solicitudes registradas
                    </p>
                    <p className="text-xs text-muted-foreground max-w-xs mx-auto">
                      Comparte el enlace del torneo para que los capitanes de equipo envíen sus solicitudes.
                    </p>
                  </div>
                ) : (
                  solicitudes.map((sol) => {
                    const esPendiente = sol.estado === "PENDIENTE";
                    const isProcessing = procesandoSolicitudId === sol.equipo_id;

                    return (
                      <div
                        key={sol.id}
                        className="p-4 bg-background rounded-2xl border border-secondary flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-black text-sm text-foreground">
                              {sol.equipo?.nombre || `Equipo ID: ${sol.equipo_id.slice(0, 8)}...`}
                            </span>
                            <span
                              className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-full ${
                                sol.estado === "APROBADA"
                                  ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                                  : sol.estado === "RECHAZADA"
                                  ? "bg-red-500/20 text-red-400 border border-red-500/30"
                                  : "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                              }`}
                            >
                              {sol.estado}
                            </span>
                          </div>
                          <span className="block text-[11px] text-muted-foreground">
                            Fecha de solicitud: {new Date(sol.fecha_solicitud).toLocaleString()}
                          </span>
                        </div>

                        {esPendiente && (
                          <div className="flex items-center gap-2 self-end sm:self-center">
                            <button
                              type="button"
                              disabled={isProcessing}
                              onClick={() => handleProcesarSolicitud(sol.equipo_id, "ACEPTAR")}
                              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow"
                            >
                              {isProcessing ? "..." : "Aprobar"}
                            </button>
                            <button
                              type="button"
                              disabled={isProcessing}
                              onClick={() => handleProcesarSolicitud(sol.equipo_id, "RECHAZAR")}
                              className="px-4 py-2 bg-destructive/10 hover:bg-destructive/20 border border-destructive/30 text-destructive font-black text-xs uppercase tracking-wider rounded-xl transition-all"
                            >
                              {isProcessing ? "..." : "Rechazar"}
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>

              <div className="pt-3 border-t border-secondary flex justify-end">
                <button
                  type="button"
                  onClick={() => setModalSolicitudesOpen(false)}
                  className="px-5 py-2.5 bg-secondary text-foreground rounded-xl font-bold text-xs hover:bg-secondary/80 transition-colors"
                >
                  Cerrar
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </AppLayout>
  );
}