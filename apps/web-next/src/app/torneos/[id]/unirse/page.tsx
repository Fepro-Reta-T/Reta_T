"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { torneosApi, equiposApi, inscripcionesApi } from "@/lib/api";
import type { Torneo, Equipo, User } from "@reta-t/types";
import AppLayout from "@/components/AppLayout";

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

function getNombreModalidad(tipoFormato?: string) {
  switch (tipoFormato) {
    case "liga":
      return "Liga Regular";
    case "eliminacion":
      return "Eliminación Directa";
    case "liga_playoffs":
      return "Liga + Playoffs";
    case "grupos_eliminacion":
      return "Grupos + Eliminación";
    default:
      return tipoFormato || "Formato Estándar";
  }
}

export default function UnirseTorneoPage() {
  const params = useParams();
  const router = useRouter();
  const torneoId = params.id as string;

  const [torneo, setTorneo] = useState<Torneo | null>(null);
  const [misEquipos, setMisEquipos] = useState<Equipo[]>([]);
  const [equiposInscritos, setEquiposInscritos] = useState<Equipo[]>([]);
  
  const [selectedEquipoId, setSelectedEquipoId] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [mensajeExito, setMensajeExito] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isInvitado, setIsInvitado] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const invitadoVal = localStorage.getItem("invitado") === "true";
      setIsInvitado(invitadoVal);

      const userStr = localStorage.getItem("user");
      if (userStr && !invitadoVal) {
        try {
          setCurrentUser(JSON.parse(userStr));
        } catch {
          setCurrentUser(null);
        }
      }
    }
  }, []);

  useEffect(() => {
    async function cargarDatos() {
      try {
        setLoading(true);
        setError(null);

        // 1. Obtener detalles del torneo
        const torneoData = await torneosApi.obtener(torneoId);
        setTorneo(torneoData);

        // 2. Obtener equipos inscritos
        const inscritos = await inscripcionesApi.listarEquiposInscritos(torneoId);
        setEquiposInscritos(inscritos);

        // 3. Si el usuario está autenticado, cargar sus equipos
        const userStr = localStorage.getItem("user");
        const invitadoVal = localStorage.getItem("invitado") === "true";
        if (userStr && !invitadoVal) {
          const userObj = JSON.parse(userStr);
          const todosLosEquipos = await equiposApi.listar();
          
          // Filtrar equipos donde el usuario es el creador
          const propios = todosLosEquipos.filter(
            (eq: any) =>
              eq.creator_id === userObj.id ||
              eq.datos_adicionales?.creador_id === userObj.id ||
              eq.datos_adicionales?.organizer_id === userObj.id
          );
          setMisEquipos(propios);

          // Filtrar solo los que coinciden con los requisitos del torneo
          const categoriaTorneo = (torneoData.categoria || "").toLowerCase();
          const compatibles = propios.filter(
            (eq) =>
              !categoriaTorneo ||
              (eq.datos_adicionales?.tipo_equipo || "").toLowerCase() === categoriaTorneo
          );

          if (compatibles.length > 0) {
            setSelectedEquipoId(compatibles[0].id);
          }
        }
      } catch (err: any) {
        console.error("Error al cargar datos:", err);
        setError("No se pudo cargar la información del torneo o el enlace no es válido.");
      } finally {
        setLoading(false);
      }
    }

    if (torneoId) {
      cargarDatos();
    }
  }, [torneoId]);

  async function handleEnviarSolicitud(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedEquipoId) {
      setError("Por favor selecciona un equipo para enviar la solicitud.");
      return;
    }

    setEnviando(true);
    setError(null);
    setMensajeExito(null);

    try {
      const res = await inscripcionesApi.crearSolicitud(torneoId, selectedEquipoId);
      setMensajeExito(res.message || "Solicitud de inscripción enviada. El organizador revisará tu solicitud.");
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Error al enviar la solicitud de inscripción.");
    } finally {
      setEnviando(false);
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

  if (!torneo) {
    return (
      <AppLayout>
        <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
          <div className="bg-destructive/10 border border-destructive/20 text-destructive p-6 rounded-2xl max-w-md w-full">
            <h2 className="font-black text-lg mb-2">Torneo no disponible</h2>
            <p className="text-sm mb-4">
              {error || "No se encontró el torneo o la invitación ha caducado."}
            </p>
            <Link
              href="/torneos"
              className="inline-block px-6 py-2.5 bg-primary text-primary-foreground font-bold rounded-xl text-xs uppercase tracking-wider hover:bg-primary-light transition-colors"
            >
              Explorar Torneos
            </Link>
          </div>
        </div>
      </AppLayout>
    );
  }

  // Verificaciones de cupo y vigencia
  const totalInscritos = equiposInscritos.length;
  const maxEquipos = torneo.max_equipos || torneo.datos_adicionales?.formato?.num_equipos || null;
  const cupoLleno = maxEquipos !== null && totalInscritos >= maxEquipos;
  
  let fechaExpirada = false;
  if (torneo.fecha_cierre_inscripcion) {
    const fechaCierre = new Date(torneo.fecha_cierre_inscripcion);
    if (!isNaN(fechaCierre.getTime()) && new Date() > fechaCierre) {
      fechaExpirada = true;
    }
  }

  const inscripcionesCerradas = cupoLleno || fechaExpirada;
  const portada = torneo.datos_adicionales?.imagen_portada || "/Futbol 7.jpg";
  const badgeClass = getCategoryBadgeClass(torneo.categoria);
  
  // Nombre directo del deporte
  const deporteNombre = torneo.datos_adicionales?.sport_nombre || torneo.sport?.nombre || "Fútbol";
  const modalidadNombre = getNombreModalidad(torneo.datos_adicionales?.formato?.tipo_formato);
  const descripcionTorneo =
    torneo.datos_adicionales?.descripcion ||
    torneo.datos_adicionales?.reglas ||
    torneo.datos_adicionales?.formato?.reglas ||
    "";

  // Solo mostrar equipos que cumplen con la categoría del torneo
  const categoriaTorneo = (torneo.categoria || "").toLowerCase();
  const equiposElegibles = misEquipos.filter((eq) => {
    if (!categoriaTorneo) return true;
    const ramaEquipo = (eq.datos_adicionales?.tipo_equipo || "").toLowerCase();
    return ramaEquipo === categoriaTorneo;
  });

  return (
    <AppLayout>
      <div className="p-4 md:p-8 pb-24 max-w-3xl mx-auto space-y-6 font-sans">
        
        {/* Enlace de Regreso */}
        <Link
          href={`/torneos/${torneo.id}`}
          className="inline-flex items-center gap-1.5 text-xs font-extrabold text-muted-foreground hover:text-foreground transition-colors"
        >
          ← Ver torneo
        </Link>

        {/* HERO CARD DEL TORNEO */}
        <div className="relative w-full rounded-3xl overflow-hidden border border-secondary shadow-xl bg-card">
          <div className="relative h-48 sm:h-56">
            <img
              src={portada}
              alt={torneo.nombre}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-card via-card/75 via-45% to-black/35" />
            
            <div className="absolute inset-0 p-6 sm:p-8 flex flex-col justify-end z-10 space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className={`text-xs uppercase tracking-widest font-extrabold px-3.5 py-1 rounded-full border shadow-sm ${badgeClass}`}>
                  Categoría: {torneo.categoria}
                </span>
                <span className="text-xs uppercase tracking-widest font-extrabold text-foreground bg-card/85 backdrop-blur-md px-3.5 py-1 rounded-full border border-secondary shadow-sm">
                  {deporteNombre}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight leading-tight">
                {torneo.nombre}
              </h1>
            </div>
          </div>

          {/* METADATOS TÉCNICOS */}
          <div className="p-4 sm:p-5 grid grid-cols-2 sm:grid-cols-4 gap-3 border-t border-secondary bg-card/50">
            <div className="p-3 bg-background rounded-2xl border border-secondary">
              <span className="block text-[10px] uppercase font-extrabold text-muted-foreground tracking-wider">
                Deporte
              </span>
              <span className="text-xs sm:text-sm font-black text-foreground mt-0.5 block truncate capitalize">
                {deporteNombre}
              </span>
            </div>

            <div className="p-3 bg-background rounded-2xl border border-secondary">
              <span className="block text-[10px] uppercase font-extrabold text-muted-foreground tracking-wider">
                Modalidad
              </span>
              <span className="text-xs sm:text-sm font-black text-foreground mt-0.5 block truncate">
                {modalidadNombre}
              </span>
            </div>

            <div className="p-3 bg-background rounded-2xl border border-secondary">
              <span className="block text-[10px] uppercase font-extrabold text-muted-foreground tracking-wider">
                Cupo
              </span>
              <span className="text-xs sm:text-sm font-black text-foreground mt-0.5 block">
                {totalInscritos} / {maxEquipos ?? "Ilimitado"}
              </span>
            </div>

            <div className="p-3 bg-background rounded-2xl border border-secondary">
              <span className="block text-[10px] uppercase font-extrabold text-muted-foreground tracking-wider">
                Cierre
              </span>
              <span className="text-xs sm:text-sm font-black text-foreground mt-0.5 block">
                {torneo.fecha_cierre_inscripcion
                  ? new Date(torneo.fecha_cierre_inscripcion).toLocaleDateString()
                  : "Abierto"}
              </span>
            </div>
          </div>
        </div>

        {/* SECCIÓN DE DESCRIPCIÓN */}
        {descripcionTorneo && (
          <div className="bg-card border border-secondary rounded-3xl p-6 shadow-sm space-y-3">
            <h2 className="text-base font-black text-foreground">
              Descripción
            </h2>
            <div className="p-4 bg-background rounded-2xl border border-secondary text-xs text-foreground whitespace-pre-line leading-relaxed">
              {descripcionTorneo}
            </div>
          </div>
        )}

        {/* ALERTA DE INSCRIPCIONES CERRADAS */}
        {inscripcionesCerradas && (
          <div className="p-5 bg-destructive/10 border border-destructive/20 rounded-3xl text-center space-y-2">
            <h3 className="text-base font-black text-destructive">
              {cupoLleno ? "Cupo Lleno" : "Plazo Vencido"}
            </h3>
            <p className="text-xs text-muted-foreground">
              {cupoLleno
                ? "Este torneo ha alcanzado el límite máximo de equipos participantes."
                : "La fecha límite para enviar solicitudes de inscripción ha concluido."}
            </p>
          </div>
        )}

        {/* MENSAJE DE ÉXITO */}
        {mensajeExito && (
          <div className="p-6 bg-emerald-500/10 border border-emerald-500/30 rounded-3xl space-y-3">
            <h3 className="text-base font-black text-foreground">
              Solicitud Registrada
            </h3>
            <p className="text-xs text-muted-foreground">
              {mensajeExito}
            </p>
            <div className="pt-2">
              <Link
                href={`/torneos/${torneo.id}`}
                className="inline-flex items-center justify-center min-h-[44px] px-6 py-2.5 bg-secondary hover:bg-secondary/80 text-foreground font-black text-xs uppercase tracking-wider rounded-xl transition-all"
              >
                Volver al Torneo
              </Link>
            </div>
          </div>
        )}

        {/* SI EL USUARIO NO ESTÁ AUTENTICADO */}
        {(!currentUser || isInvitado) && !inscripcionesCerradas && !mensajeExito && (
          <div className="p-6 bg-card border border-secondary rounded-3xl space-y-4 text-center">
            <div className="space-y-1">
              <h3 className="text-lg font-black text-foreground">
                Inscripción de Equipos
              </h3>
              <p className="text-xs text-muted-foreground max-w-md mx-auto">
                Inicia sesión con tu cuenta de coach o capitán para seleccionar tu equipo y enviar tu solicitud.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <Link
                href={`/login?redirect=/torneos/${torneo.id}/unirse`}
                className="w-full sm:w-auto min-h-[44px] px-8 py-3 bg-primary hover:bg-primary-light text-primary-foreground font-black text-xs uppercase tracking-wider rounded-2xl shadow-lg transition-all flex items-center justify-center"
              >
                Iniciar Sesión
              </Link>
              <Link
                href={`/register?redirect=/torneos/${torneo.id}/unirse`}
                className="w-full sm:w-auto min-h-[44px] px-8 py-3 bg-secondary hover:bg-secondary/80 text-foreground border border-secondary font-black text-xs uppercase tracking-wider rounded-2xl shadow-sm transition-all flex items-center justify-center"
              >
                Crear Cuenta
              </Link>
            </div>
          </div>
        )}

        {/* FORMULARIO DE SELECCIÓN DE EQUIPO ELEGIBLE */}
        {currentUser && !isInvitado && !inscripcionesCerradas && !mensajeExito && (
          <form
            onSubmit={handleEnviarSolicitud}
            className="p-6 bg-card border border-secondary rounded-3xl space-y-6 shadow-sm"
          >
            <div className="border-b border-secondary pb-4">
              <h2 className="text-xl font-black text-foreground tracking-tight">
                Seleccionar Equipo
              </h2>
              <p className="text-xs text-muted-foreground mt-1">
                Mostrando tus equipos compatibles con la categoría {torneo.categoria}.
              </p>
            </div>

            {error && (
              <div className="p-4 bg-destructive/10 border border-destructive/20 text-destructive text-xs font-semibold rounded-2xl">
                {error}
              </div>
            )}

            {/* SELECCIÓN DE EQUIPOS COMPATIBLES */}
            {equiposElegibles.length === 0 ? (
              <div className="p-6 bg-background rounded-2xl border border-secondary text-center space-y-3">
                <p className="text-xs text-muted-foreground">
                  No tienes equipos registrados con categoría <strong className="text-foreground capitalize">{torneo.categoria}</strong>.
                </p>
                <Link
                  href="/equipos/nuevo"
                  className="inline-flex items-center justify-center min-h-[44px] px-6 py-2.5 bg-primary hover:bg-primary-light text-primary-foreground font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-md"
                >
                  + Crear Equipo {torneo.categoria}
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {equiposElegibles.map((eq) => {
                    const esSeleccionado = selectedEquipoId === eq.id;
                    const clubColor = eq.color || "#991b1b";

                    return (
                      <div
                        key={eq.id}
                        onClick={() => setSelectedEquipoId(eq.id)}
                        className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                          esSeleccionado
                            ? "bg-primary/10 border-primary shadow-md ring-2 ring-primary/20"
                            : "bg-background border-secondary hover:border-secondary-hover"
                        }`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div
                            className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-black text-sm flex-shrink-0"
                            style={{ backgroundColor: clubColor }}
                          >
                            {eq.nombre.charAt(0)}
                          </div>
                          <div className="min-w-0">
                            <span className="block text-sm font-black text-foreground truncate">
                              {eq.nombre}
                            </span>
                            <span className="text-[10px] uppercase font-extrabold text-muted-foreground block mt-0.5">
                              {eq.datos_adicionales?.tipo_equipo || "Club"}
                            </span>
                          </div>
                        </div>

                        <input
                          type="radio"
                          name="equipoSelect"
                          checked={esSeleccionado}
                          onChange={() => setSelectedEquipoId(eq.id)}
                          className="accent-primary w-4 h-4 cursor-pointer"
                        />
                      </div>
                    );
                  })}
                </div>

                <div className="flex items-center justify-between pt-2">
                  <span className="text-[11px] text-muted-foreground">
                    ¿Deseas registrar otro club para este torneo?
                  </span>
                  <Link
                    href="/equipos/nuevo"
                    className="text-xs font-black text-primary hover:underline"
                  >
                    + Crear otro equipo
                  </Link>
                </div>
              </div>
            )}

            {/* BOTÓN ENVIAR SOLICITUD */}
            {equiposElegibles.length > 0 && (
              <div className="pt-4 border-t border-secondary">
                <button
                  type="submit"
                  disabled={enviando || !selectedEquipoId}
                  className="w-full min-h-[44px] px-8 py-3.5 bg-primary hover:bg-primary-light disabled:opacity-50 text-primary-foreground font-black text-xs uppercase tracking-wider rounded-2xl shadow-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  {enviando ? (
                    <span>Enviando Solicitud...</span>
                  ) : (
                    <span>Enviar Solicitud de Inscripción</span>
                  )}
                </button>
              </div>
            )}
          </form>
        )}

      </div>
    </AppLayout>
  );
}
