// apps/web-next/src/app/torneos/[id]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { torneosApi, inscripcionesApi } from "@/lib/api";
import type { Torneo, Equipo } from "@reta-t/types";

export default function DetalleTorneoPage() {
  const params = useParams();
  const router = useRouter();
  const torneoId = params.id as string;

  const [torneo, setTorneo] = useState<Torneo | null>(null);
  const [equipos, setEquipos] = useState<Equipo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (torneoId) {
      cargarDatos();
    }
  }, [torneoId]);

  async function cargarDatos() {
    try {
      setLoading(true);
      
      const torneoData = await torneosApi.obtener(torneoId);
      
      const equiposInscritos = await inscripcionesApi.listarEquiposInscritos(torneoId);
      
      setTorneo(torneoData);
      setEquipos(equiposInscritos);
      setError(null);
    } catch (err) {
      setError("Error al cargar los datos");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function eliminarTorneo() {
    if (!confirm("¿Eliminar este torneo?")) return;
    try {
      await torneosApi.eliminar(torneoId);
      router.push("/torneos");
    } catch (err) {
      alert("Error al eliminar");
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  if (error || !torneo) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600"> {error || "Torneo no encontrado"}</p>
          <Link href="/torneos" className="text-primary hover:underline inline-block mt-4">
            ← Volver
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-3xl mx-auto">
        <Link href="/torneos" className="text-muted-foreground hover:text-foreground inline-block mb-4">
          ← Volver a torneos
        </Link>

        <div className="bg-card rounded-xl border border-secondary p-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-bold text-foreground">{torneo.nombre}</h1>
              <p className="text-muted-foreground mt-1">Categoría: {torneo.categoria}</p>
              {torneo.sport && (
                <p className="text-muted-foreground">Deporte: {torneo.sport.nombre}</p>
              )}
              <p className="text-xs text-muted-foreground mt-2">
                ID: {torneo.id}
              </p>
            </div>
            <button
              onClick={eliminarTorneo}
              className="text-red-600 hover:text-red-800 text-sm"
            >
              Eliminar
            </button>
          </div>

          <div className="mt-4">
            <Link
              href={`/torneos/${torneo.id}/inscribir`}
              className="inline-block px-4 py-2 bg-green-600 text-white rounded-lg text-sm hover:bg-green-700 transition"
            >
              + Inscribir Equipo
            </Link>
          </div>

          <div className="mt-6 pt-6 border-t border-secondary">
            <h2 className="font-semibold text-foreground mb-3">
              Equipos inscritos ({equipos.length})
            </h2>
            {equipos.length === 0 ? (
              <p className="text-muted-foreground text-sm">Sin equipos inscritos</p>
            ) : (
              <ul className="space-y-2">
                {equipos.map((equipo) => (
                  <li key={equipo.id} className="text-foreground flex items-center gap-2">
                    <span>•</span>
                    {equipo.nombre}
                    {equipo.color && (
                      <span
                        className="inline-block w-3 h-3 rounded-full"
                        style={{ backgroundColor: equipo.color }}
                      />
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}