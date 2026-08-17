// apps/web-next/src/app/torneos/[id]/inscribir/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { torneosApi, equiposApi, inscripcionesApi } from "@/lib/api";
import type { Torneo, Equipo, User } from "@reta-t/types";

export default function InscribirEquipoPage() {
  const params = useParams();
  const router = useRouter();
  const torneoId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [loadingInscripcion, setLoadingInscripcion] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);

  const [torneo, setTorneo] = useState<Torneo | null>(null);
  const [equiposDisponibles, setEquiposDisponibles] = useState<Equipo[]>([]);
  const [equiposInscritos, setEquiposInscritos] = useState<Equipo[]>([]);
  const [selectedEquipoId, setSelectedEquipoId] = useState("");

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        setUser(JSON.parse(userStr));
      } catch {
        setUser(null);
      }
    }
    setLoadingUser(false);
  }, []);

  // Cargar datos
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

    } catch (err) {
      console.error("Error cargando datos:", err);
      setError("Error al cargar los datos");
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
      setError("Selecciona un equipo para inscribir");
      setLoadingInscripcion(false);
      return;
    }

    if (!user) {
      setError("Debes iniciar sesión para inscribir un equipo");
      setLoadingInscripcion(false);
      return;
    }

    try {
      await inscripcionesApi.inscribir(torneoId, selectedEquipoId);
      setSuccess(true);

      const equipoInscrito = equiposDisponibles.find((e) => e.id === selectedEquipoId);
      if (equipoInscrito) {
        setEquiposInscritos((prev) => [...prev, equipoInscrito]);
        setEquiposDisponibles((prev) => prev.filter((e) => e.id !== selectedEquipoId));
      }
      setSelectedEquipoId("");

      setTimeout(() => {
        router.push(`/torneos/${torneoId}`);
      }, 2000);

    } catch (err: any) {
      console.error("Error al inscribir:", err);
      setError(err.message || "Error al inscribir el equipo");
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

  if (loadingUser || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-2xl mx-auto">
          <Link href="/torneos" className="text-muted-foreground hover:text-foreground mb-4 inline-block">
            ← Volver a torneos
          </Link>
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <p className="text-red-600">{error}</p>
            <button
              onClick={cargarDatos}
              className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
            >
              Reintentar
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!torneo) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-2xl mx-auto">
          <Link href="/torneos" className="text-muted-foreground hover:text-foreground mb-4 inline-block">
            ← Volver a torneos
          </Link>
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
            <p className="text-yellow-600"> Torneo no encontrado</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-2xl mx-auto">
        <Link href={`/torneos/${torneoId}`} className="text-muted-foreground hover:text-foreground mb-4 inline-block">
          ← Volver al torneo
        </Link>

        <h1 className="text-3xl font-bold text-foreground mb-2">📋 Inscribir Equipo</h1>
        <p className="text-muted-foreground mb-6">
          Torneo: <strong>{torneo.nombre}</strong> ({torneo.categoria}) - {torneo.sport?.nombre}
        </p>

        <div className="bg-card rounded-xl border border-secondary p-4 mb-6">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">
              Equipos inscritos: <strong>{equiposInscritos.length}</strong>
            </span>
            <span className="text-sm text-muted-foreground">
              Disponibles: <strong>{equiposDisponibles.length}</strong>
            </span>
          </div>
        </div>

        {equiposDisponibles.length > 0 && (
          <form onSubmit={handleInscribir} className="bg-card rounded-xl border border-secondary p-6 mb-6 space-y-4">
            <h2 className="text-lg font-semibold text-foreground">Selecciona un equipo</h2>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Equipo *
              </label>
              <select
                value={selectedEquipoId}
                onChange={(e) => setSelectedEquipoId(e.target.value)}
                className="w-full px-4 py-2 border border-secondary rounded-lg bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-primary"
                required
              >
                <option value="">Selecciona un equipo</option>
                {equiposDisponibles.map((equipo) => (
                  <option key={equipo.id} value={equipo.id}>
                    {equipo.nombre}
                  </option>
                ))}
              </select>
            </div>

            {success && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-sm text-green-600">
                ¡Equipo inscrito correctamente! Redirigiendo...
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-600">
                 {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loadingInscripcion || !selectedEquipoId}
              className="w-full py-3 bg-primary hover:bg-primary-light text-primary-foreground rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loadingInscripcion ? "Inscribiendo..." : "Inscribir Equipo"}
            </button>
          </form>
        )}

        <div className="bg-card rounded-xl border border-secondary p-6">
          <h2 className="text-lg font-semibold text-foreground mb-4">
            Equipos Inscritos ({equiposInscritos.length})
          </h2>

          {equiposInscritos.length === 0 ? (
            <p className="text-muted-foreground text-sm">
              No hay equipos inscritos en este torneo.
            </p>
          ) : (
            <ul className="space-y-2">
              {equiposInscritos.map((equipo) => (
                <li
                  key={equipo.id}
                  className="flex items-center justify-between p-3 bg-background rounded-lg border border-secondary"
                >
                  <div className="flex items-center gap-3">
                    {equipo.logo_url ? (
                      <img
                        src={equipo.logo_url}
                        alt={equipo.nombre}
                        className="w-8 h-8 rounded-full object-cover"
                      />
                    ) : (
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold"
                        style={{ backgroundColor: equipo.color || '#6B7280' }}
                      >
                        {equipo.nombre.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <span className="text-foreground">{equipo.nombre}</span>
                  </div>
                  <button
                    onClick={() => handleRetirar(equipo.id)}
                    className="text-sm text-red-600 hover:text-red-800 transition-colors"
                  >
                    Retirar
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {equiposDisponibles.length === 0 && equiposInscritos.length > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center mt-6">
            <p className="text-blue-600 text-sm">
              Todos los equipos están inscritos en este torneo
            </p>
          </div>
        )}

        {equiposDisponibles.length === 0 && equiposInscritos.length === 0 && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center mt-6">
            <p className="text-yellow-600 text-sm">
               No hay equipos disponibles para inscribir
            </p>
            <Link
              href="/equipos/nuevo"
              className="inline-block mt-2 text-primary hover:underline text-sm"
            >
              Crear un equipo
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}