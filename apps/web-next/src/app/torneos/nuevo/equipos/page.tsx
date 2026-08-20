"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import AppLayout from "@/components/AppLayout";
import { torneosApi, equiposApi } from "@/lib/api";
import type { Equipo } from "@reta-t/types";
import WizardProgressBar from "../_components/WizardProgressBar";

function getCategoryBadgeClass(categoria: string) {
  const cat = (categoria || "").toLowerCase();
  if (cat.includes("varonil")) return "bg-blue-500/15 text-blue-400 border-blue-500/30";
  if (cat.includes("femenil")) return "bg-pink-500/15 text-pink-400 border-pink-500/30";
  if (cat.includes("mixto")) return "bg-emerald-500/15 text-emerald-400 border-emerald-500/30";
  return "bg-amber-500/15 text-amber-400 border-amber-500/30";
}

function FormatoResumen({ formato }: { formato: Record<string, any> }) {
  const LABELS: Record<string, string> = {
    liga: "Liga Regular",
    eliminacion: "Eliminación Directa",
    liga_playoffs: "Liga + Playoffs",
  };
  const LIGA_LABELS: Record<string, string> = {
    ida: "Solo Ida",
    ida_vuelta: "Ida y Vuelta",
  };
  const KO_LABELS: Record<string, string> = {
    partido_unico: "Partido Único",
    ida_vuelta_ko: "Ida y Vuelta",
  };

  return (
    <div className="flex flex-wrap gap-2 text-[10px]">
      {formato.tipo_formato && (
        <span className="px-2.5 py-1 rounded-full border bg-primary/10 text-primary border-primary/30 font-extrabold uppercase tracking-wider">
          {LABELS[formato.tipo_formato] ?? formato.tipo_formato}
        </span>
      )}
      {formato.modalidad_liga && (
        <span className="px-2.5 py-1 rounded-full border bg-secondary text-muted-foreground border-secondary font-semibold uppercase tracking-wider">
          {LIGA_LABELS[formato.modalidad_liga] ?? formato.modalidad_liga}
        </span>
      )}
      {formato.modalidad_ko && (
        <span className="px-2.5 py-1 rounded-full border bg-secondary text-muted-foreground border-secondary font-semibold uppercase tracking-wider">
          Liguilla: {KO_LABELS[formato.modalidad_ko] ?? formato.modalidad_ko}
        </span>
      )}
      {formato.tercer_lugar && (
        <span className="px-2.5 py-1 rounded-full border bg-amber-500/10 text-amber-500 border-amber-500/30 font-semibold uppercase tracking-wider">
          3er Lugar
        </span>
      )}
      {formato.clasificados_playoffs && (
        <span className="px-2.5 py-1 rounded-full border bg-secondary text-muted-foreground border-secondary font-semibold uppercase tracking-wider">
          Top {formato.clasificados_playoffs}
        </span>
      )}
    </div>
  );
}

