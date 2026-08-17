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
  const [isInvitado, setIsInvitado] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setIsInvitado(localStorage.getItem('invitado') === 'true');
    }
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
      setEquipos(equipos.filter(e => e.id !== id));
    } catch (err) {
      alert("Error al eliminar the equipo");
      console.error(err);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  return (
    <AppLayout>
      <div className="p-4 md:p-8 max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-foreground">Equipos</h1>
          {!isInvitado && (
            <Link
              href="/equipos/nuevo"
              className="bg-primary hover:bg-primary-light text-primary-foreground px-4 py-2 rounded-lg transition-colors"
            >
              + Nuevo Equipo
            </Link>
          )}
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-600 mb-4">
             {error}
          </div>
        )}

        {equipos.length === 0 ? (
          <div className="text-center py-12 bg-card rounded-xl border border-secondary">
            <p className="text-muted-foreground text-lg">No hay equipos registrados</p>
            {!isInvitado && (
              <Link
                href="/equipos/nuevo"
                className="inline-block mt-4 text-primary hover:underline"
              >
                Crear el primer equipo →
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {equipos.map((equipo) => (
              <div
                key={equipo.id}
                className="bg-card rounded-xl border border-secondary p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      {equipo.logo_url && (
                        <img
                          src={equipo.logo_url}
                          alt={equipo.nombre}
                          className="w-10 h-10 object-contain"
                          onError={(e) => {
                            (e.target as HTMLImageElement).style.display = 'none';
                          }}
                        />
                      )}
                      <div>
                        <h3 className="text-lg font-semibold text-foreground">
                          {equipo.nombre}
                        </h3>
                        {equipo.color && (
                          <div className="flex items-center gap-2 mt-1">
                            <span
                              className="w-4 h-4 rounded-full border border-gray-300"
                              style={{ backgroundColor: equipo.color }}
                            />
                            <span className="text-sm text-muted-foreground">
                              {equipo.color}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  {!isInvitado && (
                    <button
                      onClick={() => eliminarEquipo(equipo.id)}
                      className="text-sm text-red-600 hover:underline ml-2"
                    >
                      Eliminar
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}