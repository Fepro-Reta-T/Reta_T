"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { torneosApi } from "@/lib/api";
import type { Torneo } from "@reta-t/types";
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
      <div className="p-4 md:p-8 pb-28 max-w-5xl mx-auto relative min-h-screen font-sans space-y-6">
        
        {/* Encabezado Principal */}
        <div className="bg-card rounded-3xl p-6 border border-secondary shadow-sm">
          <h1 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">
            Torneos y Ligas
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            Explora las competencias activas en tu comunidad o inscribe a tu equipo.
          </p>
        </div>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-4 text-red-600 text-sm">
            {error}
          </div>
        )}

        {torneos.length === 0 ? (
          <div className="text-center py-16 bg-card rounded-3xl border border-secondary p-8 space-y-3">
            <h3 className="text-lg font-bold text-foreground">
              No hay torneos registrados actualmente
            </h3>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              Aún no existen competencias publicadas en esta zona.
            </p>
            {!isInvitado && (
              <Link
                href="/torneos/nuevo"
                className="inline-flex min-h-[44px] items-center justify-center px-5 py-2.5 bg-primary hover:bg-primary-light text-primary-foreground font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-md mt-2"
              >
                + Crear Primer Torneo
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {torneos.map((torneo) => {
              const portada = torneo.datos_adicionales?.imagen_portada || "/Futbol 7.jpg";
              const badgeClass = getCategoryBadgeClass(torneo.categoria);

              return (
                <div
                  key={torneo.id}
                  className="group relative rounded-3xl overflow-hidden border border-secondary bg-card shadow-lg flex flex-col justify-between min-h-[300px] hover:border-primary/50 transition-all"
                >
                  {/* Imagen de Fondo Completa */}
                  <img
                    src={portada}
                    alt={torneo.nombre}
                    className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  
                  {/* Degradado progresivo: Claro arriba en la imagen, volviéndose sólido en la zona del texto */}
                  <div className="absolute inset-0 bg-gradient-to-t from-card via-card/85 via-50% to-black/30" />

                  {/* Badges superiores */}
                  <div className="relative z-10 p-4 flex justify-between items-start">
                    <span className={`text-[10px] uppercase font-extrabold backdrop-blur-md px-3 py-1 rounded-full border capitalize shadow-sm ${badgeClass}`}>
                      {torneo.categoria}
                    </span>
                    {torneo.sport && (
                      <span className="text-[10px] font-extrabold text-foreground bg-card/80 backdrop-blur-md px-3 py-1 rounded-full border border-secondary uppercase tracking-wider shadow-sm">
                        {torneo.sport.nombre}
                      </span>
                    )}
                  </div>

                  {/* Zona de Información e Interacción sobre fondo degradado hacia sólido */}
                  <div className="relative z-10 p-5 space-y-3">
                    <div className="flex items-start justify-between gap-2">
                      <Link href={`/torneos/${torneo.id}`}>
                        <h3 className="text-lg font-black text-foreground hover:text-primary transition-colors leading-tight">
                          {torneo.nombre}
                        </h3>
                      </Link>
                      {isOrganizer && !isInvitado && (
                        <button
                          onClick={() => eliminarTorneo(torneo.id)}
                          className="text-xs text-red-500 hover:text-red-600 font-extrabold hover:underline"
                        >
                          Eliminar
                        </button>
                      )}
                    </div>

                    <p className="text-xs font-semibold text-muted-foreground">
                      {torneo.equipos ? `${torneo.equipos.length} equipos inscritos` : "Torneo disponible"}
                    </p>

                    <div className="flex items-center gap-2 pt-2 border-t border-secondary">
                      <Link
                        href={`/torneos/${torneo.id}`}
                        className="flex-1 min-h-[40px] px-3 py-2 bg-primary hover:bg-primary-light text-primary-foreground font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all shadow-sm flex items-center justify-center text-center cursor-pointer"
                      >
                        Ver Detalles
                      </Link>

                      {!isInvitado && (
                        <Link
                          href={`/torneos/${torneo.id}/inscribir`}
                          className="min-h-[40px] px-3 py-2 border border-secondary bg-card/90 hover:bg-secondary text-foreground font-extrabold text-xs rounded-xl transition-all shadow-sm flex items-center justify-center text-center cursor-pointer"
                        >
                          + Inscribir
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Píldora Flotante Fija (FAB) para Organizar Torneo */}
        {!isInvitado && (
          <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-40">
            <Link
              href="/torneos/nuevo"
              className="px-6 py-3.5 bg-primary hover:bg-primary-light text-primary-foreground font-black text-xs uppercase tracking-wider rounded-full shadow-2xl hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-2 border border-white/20 backdrop-blur-md cursor-pointer"
            >
              <span>+ Organizar Torneo</span>
            </Link>
          </div>
        )}

      </div>
    </AppLayout>
  );
}