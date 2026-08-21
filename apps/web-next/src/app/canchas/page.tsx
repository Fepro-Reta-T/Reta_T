"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { canchasApi } from "@/lib/api";
import type { Cancha } from "@reta-t/types";

export default function CanchasPage() {
  const [canchas, setCanchas] = useState<Cancha[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isInvitado, setIsInvitado] = useState(false);
  const [isOrganizer, setIsOrganizer] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const invitado = localStorage.getItem('invitado') === 'true';
      setIsInvitado(invitado);
      const userStr = localStorage.getItem('user');
      if (userStr && !invitado) {
        setIsOrganizer(true);
      }
    }
    cargarCanchas();
  }, []);

  async function cargarCanchas() {
    try {
      setLoading(true);
      const data = await canchasApi.listar();
      setCanchas(data);
      setError(null);
    } catch (err) {
      setError("Error al cargar las canchas");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function eliminarCancha(id: string) {
    if (!confirm("¿Estás seguro de eliminar esta cancha?")) return;
    try {
      await canchasApi.eliminar(id);
      setCanchas(canchas.filter(c => c.id !== id));
    } catch (err) {
      alert("Error al eliminar la cancha");
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
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-6xl mx-auto">
        <Link href="/dashboard" className="text-muted-foreground hover:text-foreground mb-4 inline-block">
          ← Volver al Dashboard
        </Link>
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-foreground">Canchas</h1>
          {isOrganizer && !isInvitado && (
            <Link
              href="/canchas/nueva"
              className="bg-primary hover:bg-primary-light text-primary-foreground px-4 py-2 rounded-lg transition-colors"
            >
              + Nueva Cancha
            </Link>
          )}
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-600 mb-4">
            {error}
          </div>
        )}

        {canchas.length === 0 ? (
          <div className="text-center py-12 bg-card rounded-xl border border-secondary">
            <p className="text-muted-foreground text-lg">No hay canchas registradas</p>
            {isOrganizer && !isInvitado && (
              <Link
                href="/canchas/nueva"
                className="inline-block mt-4 text-primary hover:underline"
              >
                Crear la primera cancha →
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {canchas.map((cancha) => (
              <div
                key={cancha.id}
                className="bg-card rounded-xl border border-secondary p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">
                      {cancha.nombre}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      {cancha.direccion}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {cancha.municipio_id}
                    </p>
                    <p className="text-xs text-muted-foreground mt-2">
                      {cancha.latitud.toFixed(4)}, {cancha.longitud.toFixed(4)}
                    </p>
                  </div>
                  {isOrganizer && !isInvitado && (
                    <button
                      onClick={() => eliminarCancha(cancha.id)}
                      className="text-sm text-red-600 hover:underline"
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
    </div>
  );
}