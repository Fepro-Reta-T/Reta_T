"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { equiposApi } from "@/lib/api";
import type { Equipo } from "@reta-t/types";
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

export default function EquiposPage() {
  const [equipos, setEquipos] = useState<Equipo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [equipoAEliminar, setEquipoAEliminar] = useState<Equipo | null>(null);
  const [deleting, setDeleting] = useState(false);

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
    cargarEquipos();
  }, []);

  async function cargarEquipos() {
    try {
      setLoading(true);
      const data = await equiposApi.listar();
      setEquipos(data);
      setError(null);
    } catch (err) {
      setError("Error al cargar los equipos");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleConfirmarEliminar() {
    if (!equipoAEliminar) return;
    try {
      setDeleting(true);
      await equiposApi.eliminar(equipoAEliminar.id);
      setEquipos((prev) => prev.filter((e) => e.id !== equipoAEliminar.id));
      setEquipoAEliminar(null);
    } catch (err) {
      alert("Error al eliminar el equipo");
      console.error(err);
    } finally {
      setDeleting(false);
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

  return (
    <AppLayout>
      <div className="p-4 md:p-8 pb-28 max-w-5xl mx-auto relative min-h-screen font-sans space-y-6">
        
        {/* Encabezado Principal */}
        <div className="bg-card rounded-3xl p-6 border border-secondary shadow-sm">
          <h1 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">
            Equipos Registrados
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Directorio oficial de clubes y plantillas deportivas.
          </p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-4 text-red-600 text-sm">
            {error}
          </div>
        )}

        {equipos.length === 0 ? (
          <div className="text-center py-16 bg-card rounded-3xl border border-secondary p-8 space-y-3">
            <h3 className="text-lg font-bold text-foreground">
              No hay equipos registrados actualmente
            </h3>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              Sé el primero en registrar un club deportivo en la plataforma.
            </p>
            {!isInvitado && (
              <Link
                href="/equipos/nuevo"
                className="inline-flex min-h-[44px] items-center justify-center px-5 py-2.5 bg-primary hover:bg-primary-light text-primary-foreground font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-md mt-2"
              >
                + Registrar Primer Club
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {equipos.map((equipo) => {
              const tipoEquipo = equipo.datos_adicionales?.tipo_equipo || "Club";
              const clubColor = equipo.color || "#991b1b";
              const badgeClass = getCategoryBadgeClass(tipoEquipo);

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
                <div
                  key={equipo.id}
                  className="bg-card rounded-3xl border border-secondary p-5 hover:shadow-xl transition-all flex flex-col justify-between group hover:border-primary/40 relative overflow-hidden"
                  style={{
                    background: `linear-gradient(135deg, ${clubColor}22 0%, var(--color-card) 75%)`,
                  }}
                >
                  <div className="flex items-start justify-between gap-3 relative z-10">
                    <div className="flex items-center gap-3.5">
                      <div className="w-16 h-16 flex items-center justify-center overflow-hidden flex-shrink-0 p-1">
                        {equipo.logo_url ? (
                          <img
                            src={equipo.logo_url}
                            alt={equipo.nombre}
                            className="max-w-full max-h-full object-contain filter drop-shadow-md"
                          />
                        ) : (
                          <div
                            className="w-14 h-14 rounded-2xl flex items-center justify-center font-black text-white text-xl shadow"
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
                        <span className={`text-[10px] uppercase font-extrabold px-2.5 py-0.5 rounded-full border inline-block mt-1.5 ${badgeClass}`}>
                          Rama: {tipoEquipo}
                        </span>
                      </div>
                    </div>

                    {puedeEliminar && (
                      <button
                        onClick={() => setEquipoAEliminar(equipo)}
                        className="text-xs text-red-500 hover:text-red-600 font-extrabold hover:underline transition-colors p-1"
                      >
                        Eliminar
                      </button>
                    )}
                  </div>

                  <div className="mt-4 pt-3 border-t border-secondary flex items-center justify-between gap-2 relative z-10">
                    <div className="flex items-center gap-2 truncate">
                      <span
                        className="w-2.5 h-2.5 rounded-full border border-white/20 flex-shrink-0"
                        style={{ backgroundColor: clubColor }}
                      />
                      <span className="text-[11px] font-semibold text-muted-foreground uppercase truncate">
                        {(equipo as any).sport?.nombre || equipo.datos_adicionales?.sport_nombre || "Club Deportivo"}
                      </span>
                    </div>

                    <Link
                      href={`/equipos/${equipo.id}`}
                      className="min-h-[38px] px-3.5 py-1.5 bg-primary hover:bg-primary-light text-primary-foreground font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center justify-center cursor-pointer flex-shrink-0"
                    >
                      Ver Plantilla
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Píldora Flotante Fija (FAB) para Registrar Equipo */}
        {!isInvitado && (
          <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-40">
            <Link
              href="/equipos/nuevo"
              className="px-6 py-3.5 bg-primary hover:bg-primary-light text-primary-foreground font-black text-xs uppercase tracking-wider rounded-full shadow-2xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2 border border-white/20 backdrop-blur-md cursor-pointer"
            >
              <span>+ Registrar Equipo</span>
            </Link>
          </div>
        )}

        {/* MODAL CONFIRMAR ELIMINAR EQUIPO (CERO EMOJIS) */}
        {equipoAEliminar && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
            <div className="bg-card rounded-3xl border border-red-500/30 max-w-md w-full p-6 shadow-2xl space-y-5 animate-in zoom-in-95 duration-200">
              <div className="flex justify-between items-center pb-3 border-b border-secondary">
                <div className="flex items-center gap-3">
                  <div className="px-2.5 py-1 rounded-lg bg-red-500/10 text-red-500 font-black text-xs border border-red-500/20 uppercase tracking-wider">
                    Peligro
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
                  onClick={() => setEquipoAEliminar(null)}
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
                    {equipoAEliminar.nombre}
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
                  onClick={() => setEquipoAEliminar(null)}
                  disabled={deleting}
                  className="flex-1 min-h-[44px] py-2.5 bg-secondary text-foreground rounded-xl font-bold text-xs uppercase tracking-wider hover:bg-secondary/80 transition-colors disabled:opacity-50 flex items-center justify-center"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleConfirmarEliminar}
                  disabled={deleting}
                  className="flex-1 min-h-[44px] py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl font-black text-xs uppercase tracking-wider transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-50"
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