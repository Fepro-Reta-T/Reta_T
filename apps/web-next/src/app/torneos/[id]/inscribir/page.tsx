"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { torneosApi, equiposApi, inscripcionesApi } from "@/lib/api";
import type { Torneo, Equipo, User } from "@reta-t/types";
import AppLayout from "@/components/AppLayout";

export default function InscribirEquipoPage() {
  const params = useParams();
  const router = useRouter();
  const torneoId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [loadingInscripcion, setLoadingInscripcion] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  const [torneo, setTorneo] = useState<Torneo | null>(null);
  const [equiposDisponibles, setEquiposDisponibles] = useState<Equipo[]>([]);
  const [equiposInscritos, setEquiposInscritos] = useState<Equipo[]>([]);
  const [selectedEquipoId, setSelectedEquipoId] = useState("");

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      try {
        setUser(JSON.parse(userStr));
      } catch {
        setUser(null);
      }
    }
  }, []);

  useEffect(() => {
    if (torneoId) {
      cargarDatos();
    }
  }, [torneoId]);

  async function cargarDatos() {
    try {
      setLoading(true);
      setError(null);

      const torneoData = await torneosApi.obtener(torneoId);
      setTorneo(torneoData);

      const equiposData = await equiposApi.listar();
      const inscritosData = await inscripcionesApi.listarEquiposInscritos(torneoId);
      setEquiposInscritos(inscritosData);

      const inscritosIds = new Set(inscritosData.map((e: Equipo) => e.id));
      const disponibles = equiposData.filter((e: Equipo) => !inscritosIds.has(e.id));
      setEquiposDisponibles(disponibles);

      if (disponibles.length > 0) {
        setSelectedEquipoId(disponibles[0].id);
      }
    } catch (err) {
      console.error("Error cargando datos:", err);
      setError("Error al cargar los datos para inscripción.");
    } finally {
      setLoading(false);
    }
  }

  async function handleInscribir(e: React.FormEvent) {
    e.preventDefault();
    setLoadingInscripcion(true);
    setError(null);
    setSuccess(false);

    if (!selectedEquipoId) {
      setError("Selecciona un equipo para inscribir.");
      setLoadingInscripcion(false);
      return;
    }

    if (!user) {
      setError("Debes iniciar sesión para inscribir un equipo.");
      setLoadingInscripcion(false);
      return;
    }

    try {
      await inscripcionesApi.inscribir(torneoId, selectedEquipoId);
      setSuccess(true);

      const equipoInscrito = equiposDisponibles.find((e) => e.id === selectedEquipoId);
      if (equipoInscrito) {
        setEquiposInscritos((prev) => [...prev, equipoInscrito]);
        const restantes = equiposDisponibles.filter((e) => e.id !== selectedEquipoId);
        setEquiposDisponibles(restantes);
        if (restantes.length > 0) {
          setSelectedEquipoId(restantes[0].id);
        } else {
          setSelectedEquipoId("");
        }
      }

      setTimeout(() => {
        router.push(`/torneos/${torneoId}`);
      }, 1500);
    } catch (err: any) {
      console.error("Error al inscribir:", err);
      setError(err?.message || "Error al inscribir el equipo.");
    } finally {
      setLoadingInscripcion(false);
    }
  }

  async function handleRetirar(equipoId: string) {
    if (!confirm("¿Estás seguro de retirar este equipo del torneo?")) return;

    try {
      await inscripcionesApi.retirar(torneoId, equipoId);

      const equipoRetirado = equiposInscritos.find((e) => e.id === equipoId);
      if (equipoRetirado) {
        setEquiposInscritos((prev) => prev.filter((e) => e.id !== equipoId));
        setEquiposDisponibles((prev) => [...prev, equipoRetirado]);
      }
    } catch (err: any) {
      console.error("Error al retirar:", err);
      alert(err.message || "Error al retirar el equipo");
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

  if (error && !torneo) {
    return (
      <AppLayout>
        <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
          <p className="text-red-500 font-bold text-lg mb-4">{error}</p>
          <button
            onClick={cargarDatos}
            className="px-6 py-3 bg-primary text-primary-foreground font-black rounded-xl text-sm hover:bg-primary-light transition-all shadow"
          >
            Reintentar Carga
          </button>
        </div>
      </AppLayout>
    );
  }

  if (!torneo) {
    return (
      <AppLayout>
        <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
          <p className="text-muted-foreground font-bold text-base mb-4">
            Torneo no encontrado
          </p>
          <Link
            href="/torneos"
            className="px-5 py-2.5 bg-primary text-primary-foreground font-bold rounded-xl text-xs hover:bg-primary-light transition-colors shadow"
          >
            ← Volver a Torneos
          </Link>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="min-h-screen bg-background p-4 md:p-8 pb-24">
        <div className="max-w-3xl mx-auto space-y-6">
          {/* Volver */}
          <Link
            href={`/torneos/${torneoId}`}
            className="inline-flex items-center text-sm font-bold text-muted-foreground hover:text-foreground transition-colors"
          >
            ← Volver a {torneo.nombre}
          </Link>

          {/* Encabezado */}
          <div>
            <h1 className="text-3xl font-black text-foreground tracking-tight">
              Inscribir Club Deportivo
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              Torneo: <strong className="text-foreground">{torneo.nombre}</strong> (
              <span className="capitalize">{torneo.categoria}</span>)
            </p>
          </div>

          {/* Banner Indicador de Inscripción */}
          <div className="bg-card rounded-2xl border border-secondary p-4 flex items-center justify-between text-xs font-bold shadow-sm">
            <span className="text-muted-foreground">
              Equipos Inscritos Actualmente:{" "}
              <strong className="text-foreground">{equiposInscritos.length}</strong>
            </span>
            <span className="text-muted-foreground">
              Clubes Disponibles:{" "}
              <strong className="text-primary">{equiposDisponibles.length}</strong>
            </span>
          </div>

          {/* FORMULARIO CON TARJETAS SELECCIONABLES DE CLUBES */}
          {equiposDisponibles.length > 0 ? (
            <form
              onSubmit={handleInscribir}
              className="bg-card rounded-3xl border border-secondary p-6 space-y-6 shadow-sm"
            >
              <div>
                <h2 className="text-lg font-black text-foreground tracking-tight mb-1">
                  Selecciona un Equipo Disponible
                </h2>
                <p className="text-xs text-muted-foreground mb-4">
                  Haz clic sobre la tarjeta del club que participará en este torneo.
                </p>

                {/* Tarjetas Visuales Seleccionables */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-96 overflow-y-auto p-1">
                  {equiposDisponibles.map((equipo) => {
                    const isSelected = selectedEquipoId === equipo.id;
                    const clubColor = equipo.color || "#991b1b";

                    return (
                      <button
                        key={equipo.id}
                        type="button"
                        onClick={() => setSelectedEquipoId(equipo.id)}
                        className={`p-4 rounded-2xl border text-left transition-all flex items-center justify-between gap-3 relative overflow-hidden ${
                          isSelected
                            ? "border-primary ring-2 ring-primary/40 bg-primary/5 shadow-md scale-[1.01]"
                            : "border-secondary bg-background hover:border-primary/40"
                        }`}
                        style={{
                          background: isSelected
                            ? `linear-gradient(135deg, ${clubColor}40 0%, rgba(24,24,27,0.95) 80%)`
                            : `linear-gradient(135deg, ${clubColor}20 0%, rgba(24,24,27,0.98) 80%)`,
                        }}
                      >
                        <div className="flex items-center gap-3 truncate">
                          {/* Escudo PNG Nativo (Sin silueta circular tras la imagen) */}
                          <div className="w-12 h-12 flex items-center justify-center overflow-hidden flex-shrink-0 p-1">
                            {equipo.logo_url ? (
                              <img
                                src={equipo.logo_url}
                                alt={equipo.nombre}
                                className="max-w-full max-h-full object-contain filter drop-shadow-md"
                              />
                            ) : (
                              <div
                                className="w-10 h-10 rounded-xl flex items-center justify-center font-black text-white text-base"
                                style={{ backgroundColor: clubColor }}
                              >
                                {equipo.nombre.charAt(0)}
                              </div>
                            )}
                          </div>

                          <div className="truncate">
                            <h4 className="font-bold text-foreground text-sm truncate">
                              {equipo.nombre}
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

                        {isSelected && (
                          <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold flex-shrink-0 shadow">
                            ✓
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {success && (
                <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-4 text-emerald-600 font-bold text-sm text-center">
                  ¡Equipo inscrito correctamente al torneo! Redirigiendo...
                </div>
              )}

              {error && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-4 text-red-600 font-medium text-sm">
                  {error}
                </div>
              )}

              {/* Botón Prominente de Alto Impacto */}
              <button
                type="submit"
                disabled={loadingInscripcion || !selectedEquipoId}
                className="w-full py-4 bg-primary hover:bg-primary-light text-primary-foreground rounded-2xl font-black text-base uppercase tracking-wider shadow-xl hover:shadow-2xl transition-all disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {loadingInscripcion ? "Inscribiendo Club..." : "Inscribir Equipo al Torneo"}
              </button>
            </form>
          ) : null}

          {/* LISTA DE EQUIPOS YA INSCRITOS */}
          <div className="bg-card rounded-3xl border border-secondary p-6 space-y-4 shadow-sm">
            <h2 className="text-lg font-black text-foreground tracking-tight">
              Equipos Inscritos ({equiposInscritos.length})
            </h2>

            {equiposInscritos.length === 0 ? (
              <p className="text-xs text-muted-foreground py-6 text-center">
                Aún no hay equipos inscritos en este torneo.
              </p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {equiposInscritos.map((equipo) => {
                  const clubColor = equipo.color || "#991b1b";

                  return (
                    <div
                      key={equipo.id}
                      className="p-3.5 bg-background rounded-2xl border border-secondary flex items-center justify-between gap-3 hover:border-primary/40 transition-colors relative overflow-hidden"
                      style={{
                        background: `linear-gradient(135deg, ${clubColor}25 0%, rgba(24,24,27,0.95) 80%)`,
                      }}
                    >
                      <div className="flex items-center gap-3 truncate">
                        {/* Escudo PNG Nativo (Sin recorte de círculo o cuadro) */}
                        <div className="w-10 h-10 flex items-center justify-center overflow-hidden flex-shrink-0 p-1">
                          {equipo.logo_url ? (
                            <img
                              src={equipo.logo_url}
                              alt={equipo.nombre}
                              className="max-w-full max-h-full object-contain filter drop-shadow-md"
                            />
                          ) : (
                            <div
                              className="w-8 h-8 rounded-lg flex items-center justify-center font-black text-white text-xs"
                              style={{ backgroundColor: clubColor }}
                            >
                              {equipo.nombre.charAt(0)}
                            </div>
                          )}
                        </div>
                        <span className="font-bold text-foreground text-sm truncate">
                          {equipo.nombre}
                        </span>
                      </div>

                      <button
                        onClick={() => handleRetirar(equipo.id)}
                        className="text-xs font-bold text-red-500 hover:text-red-700 hover:underline px-2 py-1 rounded-lg"
                      >
                        Retirar
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {equiposDisponibles.length === 0 && (
            <div className="bg-card border border-secondary rounded-3xl p-6 text-center space-y-3">
              <h4 className="font-bold text-foreground">
                No hay más clubes disponibles para inscribir
              </h4>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto">
                Crea un nuevo equipo deportivo en tu directorio para continuar agregando participantes a esta competencia.
              </p>
              <Link
                href="/equipos/nuevo"
                className="inline-block px-6 py-3 bg-primary text-primary-foreground font-black text-xs uppercase tracking-wider rounded-xl hover:bg-primary-light transition-all shadow-md"
              >
                + Crear Nuevo Equipo
              </Link>
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}