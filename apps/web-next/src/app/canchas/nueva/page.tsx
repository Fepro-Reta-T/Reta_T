"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button, Card, Input, Label } from "@reta-t/ui";
import { resolverMunicipio } from "@/lib/geocoding";
import Mapa from "@/components/Mapa";
import { canchasApi, apiClient } from "@/lib/api";

interface Municipio {
  id: string;
  nombre: string;
}

export default function NuevaCanchaPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [loadingMunicipios, setLoadingMunicipios] = useState(true);
  const [resolviendo, setResolviendo] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [creada, setCreada] = useState(false);
  const [municipios, setMunicipios] = useState<Municipio[]>([]);
  
  const [formData, setFormData] = useState({
    nombre: "",
    direccion: "",
    latitud: 0,
    longitud: 0,
    capacidad: 100,
    municipio_id: "", 
  });

  const [municipioDetectado, setMunicipioDetectado] = useState("");

  useEffect(() => {
    cargarMunicipios();
  }, []);

  async function cargarMunicipios() {
    try {
      setLoadingMunicipios(true);
      const data = await apiClient.get<Municipio[]>("/municipios/");
      setMunicipios(data);
      setError(null);
    } catch (err) {
      console.error("Error al cargar municipios:", err);
      setError("Error al cargar municipios del servidor.");
    } finally {
      setLoadingMunicipios(false);
    }
  }

  async function handleMapSelect(latitude: number, longitude: number) {
    setFormData(prev => ({ ...prev, latitud: latitude, longitud: longitude }));
    setResolviendo(true);
    
    try {
      const resultado = await resolverMunicipio(latitude, longitude);
      setMunicipioDetectado(resultado.municipio);
      
      const found = municipios.find(m => m.nombre === resultado.municipio);
      if (found) {
        setFormData(prev => ({ ...prev, municipio_id: found.id }));
      } else {
        if (municipios.length > 0) {
          setFormData(prev => ({ ...prev, municipio_id: municipios[0].id }));
        }
      }
      
      if (!formData.direccion) {
        setFormData(prev => ({ ...prev, direccion: resultado.direccionFormateada }));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al obtener la ubicación");
    } finally {
      setResolviendo(false);
    }
  }

  async function usarUbicacionActual() {
    setError(null);
    if (!navigator.geolocation) {
      setError("Este navegador no soporta geolocalización");
      return;
    }

    setResolviendo(true);
    navigator.geolocation.getCurrentPosition(
      async (posicion) => {
        await handleMapSelect(posicion.coords.latitude, posicion.coords.longitude);
      },
      () => {
        setError("No se pudo obtener tu ubicación");
        setResolviendo(false);
      }
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!formData.nombre) {
      setError("El nombre es obligatorio");
      setLoading(false);
      return;
    }

    if (!formData.latitud || !formData.longitud) {
      setError("Selecciona una ubicación en el mapa");
      setLoading(false);
      return;
    }

    if (!formData.municipio_id && municipios.length > 0) {
      setFormData(prev => ({ ...prev, municipio_id: municipios[0].id }));
    }

    try {
      const payload = {
        nombre: formData.nombre,
        direccion: formData.direccion,
        latitud: formData.latitud,
        longitud: formData.longitud,
        capacidad: formData.capacidad,
        municipio_id: formData.municipio_id || municipios[0]?.id || "",
      };

      await canchasApi.crear(payload);
      
      setCreada(true);
      setTimeout(() => router.push("/canchas"), 2000);
    } catch (err) {
      console.error("Error al crear cancha:", err);
      setError(err instanceof Error ? err.message : "Error al crear la cancha");
    } finally {
      setLoading(false);
    }
  }

  if (loadingMunicipios) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  if (creada) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="p-8 text-center max-w-md">
          <div className="text-6xl mb-4"></div>
          <h2 className="text-2xl font-bold text-foreground">¡Cancha creada!</h2>
          <p className="text-muted-foreground mt-2">{formData.nombre} ha sido registrada.</p>
          <Button onClick={() => router.push("/canchas")} className="mt-4">
            Ver todas las canchas
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-md mx-auto">
        <Link href="/canchas" className="text-muted-foreground hover:text-foreground mb-4 inline-block">
          ← Volver
        </Link>

        <h1 className="text-3xl font-bold text-foreground mb-6">🏟️ Nueva Cancha</h1>

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
              placeholder="Ej: Cancha Central"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Dirección
            </label>
            <input
              type="text"
              value={formData.direccion}
              onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
              className="w-full px-4 py-2 border border-secondary rounded-lg bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-primary"
              placeholder="Calle, número, colonia"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Capacidad
            </label>
            <input
              type="number"
              value={formData.capacidad}
              onChange={(e) => setFormData({ ...formData, capacidad: parseInt(e.target.value) || 0 })}
              className="w-full px-4 py-2 border border-secondary rounded-lg bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-primary"
              min={1}
              placeholder="100"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Ubicación en el mapa *
            </label>
            <Mapa 
              onLocationSelect={handleMapSelect} 
              lat={formData.latitud || null} 
              lng={formData.longitud || null} 
            />
            {formData.latitud && formData.longitud && (
              <p className="text-xs text-muted-foreground mt-1">
                {formData.latitud.toFixed(6)}, {formData.longitud.toFixed(6)}
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={usarUbicacionActual}
            disabled={resolviendo}
            className="w-full py-2 px-4 border border-secondary rounded-lg text-sm font-medium text-foreground hover:bg-secondary transition-colors disabled:opacity-50"
          >
            {resolviendo ? "Detectando ubicación..." : "Usar mi ubicación actual"}
          </button>

          {municipioDetectado && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-sm text-green-700">
              Municipio detectado: <strong>{municipioDetectado}</strong>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-600">
               {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || resolviendo || !formData.latitud || !formData.nombre}
            className="w-full py-3 bg-primary hover:bg-primary-light text-primary-foreground rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Creando..." : "Crear Cancha"}
          </button>
        </form>
      </div>
    </div>
  );
}