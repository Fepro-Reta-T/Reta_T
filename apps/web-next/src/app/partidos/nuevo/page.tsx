"use client";

import { useEffect, useState, Suspense, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import AppLayout from "@/components/AppLayout";
import { torneosApi, canchasApi, partidosApi, inscripcionesApi } from "@/lib/api";
import type { Torneo, Equipo, Cancha, Partido } from "@reta-t/types";

function CustomTeamSelect({
  equipos,
  value,
  onChange,
  label,
  disabledTeamId
}: {
  equipos: Equipo[];
  value: string;
  onChange: (v: string) => void;
  label: string;
  disabledTeamId: string;
}) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedTeam = equipos.find(e => e.id === value);
  const options = equipos.filter(e => e.id !== disabledTeamId);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={containerRef}>
      <label className="block text-[10px] font-black uppercase text-muted-foreground mb-1.5 tracking-wider">
        {label}
      </label>
      <div
        onClick={() => setOpen(!open)}
        className="w-full bg-background border border-secondary rounded-xl px-4 py-3 text-sm font-semibold cursor-pointer flex items-center justify-between hover:border-primary/50 transition-colors"
      >
        {selectedTeam ? (
          <div className="flex items-center gap-3">
            {selectedTeam.logo_url ? (
              <img src={selectedTeam.logo_url} alt="" className="w-6 h-6 rounded-full object-cover bg-white shadow-sm" />
            ) : (
              <div className="w-6 h-6 rounded-full shadow-sm" style={{ backgroundColor: selectedTeam.color || "#ccc" }} />
            )}
            <span className="text-foreground">{selectedTeam.nombre}</span>
          </div>
        ) : (
          <span className="text-muted-foreground">Seleccionar equipo</span>
        )}
        <span className="text-muted-foreground text-xs opacity-50">▼</span>
      </div>

      {open && (
        <div className="absolute top-full left-0 right-0 mt-2 max-h-60 overflow-y-auto bg-card border border-secondary rounded-xl shadow-xl z-50 py-2">
          {options.length === 0 ? (
            <div className="px-4 py-3 text-sm text-muted-foreground text-center">No hay opciones disponibles</div>
          ) : (
            options.map(eq => (
              <div
                key={eq.id}
                onClick={() => { onChange(eq.id); setOpen(false); }}
                className="px-4 py-3 hover:bg-secondary/40 cursor-pointer flex items-center gap-3 transition-colors"
              >
                {eq.logo_url ? (
                  <img src={eq.logo_url} alt="" className="w-8 h-8 rounded-full object-cover bg-white border border-secondary/50 shadow-sm" />
                ) : (
                  <div className="w-8 h-8 rounded-full border border-secondary/50 shadow-sm" style={{ backgroundColor: eq.color || "#ccc" }} />
                )}
                <span className="font-bold text-sm text-foreground">{eq.nombre}</span>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}


function ProgramarPartidoContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const torneoId = searchParams.get("torneo_id");

  const [torneo, setTorneo] = useState<Torneo | null>(null);
  const [equipos, setEquipos] = useState<Equipo[]>([]);
  const [canchas, setCanchas] = useState<Cancha[]>([]);
  const [partidos, setPartidos] = useState<Partido[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [generandoFixture, setGenerandoFixture] = useState(false);
  const [creandoPartido, setCreandoPartido] = useState(false);

  // Formulario manual
  const [equipoLocalId, setEquipoLocalId] = useState<string>("");
  const [equipoVisitanteId, setEquipoVisitanteId] = useState<string>("");
  const [fechaStr, setFechaStr] = useState<string>("");
  const [horaStr, setHoraStr] = useState<string>("");
  const [canchaId, setCanchaId] = useState<string>("");
  const [esAmistoso, setEsAmistoso] = useState(false);

  useEffect(() => {
    if (!torneoId) {
      setError("No se proporcionó el ID del torneo.");
      setLoading(false);
      return;
    }
    cargarDatos();
  }, [torneoId]);

  async function cargarDatos() {
    try {
      setLoading(true);
      setError(null);
      const [tData, eData, cData, pData] = await Promise.all([
        torneosApi.obtener(torneoId!),
        inscripcionesApi.listarEquiposInscritos(torneoId!),
        canchasApi.listar(),
        partidosApi.listarPorTorneo(torneoId!)
      ]);
      setTorneo(tData);
      setEquipos(eData);
      setCanchas(cData);
      setPartidos(pData);
    } catch (err: any) {
      setError(err?.message || "Error al cargar datos del torneo.");
    } finally {
      setLoading(false);
    }
  }

  async function handleGenerarFixture() {
    if (!torneoId) return;
    if (confirm("Esto generará todos los partidos de forma automática. ¿Deseas continuar?")) {
      try {
        setGenerandoFixture(true);
        setError(null);
        await partidosApi.generarFixture(torneoId);
        router.push(`/torneos/${torneoId}`);
      } catch (err: any) {
        setError(err?.message || "Error al generar el fixture.");
        setGenerandoFixture(false);
      }
    }
  }

  async function handleCrearManual(e: React.FormEvent) {
    e.preventDefault();
    if (!torneoId || !equipoLocalId || !equipoVisitanteId) {
      setError("Debes seleccionar ambos equipos.");
      return;
    }
    if (equipoLocalId === equipoVisitanteId) {
      setError("El equipo local y visitante no pueden ser el mismo.");
      return;
    }

    try {
      setCreandoPartido(true);
      setError(null);
      
      const payload: any = {
        torneo_id: torneoId,
        equipo_local_id: equipoLocalId,
        equipo_visitante_id: equipoVisitanteId,
        datos_adicionales: {
          es_amistoso: esAmistoso
        }
      };
      
      if (fechaStr) {
        const h = horaStr || "00:00";
        payload.fecha = new Date(`${fechaStr}T${h}`).toISOString();
      }
      
      if (canchaId) payload.cancha_id = canchaId;

      await partidosApi.crear(payload);
      router.push(`/torneos/${torneoId}`);
    } catch (err: any) {
      setError(err?.message || "Error al crear el partido.");
      setCreandoPartido(false);
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <p className="mt-4 text-sm text-muted-foreground font-semibold">Cargando datos del torneo...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 max-w-lg mx-auto text-center">
        <div className="bg-destructive/10 text-destructive p-4 rounded-2xl mb-4 text-sm font-semibold border border-destructive/20">
          {error}
        </div>
        <button
          onClick={() => router.back()}
          className="px-6 py-2 bg-secondary rounded-xl text-xs font-bold uppercase tracking-wider"
        >
          Volver
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 pb-24 max-w-3xl mx-auto space-y-6">
      <Link
        href={`/torneos/${torneoId}`}
        className="inline-flex items-center gap-1.5 text-xs font-extrabold text-muted-foreground hover:text-foreground transition-colors"
      >
        ← Volver al Dashboard del Torneo
      </Link>

      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">
          Programar Partido
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          {torneo?.nombre}
        </p>
      </div>

      {/* BLOQUE: GENERACIÓN AUTOMÁTICA */}
      {partidos.length > 0 ? (
        <div className="bg-card border border-secondary rounded-3xl p-6 shadow-sm opacity-70">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xl">🔒</span>
            <h2 className="text-sm font-black text-muted-foreground uppercase tracking-wider">
              Asignación Automática Bloqueada
            </h2>
          </div>
          <p className="text-xs text-muted-foreground">
            Ya existen partidos registrados en este torneo. La asignación automática de fase regular solo está disponible antes de iniciar el torneo. Puedes seguir programando partidos manuales abajo.
          </p>
        </div>
      ) : (
        <div className="bg-card border border-secondary rounded-3xl p-6 shadow-sm">
          <h2 className="text-sm font-black text-primary uppercase tracking-wider mb-2">
            Asignación Automática (Fase Regular)
          </h2>
          <p className="text-xs text-muted-foreground mb-4">
            Genera el fixture completo usando un algoritmo de Round-Robin (todos contra todos). 
            Los equipos serán cruzados automáticamente. Posteriormente podrás asignarles horarios y canchas desde el calendario.
          </p>
          <button
            type="button"
            onClick={handleGenerarFixture}
            disabled={generandoFixture || equipos.length < 2}
            className="w-full sm:w-auto px-8 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm uppercase tracking-wider rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {generandoFixture ? "Generando Fixture..." : "⚡ Generar Fixture Automático"}
          </button>
          {equipos.length < 2 && (
            <p className="text-[10px] text-amber-500 mt-2 font-semibold">
              Necesitas al menos 2 equipos inscritos para generar un fixture.
            </p>
          )}
        </div>
      )}

      <div className="flex items-center gap-4 py-2">
        <div className="h-px bg-secondary flex-1" />
        <span className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">O</span>
        <div className="h-px bg-secondary flex-1" />
      </div>

      {/* BLOQUE: PARTIDO MANUAL */}
      <form onSubmit={handleCrearManual} className="bg-card border border-secondary rounded-3xl p-6 shadow-sm space-y-5">
        <div>
          <h2 className="text-sm font-black text-foreground uppercase tracking-wider">
            Crear Partido Individual
          </h2>
          <p className="text-[11px] text-muted-foreground mt-1">
            Agenda un enfrentamiento específico de forma manual.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <CustomTeamSelect 
            label="Equipo Local"
            equipos={equipos}
            value={equipoLocalId}
            onChange={setEquipoLocalId}
            disabledTeamId={equipoVisitanteId}
          />
          <CustomTeamSelect 
            label="Equipo Visitante"
            equipos={equipos}
            value={equipoVisitanteId}
            onChange={setEquipoVisitanteId}
            disabledTeamId={equipoLocalId}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-[10px] font-black uppercase text-muted-foreground mb-1.5 tracking-wider">
              Día del Encuentro (Opcional)
            </label>
            <input
              type="date"
              value={fechaStr}
              onChange={(e) => setFechaStr(e.target.value)}
              className="w-full bg-background border border-secondary rounded-xl px-4 py-3 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary [color-scheme:dark]"
            />
          </div>
          <div>
            <label className="block text-[10px] font-black uppercase text-muted-foreground mb-1.5 tracking-wider">
              Hora (Opcional)
            </label>
            <input
              type="time"
              value={horaStr}
              onChange={(e) => setHoraStr(e.target.value)}
              className="w-full bg-background border border-secondary rounded-xl px-4 py-3 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary [color-scheme:dark]"
            />
          </div>
        </div>

        <div>
          <label className="block text-[10px] font-black uppercase text-muted-foreground mb-1.5 tracking-wider">
            Cancha (Opcional)
          </label>
          <select
            value={canchaId}
            onChange={(e) => setCanchaId(e.target.value)}
            className="w-full bg-background border border-secondary rounded-xl px-4 py-3 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-primary appearance-none"
          >
            <option value="">Por definir</option>
            {canchas.map(c => (
              <option key={c.id} value={c.id}>
                {c.nombre}
              </option>
            ))}
          </select>
        </div>

        {/* TOGGLE AMISTOSO (DESTACADO) */}
        <div 
          onClick={() => setEsAmistoso(!esAmistoso)}
          className={`p-5 rounded-2xl border-2 transition-all cursor-pointer flex items-center justify-between gap-4 ${
            esAmistoso 
              ? "bg-blue-500/10 border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.15)]" 
              : "bg-secondary/20 border-secondary hover:border-secondary/80"
          }`}
        >
          <div>
            <label className={`block text-sm font-black uppercase tracking-wider cursor-pointer ${esAmistoso ? "text-blue-500" : "text-foreground"}`}>
              Partido Amistoso
            </label>
            <p className="text-[11px] font-semibold text-muted-foreground mt-1 leading-snug">
              Al marcarlo como amistoso, no sumará puntos en la tabla de posiciones ni afectará estadísticas.
            </p>
          </div>
          <div className="flex-shrink-0">
            <div className={`w-12 h-6 rounded-full p-1 transition-colors ${esAmistoso ? "bg-blue-500" : "bg-muted"}`}>
              <div className={`w-4 h-4 rounded-full bg-white transition-transform ${esAmistoso ? "translate-x-6" : "translate-x-0"}`} />
            </div>
          </div>
        </div>

        <div className="pt-2">
          <button
            type="submit"
            disabled={creandoPartido || !equipoLocalId || !equipoVisitanteId}
            className="w-full py-4 bg-primary hover:bg-primary-light text-primary-foreground font-black text-sm uppercase tracking-wider rounded-2xl shadow-md transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {creandoPartido ? "Programando..." : "Programar Partido Manual"}
          </button>
        </div>
      </form>
    </div>
  );
}

export default function ProgramarPartidoPage() {
  return (
    <AppLayout>
      <Suspense fallback={
        <div className="flex items-center justify-center min-h-screen">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      }>
        <ProgramarPartidoContent />
      </Suspense>
    </AppLayout>
  );
}
