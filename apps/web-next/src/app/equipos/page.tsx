"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { equiposApi } from "@/lib/api";
import type { Equipo } from "@reta-t/types";
import AppLayout from "@/components/AppLayout";

export default function EquiposPage() {
  const [equipos, setEquipos] = useState<Equipo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  async function eliminarEquipo(id: string) {
    if (!confirm("¿Estás seguro de eliminar este equipo?")) return;
    try {
      await equiposApi.eliminar(id);
      setEquipos(equipos.filter((e) => e.id !== id));
    } catch (err) {
      alert("Error al eliminar el equipo");
      console.error(err);
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
      <div className="p-4 md:p-8 pb-28 max-w-5xl mx-auto relative min-h-screen">
        {/* Encabezado */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-black text-foreground tracking-tight">
              Equipos Registrados
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Directorio oficial de clubes y plantillas deportivas.
            </p>
          </div>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-4 text-red-600 text-sm mb-4">
            {error}
          </div>
        )}

        {equipos.length === 0 ? (
          <div className="text-center py-16 bg-card rounded-3xl border border-secondary p-8 space-y-3">
            <h3 className="text-lg font-bold text-foreground">
              No hay equipos registrados
            </h3>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              Sé el primero en registrar un club deportivo en la plataforma.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {equipos.map((equipo) => {
              const tipoEquipo = equipo.datos_adicionales?.tipo_equipo || "Club";
              const clubColor = equipo.color || "#991b1b";

              return (
                <div
                  key={equipo.id}
                  className="bg-card rounded-3xl border border-secondary p-5 hover:shadow-xl transition-all flex flex-col justify-between group hover:border-primary/40 relative overflow-hidden"
                  style={{
                    background: `linear-gradient(135deg, ${clubColor}35 0%, rgba(24,24,27,0.95) 75%)`,
                  }}
                >
                  <div className="flex items-start justify-between gap-3 relative z-10">
                    <div className="flex items-center gap-4">
                      {/* Escudo o Emblema en PNG nativo sobre degradado de su color oficial (Sin recortado) */}
                      <div className="w-14 h-14 flex items-center justify-center overflow-hidden flex-shrink-0 shadow-md transition-transform group-hover:scale-105 p-1">
                        {equipo.logo_url ? (
                          <img
                            src={equipo.logo_url}
                            alt={equipo.nombre}
                            className="max-w-full max-h-full object-contain filter drop-shadow-md"
                          />
                        ) : (
                          <div
                            className="w-12 h-12 rounded-xl flex items-center justify-center font-black text-white text-xl"
                            style={{ backgroundColor: clubColor }}
                          >
                            {equipo.nombre.charAt(0)}
                          </div>
                        )}
                      </div>

                      <div>
                        <h3 className="text-base font-bold text-foreground leading-tight group-hover:text-primary transition-colors">
                          {equipo.nombre}
                        </h3>
                        <span className="text-[10px] uppercase font-extrabold text-muted-foreground tracking-wider block mt-1">
                          Rama: {tipoEquipo}
                        </span>
                      </div>
                    </div>

                    {!isInvitado && (
                      <button
                        onClick={() => eliminarEquipo(equipo.id)}
                        className="text-xs text-red-500 hover:text-red-700 hover:underline font-medium"
                      >
                        Eliminar
                      </button>
                    )}
                  </div>

                  <div className="mt-4 pt-3 border-t border-secondary flex items-center justify-between relative z-10">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-3 h-3 rounded-full border border-white/20"
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
                      Ver Plantilla →
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Botón Flotante (FAB) de Registrar Equipo — Abajo al Medio (Elevado) */}
        {!isInvitado && (
          <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-40">
            <Link
              href="/equipos/nuevo"
              className="px-6 py-3.5 bg-primary hover:bg-primary-light text-primary-foreground font-black text-sm uppercase tracking-wider rounded-full shadow-2xl hover:scale-105 transition-all flex items-center justify-center border border-white/20 backdrop-blur-md"
            >
              + Registrar Equipo
            </Link>
          </div>
        )}
      </div>
    </AppLayout>
  );
}