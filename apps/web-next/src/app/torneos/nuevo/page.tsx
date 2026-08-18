"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { torneosApi, apiClient } from "@/lib/api";

interface Sport {
  id: string;
  nombre: string;
}

export default function NuevoTorneoPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [loadingSports, setLoadingSports] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sports, setSports] = useState<Sport[]>([]);
  const [formData, setFormData] = useState({
    nombre: "",
    categoria: "",
    sport_id: "",
  });

  async function cargarSports() {
    try {
      const response = await apiClient.get<Sport[]>('/sports');
      setSports(response);
      setError(null);
    } catch (err) {
      console.error("Error al cargar deportes:", err);
      setSports([
        { id: '1', nombre: 'Fútbol' },
        { id: '2', nombre: 'Basketball' },
        { id: '3', nombre: 'Voleibol' },
      ]);
    } finally {
      setLoadingSports(false);
    }
  }

  useEffect(() => {
    cargarSports();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const userStr = localStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : null;

    if (!user) {
      setError("Debes iniciar sesión para crear un torneo");
      setLoading(false);
      return;
    }

    try {
      await torneosApi.crear({
        nombre: formData.nombre,
        categoria: formData.categoria,
        sport_id: formData.sport_id,
      });
      router.push("/torneos");
    } catch (err) {
      setError("Error al crear el torneo");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  if (loadingSports) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-md mx-auto">
        <Link href="/torneos" className="text-muted-foreground hover:text-foreground mb-4 inline-block">
          ← Volver
        </Link>

        <h1 className="text-3xl font-bold text-foreground mb-6">🏆 Nuevo Torneo</h1>

        <form onSubmit={handleSubmit} className="bg-card rounded-xl border border-secondary p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Nombre *
            </label>
            <input
              type="text"
              value={formData.nombre}
              onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
              className="w-full px-4 py-2 border border-secondary rounded-lg bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-primary"
              required
              placeholder="Ej: Torneo Verano 2026"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Categoría *
            </label>
            <input
              type="text"
              value={formData.categoria}
              onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
              className="w-full px-4 py-2 border border-secondary rounded-lg bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-primary"
              required
              placeholder="Ej: Libre, Sub-17, Femenil"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Deporte *
            </label>
            <select
              value={formData.sport_id}
              onChange={(e) => setFormData({ ...formData, sport_id: e.target.value })}
              className="w-full px-4 py-2 border border-secondary rounded-lg bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-primary"
              required
            >
              <option value="">Selecciona un deporte</option>
              {sports.map((sport) => (
                <option key={sport.id} value={sport.id}>
                  {sport.nombre}
                </option>
              ))}
            </select>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-600">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-primary hover:bg-primary-light text-primary-foreground rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Creando..." : "Crear Torneo"}
          </button>
        </form>
      </div>
    </div>
  );
}