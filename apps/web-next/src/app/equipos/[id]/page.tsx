"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { equiposApi } from "@/lib/api";
import type { Equipo } from "@reta-t/types";
import AppLayout from "@/components/AppLayout";

interface Jugador {
  id: string;
  nombre: string;
  posicion: string;
  dorsal: number;
  telefono?: string;
  goles?: number;
}

const INITIAL_JUGADORES: Jugador[] = [
  { id: "j1", nombre: "Mateo Valenzuela", posicion: "POR", dorsal: 1, goles: 0 },
  { id: "j2", nombre: "Carlos Enrique", posicion: "DEF", dorsal: 4, goles: 1 },
  { id: "j3", nombre: "Santiago Morales", posicion: "DEF", dorsal: 2, goles: 0 },
  { id: "j4", nombre: "Luis Fernando", posicion: "MED", dorsal: 8, goles: 3 },
  { id: "j5", nombre: "Javier Hernández", posicion: "MED", dorsal: 10, goles: 5 },
  { id: "j6", nombre: "Iker Ramírez", posicion: "EXT", dorsal: 7, goles: 6 },
  { id: "j7", nombre: "Diego Armenta", posicion: "DEL", dorsal: 9, goles: 8 },
];

function getPosicionesPorDeporte(sportNombre?: string) {
  const s = (sportNombre || "").toLowerCase();

  if (s.includes("basket") || s.includes("baloncesto")) {
    return [
      { key: "BASE", label: "BASE", nombreFull: "Base (Naranja)", style: "bg-orange-500/20 text-orange-400 border-orange-500/30" },
      { key: "ESC", label: "ESC", nombreFull: "Escolta (Amarillo)", style: "bg-amber-400/20 text-amber-300 border-amber-400/30" },
      { key: "ALA", label: "ALA", nombreFull: "Alero (Verde)", style: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" },
      { key: "APO", label: "APO", nombreFull: "Ala-Pívot (Azul)", style: "bg-blue-600/20 text-blue-400 border-blue-600/30" },
      { key: "PIV", label: "PIV", nombreFull: "Pívot (Azul Claro)", style: "bg-sky-400/20 text-sky-300 border-sky-400/30" },
    ];
  }

  if (s.includes("volley") || s.includes("volei")) {
    return [
      { key: "COL", label: "COL", nombreFull: "Colocador (Naranja)", style: "bg-orange-500/20 text-orange-400 border-orange-500/30" },
      { key: "REM", label: "REM", nombreFull: "Rematador (Amarillo)", style: "bg-amber-400/20 text-amber-300 border-amber-400/30" },
      { key: "CENT", label: "CENT", nombreFull: "Central (Verde)", style: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" },
      { key: "LIB", label: "LIB", nombreFull: "Líbero (Azul)", style: "bg-blue-600/20 text-blue-400 border-blue-600/30" },
      { key: "OP", label: "OP", nombreFull: "Opuesto (Azul Claro)", style: "bg-sky-400/20 text-sky-300 border-sky-400/30" },
    ];
  }

  if (s.includes("beisbol") || s.includes("softbol")) {
    return [
      { key: "LAN", label: "LAN", nombreFull: "Lanzador (Naranja)", style: "bg-orange-500/20 text-orange-400 border-orange-500/30" },
      { key: "REC", label: "REC", nombreFull: "Receptor (Amarillo)", style: "bg-amber-400/20 text-amber-300 border-amber-400/30" },
      { key: "INF", label: "INF", nombreFull: "Infield (Verde)", style: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" },
      { key: "OUT", label: "OUT", nombreFull: "Outfield (Azul)", style: "bg-blue-600/20 text-blue-400 border-blue-600/30" },
      { key: "BD", label: "BD", nombreFull: "Bateador Des. (Azul Claro)", style: "bg-sky-400/20 text-sky-300 border-sky-400/30" },
    ];
  }

  // Fútbol / Futsal (Por defecto)
  return [
    { key: "POR", label: "POR", nombreFull: "Portero (Naranja)", style: "bg-orange-500/20 text-orange-400 border-orange-500/30" },
    { key: "DEF", label: "DEF", nombreFull: "Defensa (Amarillo)", style: "bg-amber-400/20 text-amber-300 border-amber-400/30" },
    { key: "MED", label: "MED", nombreFull: "Medio (Verde)", style: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" },
    { key: "DEL", label: "DEL", nombreFull: "Delantero (Azul)", style: "bg-blue-600/20 text-blue-400 border-blue-600/30" },
    { key: "EXT", label: "EXT", nombreFull: "Extremo (Azul Claro)", style: "bg-sky-400/20 text-sky-300 border-sky-400/30" },
  ];
}

export default function GestionEquipoCoachPage() {
  const params = useParams();
  const router = useRouter();
  const equipoId = params.id as string;

  const [equipo, setEquipo] = useState<Equipo | null>(null);
  const [jugadores, setJugadores] = useState<Jugador[]>(INITIAL_JUGADORES);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [modalAgregarJugadorOpen, setModalAgregarJugadorOpen] = useState(false);
  const [modalEditarEquipoOpen, setModalEditarEquipoOpen] = useState(false);
  const [modalEliminarEquipoOpen, setModalEliminarEquipoOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Formulario nuevo jugador
  const [nuevoNombre, setNuevoNombre] = useState("");
  const [nuevaPosicion, setNuevaPosicion] = useState<string>("");
  const [nuevoDorsal, setNuevoDorsal] = useState<number>(11);
  const [nuevoTelefono, setNuevoTelefono] = useState("");

  const [currentUser] = useState<{ id?: string; email?: string; role?: string } | null>(() => {
    if (typeof window !== "undefined") {
      const uStr = localStorage.getItem("user");
      return uStr ? JSON.parse(uStr) : null;
    }
    return null;
  });

  const [isInvitado] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("invitado") === "true";
    }
    return false;
  });

  useEffect(() => {
    async function cargarDatos() {
      try {
        setLoading(true);
        const data = await equiposApi.obtener(equipoId);
        setEquipo(data);
        setError(null);

        const sportName = (data as any).sport?.nombre || data.datos_adicionales?.sport_nombre;
        const posicionesPosibles = getPosicionesPorDeporte(sportName);
        if (posicionesPosibles.length > 0) {
          setNuevaPosicion(posicionesPosibles[0].key);

          // Adaptar posiciones de la plantilla mock al deporte
          setJugadores((prev) => 
            prev.map((jugador, index) => {
              const posIndex = index % posicionesPosibles.length;
              return { ...jugador, posicion: posicionesPosibles[posIndex].key };
            })
          );
        }
      } catch (err) {
        console.error("Error al cargar el equipo:", err);
        setError("Error al cargar la información del equipo.");
      } finally {
        setLoading(false);
      }
    }

    if (equipoId) {
      cargarDatos();
    }
  }, [equipoId]);

  function handleAgregarJugador(e: React.FormEvent) {
    e.preventDefault();
    if (!nuevoNombre.trim()) return;

    const jugadorNuevo: Jugador = {
      id: `j_${Date.now()}`,
      nombre: nuevoNombre.trim(),
      posicion: nuevaPosicion || "MED",
      dorsal: Number(nuevoDorsal) || 99,
      telefono: nuevoTelefono.trim() || undefined,
      goles: 0,
    };

    setJugadores((prev) => [...prev, jugadorNuevo]);
    setNuevoNombre("");
    setNuevoDorsal((prev) => prev + 1);
    setNuevoTelefono("");
    setModalAgregarJugadorOpen(false);
  }

  function handleEliminarJugador(id: string) {
    if (!confirm("¿Estás seguro de quitar a este jugador de la plantilla?")) return;
    setJugadores((prev) => prev.filter((j) => j.id !== id));
  }

  async function handleEliminarEquipo() {
    if (!equipo) return;
    try {
      setDeleting(true);
      await equiposApi.eliminar(equipo.id);
      router.push("/equipos");
    } catch (err: any) {
      console.error("Error al eliminar el equipo:", err);
      alert("Error al eliminar el equipo: " + (err?.detail || err?.message || "Inténtalo de nuevo."));
    } finally {
      setDeleting(false);
      setModalEliminarEquipoOpen(false);
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

  if (error || !equipo) {
    return (
      <AppLayout>
        <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
          <p className="text-red-500 font-bold text-lg mb-4">
            {error || "Equipo no encontrado"}
          </p>
          <Link
            href="/equipos"
            className="px-5 py-2.5 bg-primary text-primary-foreground font-bold rounded-xl text-xs hover:bg-primary-light transition-colors shadow"
          >
            ← Volver a Directorio de Equipos
          </Link>
        </div>
      </AppLayout>
    );
  }

  const clubColor = equipo.color || "#991b1b";
  const tipoEquipo = equipo.datos_adicionales?.tipo_equipo || "Club";
  const sportNombre = (equipo as any).sport?.nombre || equipo.datos_adicionales?.sport_nombre || "Fútbol";
  const posicionesDisponibles = getPosicionesPorDeporte(sportNombre);
  const totalGoles = jugadores.reduce((acc, j) => acc + (j.goles || 0), 0);

  const isCoach = !isInvitado && Boolean(currentUser);
  const isCreador = Boolean(
    currentUser?.id &&
      ((equipo as any).creator_id === currentUser.id ||
        equipo.datos_adicionales?.creador_id === currentUser.id ||
        equipo.datos_adicionales?.organizer_id === currentUser.id ||
        (equipo as any).organizer_id === currentUser.id)
  );
  const puedeEliminar = !isInvitado && Boolean(currentUser) && (currentUser?.role === "admin" || isCreador || isCoach);

  return (
    <AppLayout>
      <div className="p-4 md:p-8 pb-24 max-w-5xl mx-auto space-y-6">
        
        {/* Volver */}
        <Link
          href="/equipos"
          className="inline-flex items-center text-sm font-bold text-muted-foreground hover:text-foreground transition-colors"
        >
          ← Volver a Equipos
        </Link>

        {/* HERO BANNER DE IDENTIDAD DEL CLUB */}
        <div
          className="relative w-full rounded-3xl p-6 sm:p-8 border border-secondary shadow-xl overflow-hidden"
          style={{
            background: `linear-gradient(135deg, ${clubColor}55 0%, rgba(9,9,11,0.95) 75%)`,
          }}
        >
          <div className="relative z-10 flex flex-col sm:flex-row items-center sm:items-start gap-6">
            
            {/* Escudo PNG Nativo Grande */}
            <div className="w-32 h-32 sm:w-44 sm:h-44 flex items-center justify-center flex-shrink-0 p-2 drop-shadow-2xl">
              {equipo.logo_url ? (
                <img
                  src={equipo.logo_url}
                  alt={equipo.nombre}
                  className="max-w-full max-h-full object-contain filter drop-shadow-2xl"
                />
              ) : (
                <div
                  className="w-32 h-32 sm:w-40 sm:h-40 rounded-3xl flex items-center justify-center font-black text-white text-5xl shadow-2xl border border-white/20"
                  style={{ backgroundColor: clubColor }}
                >
                  {equipo.nombre.charAt(0)}
                </div>
              )}
            </div>

            {/* Datos del Club */}
            <div className="space-y-2 text-center sm:text-left flex-1">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <span className="text-xs uppercase tracking-widest font-extrabold text-white bg-white/20 backdrop-blur-md px-3 py-1 rounded-full border border-white/20">
                  Rama: {tipoEquipo}
                </span>
                <span className="text-xs uppercase tracking-widest font-extrabold text-primary-light bg-primary/30 backdrop-blur-md px-3 py-1 rounded-full border border-primary/30">
                  {sportNombre}
                </span>
              </div>

              <h1 className="text-3xl sm:text-4xl font-black text-white drop-shadow-md tracking-tight">
                {equipo.nombre}
              </h1>

              {/* Métricas Rápidas */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3">
                <div className="bg-black/30 backdrop-blur-md border border-white/10 p-3 rounded-2xl text-center">
                  <span className="text-2xl font-black text-white">{jugadores.length}</span>
                  <span className="block text-[10px] uppercase font-bold text-muted-foreground">
                    Plantilla Total
                  </span>
                </div>
                <div className="bg-black/30 backdrop-blur-md border border-white/10 p-3 rounded-2xl text-center">
                  <span className="text-2xl font-black text-white">4</span>
                  <span className="block text-[10px] uppercase font-bold text-muted-foreground">
                    Partidos Jugados
                  </span>
                </div>
                <div className="bg-black/30 backdrop-blur-md border border-white/10 p-3 rounded-2xl text-center">
                  <span className="text-2xl font-black text-white">{totalGoles}</span>
                  <span className="block text-[10px] uppercase font-bold text-muted-foreground">
                    Puntos/Goles
                  </span>
                </div>
                <div className="bg-black/30 backdrop-blur-md border border-white/10 p-3 rounded-2xl text-center">
                  <span className="text-2xl font-black text-white">1</span>
                  <span className="block text-[10px] uppercase font-bold text-muted-foreground">
                    Torneos Activos
                  </span>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* BARRA DE ACCIONES PRINCIPALES */}
        <div className="flex flex-wrap items-center gap-3 bg-card p-4 rounded-3xl border border-secondary shadow-sm">
          {!isInvitado && (
            <button
              type="button"
              onClick={() => setModalAgregarJugadorOpen(true)}
              className="flex-1 sm:flex-none px-6 py-3.5 bg-primary hover:bg-primary-light text-primary-foreground font-black text-xs uppercase tracking-wider rounded-2xl transition-all shadow-xl hover:scale-[1.02] active:scale-95 text-center"
            >
              + Agregar Jugador
            </button>
          )}

          {!isInvitado && (
            <button
              type="button"
              onClick={() => setModalEditarEquipoOpen(true)}
              className="flex-1 sm:flex-none px-6 py-3.5 bg-secondary hover:bg-secondary/80 text-foreground border border-secondary font-black text-xs uppercase tracking-wider rounded-2xl transition-all shadow-md text-center"
            >
              Editar Club
            </button>
          )}
        </div>

        {/* SECCIÓN DE PLANTILLA DE JUGADORES */}
        <div className="bg-card rounded-3xl border border-secondary p-6 shadow-sm space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-secondary">
            <div>
              <h2 className="text-xl font-black text-foreground tracking-tight">
                Plantilla de Jugadores ({jugadores.length})
              </h2>
              <p className="text-xs text-muted-foreground">
                Roster oficial adaptado a {sportNombre}.
              </p>
            </div>

            <span className="text-xs font-extrabold text-muted-foreground bg-background px-3 py-1.5 rounded-2xl border border-secondary self-start sm:self-auto uppercase">
              {sportNombre} Roster
            </span>
          </div>

          {jugadores.length === 0 ? (
            <p className="text-xs text-muted-foreground py-8 text-center">
              No hay jugadores agregados aún a este club.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {jugadores.map((jugador) => {
                const posObj = posicionesDisponibles.find((p) => p.key === jugador.posicion) ||
                  posicionesDisponibles[0];

                return (
                  <div
                    key={jugador.id}
                    className="bg-background rounded-2xl border border-secondary p-4 flex items-center justify-between gap-3 shadow-sm hover:border-primary/40 transition-colors"
                  >
                    <div className="flex items-center gap-3 truncate">
                      <div className="w-10 h-10 rounded-xl bg-secondary text-foreground font-black text-sm flex items-center justify-center border border-secondary flex-shrink-0 shadow-inner">
                        #{jugador.dorsal}
                      </div>

                      <div className="truncate">
                        <div className="flex items-center gap-2 truncate">
                          <span
                            className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md border ${posObj.style}`}
                            title={posObj.nombreFull}
                          >
                            {posObj.label}
                          </span>
                          <span className="font-bold text-foreground text-sm truncate">
                            {jugador.nombre}
                          </span>
                        </div>

                        <div className="flex items-center gap-3 mt-1 text-[10px] font-bold text-muted-foreground">
                          <span>{jugador.goles || 0} Pts/Goles</span>
                          {jugador.telefono && <span>• Tel: {jugador.telefono}</span>}
                        </div>
                      </div>
                    </div>

                    {!isInvitado && (
                      <button
                        type="button"
                        onClick={() => handleEliminarJugador(jugador.id)}
                        className="text-xs font-bold text-red-500 hover:text-red-700 hover:underline p-1"
                      >
                        Quitar
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* SECCIÓN DE TORNEOS Y CALENDARIO DEL CLUB */}
        <div className="bg-card rounded-3xl border border-secondary p-6 shadow-sm space-y-4">
          <h2 className="text-xl font-black text-foreground tracking-tight">
            Torneos y Competencias Activas
          </h2>
          <div className="bg-background rounded-2xl border border-secondary p-4 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-[10px] font-black text-primary uppercase tracking-widest bg-primary/10 px-2 py-0.5 rounded border border-primary/20">
                Torneo Actual
              </span>
              <h4 className="font-bold text-sm text-foreground">
                Liga Premier Reta_T ({sportNombre})
              </h4>
              <p className="text-xs text-muted-foreground">
                Fase Regular • Ubicación: Cancha Central
              </p>
            </div>
            <span className="text-xs font-black text-emerald-500 bg-emerald-500/10 px-3 py-1.5 rounded-xl border border-emerald-500/20">
              Inscrito
            </span>
          </div>
        </div>

        {/* ZONA DE PELIGRO / ELIMINAR CLUB (HASTA ABAJO) */}
        {puedeEliminar && (
          <div className="bg-red-500/5 border border-red-500/20 rounded-3xl p-6 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-1 text-center sm:text-left">
              <h3 className="text-sm font-black text-red-500 uppercase tracking-wider flex items-center justify-center sm:justify-start gap-2">
                <span>⚠️</span> Zona de Administración de Club
              </h3>
              <p className="text-xs text-muted-foreground">
                Como coach o creador, puedes eliminar permanentemente este club y toda su plantilla registrada.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setModalEliminarEquipoOpen(true)}
              className="w-full sm:w-auto px-6 py-3.5 bg-red-600 hover:bg-red-700 text-white font-black text-xs uppercase tracking-wider rounded-2xl transition-all shadow-lg hover:scale-105 active:scale-95 flex items-center justify-center gap-2 flex-shrink-0"
            >
              🗑️ Eliminar Club
            </button>
          </div>
        )}

        {/* MODAL EMERGENTE: AGREGAR JUGADOR */}
        {modalAgregarJugadorOpen && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
            <div className="bg-card rounded-3xl border border-secondary max-w-md w-full p-6 shadow-2xl space-y-5 animate-in zoom-in-95 duration-200">
              <div className="flex justify-between items-center pb-3 border-b border-secondary">
                <div>
                  <h3 className="text-xl font-black text-foreground tracking-tight">
                    + Agregar Jugador a la Plantilla
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Posiciones adaptadas a <strong className="text-foreground">{sportNombre}</strong>.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setModalAgregarJugadorOpen(false)}
                  className="text-muted-foreground hover:text-foreground text-xl font-bold p-1"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleAgregarJugador} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-foreground mb-1">
                    Nombre del Jugador *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Carlos Enrique"
                    value={nuevoNombre}
                    onChange={(e) => setNuevoNombre(e.target.value)}
                    className="w-full px-4 py-3 bg-background border border-secondary rounded-xl text-sm font-semibold text-foreground focus:outline-none focus:border-primary"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-foreground mb-1">
                      Posición ({sportNombre}) *
                    </label>
                    <select
                      value={nuevaPosicion}
                      onChange={(e) => setNuevaPosicion(e.target.value)}
                      className="w-full px-3 py-3 bg-background border border-secondary rounded-xl text-xs font-bold text-foreground focus:outline-none focus:border-primary"
                    >
                      {posicionesDisponibles.map((p) => (
                        <option key={p.key} value={p.key}>
                          {p.label} - {p.nombreFull}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-foreground mb-1">
                      Dorsal (#) *
                    </label>
                    <input
                      type="number"
                      required
                      min={1}
                      max={99}
                      value={nuevoDorsal}
                      onChange={(e) => setNuevoDorsal(Number(e.target.value))}
                      className="w-full px-4 py-3 bg-background border border-secondary rounded-xl text-sm font-semibold text-foreground focus:outline-none focus:border-primary"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-foreground mb-1">
                    Teléfono / Email (Opcional)
                  </label>
                  <input
                    type="text"
                    placeholder="Ej. 667-123-4567"
                    value={nuevoTelefono}
                    onChange={(e) => setNuevoTelefono(e.target.value)}
                    className="w-full px-4 py-3 bg-background border border-secondary rounded-xl text-sm font-semibold text-foreground focus:outline-none focus:border-primary"
                  />
                </div>

                <div className="pt-3 border-t border-secondary flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setModalAgregarJugadorOpen(false)}
                    className="flex-1 py-3 bg-secondary text-foreground rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-secondary/80 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3 bg-primary text-primary-foreground rounded-xl font-black text-xs uppercase tracking-wider hover:bg-primary-light transition-all shadow-md"
                  >
                    Guardar Jugador
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL EDITAR CLUB */}
        {modalEditarEquipoOpen && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
            <div className="bg-card rounded-3xl border border-secondary max-w-md w-full p-6 shadow-2xl space-y-5 animate-in zoom-in-95 duration-200">
              <div className="flex justify-between items-center pb-3 border-b border-secondary">
                <div>
                  <h3 className="text-xl font-black text-foreground tracking-tight">
                    Editar Datos del Club
                  </h3>
                  <p className="text-xs text-muted-foreground">
                    Modifica la información de {equipo.nombre}.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setModalEditarEquipoOpen(false)}
                  className="text-muted-foreground hover:text-foreground text-xl font-bold p-1"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4 text-xs text-muted-foreground">
                <p>
                  Nombre actual: <strong className="text-foreground">{equipo.nombre}</strong>
                </p>
                <p>
                  Rama: <strong className="text-foreground">{tipoEquipo}</strong>
                </p>
                <p>
                  Deporte: <strong className="text-foreground">{sportNombre}</strong>
                </p>
              </div>

              <div className="pt-3 border-t border-secondary flex justify-end">
                <button
                  type="button"
                  onClick={() => setModalEditarEquipoOpen(false)}
                  className="px-5 py-2.5 bg-secondary text-foreground rounded-xl font-bold text-xs hover:bg-secondary/80 transition-colors"
                >
                  Entendido
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL ELIMINAR CLUB */}
        {modalEliminarEquipoOpen && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
            <div className="bg-card rounded-3xl border border-red-500/30 max-w-md w-full p-6 shadow-2xl space-y-5 animate-in zoom-in-95 duration-200">
              <div className="flex justify-between items-center pb-3 border-b border-secondary">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-red-500/20 text-red-500 flex items-center justify-center font-black text-lg border border-red-500/30">
                    ⚠️
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-foreground tracking-tight">
                      ¿Eliminar Club?
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      Confirmación de acción permanente
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setModalEliminarEquipoOpen(false)}
                  disabled={deleting}
                  className="text-muted-foreground hover:text-foreground text-xl font-bold p-1 disabled:opacity-50"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-3 bg-red-500/5 border border-red-500/20 rounded-2xl p-4 text-xs text-foreground">
                <p className="font-medium leading-relaxed">
                  ¿Estás seguro de que deseas eliminar permanentemente el club{" "}
                  <strong className="text-red-400 font-extrabold text-sm underline decoration-red-500/50">
                    {equipo.nombre}
                  </strong>
                  ?
                </p>
                <p className="text-[11px] text-muted-foreground">
                  Esta acción no se puede deshacer. Se eliminarán los datos de la plantilla y su historial de participación.
                </p>
              </div>

              <div className="pt-3 border-t border-secondary flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setModalEliminarEquipoOpen(false)}
                  disabled={deleting}
                  className="flex-1 py-3 bg-secondary text-foreground rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-secondary/80 transition-colors disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleEliminarEquipo}
                  disabled={deleting}
                  className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-black text-xs uppercase tracking-wider transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {deleting ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    "Sí, Eliminar Club"
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </AppLayout>
  );
}