export default function EquiposTorneoPage() {
  const router = useRouter();
  const [paso1, setPaso1] = useState<Record<string, string> | null>(null);
  const [paso2, setPaso2] = useState<Record<string, any> | null>(null);

  const [equipos, setEquipos] = useState<Equipo[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [loadingEquipos, setLoadingEquipos] = useState(true);
  const [publishing, setPublishing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const draft = sessionStorage.getItem("torneo_wizard_draft");
    if (!draft) { router.replace("/torneos/nuevo"); return; }
    const parsed = JSON.parse(draft);
    if (!parsed.paso1 || !parsed.paso2) { router.replace("/torneos/nuevo/formato"); return; }
    setPaso1(parsed.paso1);
    setPaso2(parsed.paso2);
    cargarEquipos();
  }, [router]);

  async function cargarEquipos() {
    try {
      const data = await equiposApi.listar();
      setEquipos(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingEquipos(false);
    }
  }

  function toggleEquipo(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  async function handlePublicar() {
    if (!paso1 || !paso2) return;

    const userStr = localStorage.getItem("user");
    const user = userStr ? JSON.parse(userStr) : null;
    if (!user) {
      setError("Debes iniciar sesión para publicar un torneo.");
      return;
    }

    setPublishing(true);
    setError(null);

    try {
      await torneosApi.crear({
        nombre: paso1.nombre,
        categoria: paso1.categoria,
        sport_id: paso1.sport_id,
        datos_adicionales: {
          imagen_portada: paso1.imagen_portada,
          formato: paso2,
          equipo_ids: [...selectedIds],
          reglas: paso2.reglas ?? "",
        },
      });
      sessionStorage.removeItem("torneo_wizard_draft");
      router.push("/torneos");
    } catch (err: any) {
      const msg = err?.message || err?.detail || "Error al crear el torneo";
      setError(typeof msg === "string" ? msg : JSON.stringify(msg));
    } finally {
      setPublishing(false);
    }
  }

  if (!paso1 || !paso2) return null;

  const categoriaClass = getCategoryBadgeClass(paso1.categoria);

  return (
    <AppLayout>
      <div className="min-h-screen bg-background pb-24 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-4 py-8 space-y-5">

          {/* Botón Regresar */}
          <button
            type="button"
            onClick={() => router.push("/torneos/nuevo/formato")}
            className="inline-flex items-center gap-1.5 min-h-[40px] px-4 py-2 rounded-xl bg-secondary hover:bg-secondary/80 text-foreground font-semibold text-sm transition-colors"
          >
            ← Regresar a Formato
          </button>

          {/* Encabezado */}
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">
              Invitar Equipos
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              Selecciona los equipos que participarán o publícalo vacío para que se inscriban después.
            </p>
          </div>

          {/* Barra de Progreso */}
          <WizardProgressBar currentStep={3} />

          {/* Resumen del Torneo */}
          <div
            className="relative rounded-3xl overflow-hidden border border-secondary shadow-md"
            style={{ minHeight: "120px" }}
          >
            <img
              src={paso1.imagen_portada || "/Futbol 7.jpg"}
              alt={paso1.nombre}
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-card via-card/85 via-50% to-black/30" />
            <div className="relative z-10 p-5 pt-14 space-y-2">
              <div className="flex flex-wrap gap-2 items-center">
                <span className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full border ${categoriaClass}`}>
                  {paso1.categoria}
                </span>
                <span className="text-[10px] font-semibold uppercase text-muted-foreground">
                  {paso1.sport_nombre}
                </span>
              </div>
              <h2 className="text-xl font-black text-foreground tracking-tight">{paso1.nombre}</h2>
              <FormatoResumen formato={paso2} />
            </div>
          </div>

          {/* Selección de Equipos */}
          <div className="bg-card rounded-2xl border border-secondary shadow-sm overflow-hidden">
            <div className="px-5 pt-5 pb-3 border-b border-secondary flex items-center justify-between">
              <div>
                <h2 className="font-black text-foreground text-sm uppercase tracking-wider">
                  Equipos Disponibles
                </h2>
                <p className="text-[10px] text-muted-foreground mt-0.5">
                  {selectedIds.size > 0
                    ? `${selectedIds.size} equipo${selectedIds.size !== 1 ? "s" : ""} seleccionado${selectedIds.size !== 1 ? "s" : ""}`
                    : "Opcional — puedes publicar sin equipos"}
                </p>
              </div>
              {selectedIds.size > 0 && (
                <button
                  type="button"
                  onClick={() => setSelectedIds(new Set())}
                  className="text-[10px] font-semibold text-muted-foreground hover:text-foreground"
                >
                  Limpiar
                </button>
              )}
            </div>

            {loadingEquipos ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-3 border-primary border-t-transparent" />
              </div>
            ) : equipos.length === 0 ? (
              <div className="text-center py-12 text-[11px] text-muted-foreground px-5">
                No hay equipos registrados aún. El torneo se publicará abierto a inscripciones.
              </div>
            ) : (
              <div className="divide-y divide-secondary">
                {equipos.map((equipo) => {
                  const isSelected = selectedIds.has(equipo.id);
                  const clubColor = equipo.color || "#6b7280";
                  const tipoEquipo = equipo.datos_adicionales?.tipo_equipo || "Club";
                  const badgeClass = getCategoryBadgeClass(tipoEquipo);
                  return (
                    <button
                      key={equipo.id}
                      type="button"
                      onClick={() => toggleEquipo(equipo.id)}
                      className={`w-full flex items-center gap-4 px-5 py-3.5 text-left transition-colors ${
                        isSelected ? "bg-primary/5" : "hover:bg-secondary/30"
                      }`}
                    >
                      {/* Checkbox visual */}
                      <div className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-colors ${
                        isSelected ? "bg-primary border-primary" : "border-secondary bg-background"
                      }`}>
                        {isSelected && (
                          <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                            <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        )}
                      </div>

                      {/* Logo */}
                      <div className="w-10 h-10 flex-shrink-0 flex items-center justify-center">
                        {equipo.logo_url ? (
                          <img src={equipo.logo_url} alt={equipo.nombre} className="w-10 h-10 object-contain" />
                        ) : (
                          <div
                            className="w-9 h-9 rounded-xl flex items-center justify-center font-black text-white text-sm shadow"
                            style={{ backgroundColor: clubColor }}
                          >
                            {equipo.nombre.charAt(0)}
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="font-bold text-foreground text-sm truncate">{equipo.nombre}</div>
                        <span className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full border inline-block mt-0.5 ${badgeClass}`}>
                          {tipoEquipo}
                        </span>
                      </div>

                      {isSelected && (
                        <div className="flex-shrink-0 text-primary">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5l-4-4 1.41-1.41L10 13.67l6.59-6.59L18 8.5l-8 8z" />
                          </svg>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-4 text-sm text-red-600 font-medium">
              {error}
            </div>
          )}

          {/* CTA: Publicar */}
          <div className="pt-2 space-y-3">
            <button
              type="button"
              onClick={handlePublicar}
              disabled={publishing}
              className="w-full min-h-[52px] py-4 bg-primary hover:bg-primary-light text-primary-foreground rounded-2xl font-black text-base shadow-xl hover:shadow-2xl transition-all disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wider flex items-center justify-center gap-2"
            >
              {publishing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Publicando Torneo...
                </>
              ) : (
                <>
                  {selectedIds.size > 0
                    ? `Publicar con ${selectedIds.size} equipo${selectedIds.size !== 1 ? "s" : ""}`
                    : "Publicar Torneo (sin equipos aún)"}
                </>
              )}
            </button>
            <p className="text-center text-[11px] text-muted-foreground">
              Los equipos no seleccionados podrán inscribirse después desde la vista del torneo.
            </p>
          </div>

        </div>
      </div>
    </AppLayout>
  );
}
