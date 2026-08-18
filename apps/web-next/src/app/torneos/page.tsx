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
    if (typeof window !== 'undefined') {
      return localStorage.getItem('invitado') === 'true';
    }
    return false;
  });

  const [isOrganizer] = useState(() => {
    if (typeof window !== 'undefined') {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        try {
          const u = JSON.parse(userStr);
          return u.role === 'organizer' || u.role === 'admin';
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
      setTorneos(torneos.filter(t => t.id !== id));
    } catch (err) {
      alert("Error al eliminar el torneo");
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
          <h1 className="text-3xl font-bold text-foreground">Torneos</h1>
          {isOrganizer && !isInvitado && (
            <Link
              href="/torneos/nuevo"
              className="bg-primary hover:bg-primary-light text-primary-foreground px-4 py-2 rounded-lg transition-colors"
            >
              + Nuevo Torneo
            </Link>
          )}
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-600 mb-4">
            {error}
          </div>
        )}

        {torneos.length === 0 ? (
          <div className="text-center py-12 bg-card rounded-xl border border-secondary">
            <p className="text-muted-foreground text-lg">No hay torneos registrados</p>
            {isOrganizer && !isInvitado && (
              <Link
                href="/torneos/nuevo"
                className="inline-block mt-4 text-primary hover:underline"
              >
                Crear el primer torneo →
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {torneos.map((torneo) => (
              <div
                key={torneo.id}
                className="bg-card rounded-xl border border-secondary p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <Link href={`/torneos/${torneo.id}`}>
                      <h3 className="text-lg font-semibold text-foreground hover:text-primary transition-colors">
                        {torneo.nombre}
                      </h3>
                    </Link>
                    <p className="text-sm text-muted-foreground mt-1">
                      Categoría: {torneo.categoria}
                    </p>
                    {torneo.sport && (
                      <p className="text-sm text-muted-foreground">
                        Deporte: {torneo.sport.nombre}
                      </p>
                    )}
                  </div>
                  {isOrganizer && !isInvitado && (
                    <button
                      onClick={() => eliminarTorneo(torneo.id)}
                      className="text-sm text-red-600 hover:underline"
                    >
                      Eliminar
                    </button>
                  )}
                </div>
                <div className="flex items-center justify-between border-t border-secondary mt-4 pt-3 text-sm">
                  <Link href={`/torneos/${torneo.id}`} className="text-primary hover:underline">
                    Ver detalles
                  </Link>

                  {!isInvitado && (
                    <Link href={`/torneos/${torneo.id}/inscribir`} className="text-primary hover:underline">
                      Inscribir Equipo
                    </Link>
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