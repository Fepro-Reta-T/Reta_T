"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { equiposApi } from "@/lib/api";

export default function NuevoEquipoPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    nombre: "",
    color: "",
    logo_url: "",
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const userStr = localStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : null;

    if (!user?.id) {
      setError("Debes iniciar sesión para crear un equipo");
      setLoading(false);
      return;
    }

    try {
      await equiposApi.crear({
        nombre: formData.nombre,
        color: formData.color || undefined,
        logo_url: formData.logo_url || undefined,
        organizer_id: user.id,
      });
      router.push("/equipos");
    } catch (err) {
      setError("Error al crear el equipo");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-md mx-auto">
        <Link href="/equipos" className="text-muted-foreground hover:text-foreground mb-4 inline-block">
          ← Volver
        </Link>

        <h1 className="text-3xl font-bold text-foreground mb-6">👥 Nuevo Equipo</h1>

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
              placeholder="Ej: Real Madrid"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Color
            </label>
            <input
              type="text"
              value={formData.color}
              onChange={(e) => setFormData({ ...formData, color: e.target.value })}
              className="w-full px-4 py-2 border border-secondary rounded-lg bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-primary"
              placeholder="Ej: #FF0000 o Rojo"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              URL del Logo
            </label>
            <input
              type="url"
              value={formData.logo_url}
              onChange={(e) => setFormData({ ...formData, logo_url: e.target.value })}
              className="w-full px-4 py-2 border border-secondary rounded-lg bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-primary"
              placeholder="https://ejemplo.com/logo.png"
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-600">
              ❌ {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-primary hover:bg-primary-light text-primary-foreground rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Creando..." : "Crear Equipo"}
          </button>
        </form>
      </div>
    </div>
  );
}