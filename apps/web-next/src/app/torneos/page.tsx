"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { torneosApi } from "@/lib/api";
import type { Torneo } from "@reta-t/types";
import AppLayout from "@/components/AppLayout";

export default function TorneosPage() {
  const [torneos, setTorneos] = useState<Torneo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  async function cargarTorneos() {
    try {
      const data = await torneosApi.listar();
      setTorneos(data);
      setError(null);
    } catch (err) {
      setError("Error al cargar los torneos");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    cargarTorneos();
  }, []);

  async function eliminarTorneo(id: string) {
    if (!confirm("¿Estás seguro de eliminar este torneo?")) return;
    try {
      await torneosApi.eliminar(id);
      setTorneos(torneos.filter((t) => t.id !== id));
    } catch (err) {
      alert("Error al eliminar el torneo");
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
        
        {/* Encabezado Principal */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-black text-foreground tracking-tight">
              Torneos
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Explora las competencias y liguillas activas de la comunidad.
            </p>
          </div>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-4 text-red-600 text-sm mb-4">
            {error}
          </div>
        )}

        {torneos.length === 0 ? (
          <div className="text-center py-16 bg-card rounded-3xl border border-secondary p-8 space-y-3">
            <h3 className="text-lg font-bold text-foreground">
              No hay torneos registrados
            </h3>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              Aún no existen competencias publicadas en esta zona.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {torneos.map((torneo) => {
              const portada = torneo.datos_adicionales?.imagen_portada || "/Futbol 7.jpg";

              return (
                <div
                  key={torneo.id}
                  className="bg-card rounded-3xl border border-secondary overflow-hidden hover:shadow-xl transition-all flex flex-col justify-between group hover:border-primary/40"
                >
                  <div className="relative h-40 w-full overflow-hidden bg-secondary/30">
                    <img
                      src={portada}
                      alt={torneo.nombre}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />

                    <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full text-[10px] uppercase font-bold text-white tracking-wider border border-white/20 capitalize">
                      {torneo.categoria}
                    </div>
                  </div>

                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <Link href={`/torneos/${torneo.id}`}>
                          <h3 className="text-lg font-bold text-foreground hover:text-primary transition-colors leading-tight">
                            {torneo.nombre}
                          </h3>
                        </Link>
                        {isOrganizer && !isInvitado && (
                          <button
                            onClick={() => eliminarTorneo(torneo.id)}
                            className="text-xs text-red-500 hover:text-red-700 hover:underline font-medium"
                          >
                            Eliminar
                          </button>
                        )}
                      </div>

                      {torneo.sport && (
                        <span className="text-[10px] font-extrabold text-primary uppercase tracking-widest bg-primary/10 px-2.5 py-0.5 rounded-md border border-primary/20 inline-block">
                          {torneo.sport.nombre}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between border-t border-secondary pt-3 text-xs font-bold">
                      <Link
                        href={`/torneos/${torneo.id}`}
                        className="text-primary hover:underline"
                      >
                        Ver Detalles →
                      </Link>

                      {!isInvitado && (
                        <Link
                          href={`/torneos/${torneo.id}/inscribir`}
                          className="text-muted-foreground hover:text-foreground"
                        >
                          + Inscribir Equipo
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Botón Flotante (FAB) de Crear Torneo — Abajo al Medio (Elevado del Nav) */}
        {isOrganizer && !isInvitado && (
          <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-40">
            <Link
              href="/torneos/nuevo"
              className="px-6 py-3.5 bg-primary hover:bg-primary-light text-primary-foreground font-black text-sm uppercase tracking-wider rounded-full shadow-2xl hover:scale-105 transition-all flex items-center justify-center border border-white/20 backdrop-blur-md"
            >
              + Crear Torneo
            </Link>
          </div>
        )}
      </div>
    </AppLayout>
  );
}