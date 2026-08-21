import { BracketPreview } from '@/components/BracketPreview';
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import AppLayout from "@/components/AppLayout";
import WizardProgressBar from "../_components/WizardProgressBar";
import type { TorneoFormato } from "@reta-t/types";

// ---------------------------------------------------------------------------
// Formato Options (4 formatos)
// ---------------------------------------------------------------------------
const FORMATO_OPTIONS = [
  {
    id: "liga" as const,
    titulo: "Liga Regular",
    subtitulo: "Todos contra todos",
    descripcion: "Todos los equipos se enfrentan entre sí. Gana quien acumula más puntos en la tabla.",
    colorActive: "border-blue-500 ring-2 ring-blue-500/30 bg-blue-500/5",
    colorBadge: "bg-blue-500/10 text-blue-600 border-blue-300 dark:text-blue-400 dark:border-blue-500/40",
  },
  {
    id: "eliminacion" as const,
    titulo: "Eliminación Directa",
    subtitulo: "Bracket / Copa",
    descripcion: "El perdedor queda eliminado en cada ronda. Los ganadores avanzan hasta la Gran Final.",
    colorActive: "border-red-500 ring-2 ring-red-500/30 bg-red-500/5",
    colorBadge: "bg-red-500/10 text-red-600 border-red-300 dark:text-red-400 dark:border-red-500/40",
  },
  {
    id: "liga_playoffs" as const,
    titulo: "Liga + Playoffs",
    subtitulo: "Fase Regular + Liguilla",
    descripcion: "Fase regular de liga. Los mejores de la tabla avanzan a liguilla de eliminación directa.",
    colorActive: "border-emerald-500 ring-2 ring-emerald-500/30 bg-emerald-500/5",
    colorBadge: "bg-emerald-500/10 text-emerald-600 border-emerald-300 dark:text-emerald-400 dark:border-emerald-500/40",
  },
  {
    id: "grupos_eliminacion" as const,
    titulo: "Grupos + Eliminación",
    subtitulo: "Estilo Copa del Mundo",
    descripcion: "Los equipos se dividen en grupos. Los mejores de cada grupo avanzan a bracket de eliminación directa.",
    colorActive: "border-purple-500 ring-2 ring-purple-500/30 bg-purple-500/5",
    colorBadge: "bg-purple-500/10 text-purple-600 border-purple-300 dark:text-purple-400 dark:border-purple-500/40",
  },
];

// ---------------------------------------------------------------------------
// Componente: Slot de Equipo (grande)
// ---------------------------------------------------------------------------
// Página Principal: Fase 2 — Formato
// ---------------------------------------------------------------------------
const DEFAULT_FORMATO: TorneoFormato = {
  tipo_formato: "liga",
  modalidad_liga: "ida_vuelta",
  modalidad_ko: "partido_unico",
  tercer_lugar: false,
  clasificados_playoffs: 4,
  num_grupos: 4,
  equipos_por_grupo: 4,
  clasificados_por_grupo: 2,
  num_equipos: 8,
  reglas: "",
};

export default function FormatoTorneoPage() {
  const router = useRouter();
  const [paso1, setPaso1] = useState<Record<string, string> | null>(null);
  const [formato, setFormato] = useState<TorneoFormato & { descripcion?: string }>({ ...DEFAULT_FORMATO, descripcion: "" });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const draft = sessionStorage.getItem("torneo_wizard_draft");
    if (!draft) { router.replace("/torneos/nuevo"); return; }
    const parsed = JSON.parse(draft);
    if (!parsed.paso1) { router.replace("/torneos/nuevo"); return; }
    setPaso1(parsed.paso1);
    if (parsed.paso2) setFormato((prev) => ({ ...prev, ...parsed.paso2 }));
  }, [router]);

  function set<K extends keyof (TorneoFormato & { descripcion?: string })>(key: K, value: (TorneoFormato & { descripcion?: string })[K]) {
    setFormato((prev) => ({ ...prev, [key]: value }));
  }

  function handleSiguiente() {
    if (!formato.tipo_formato) {
      setError("Selecciona el tipo de formato del torneo.");
      return;
    }
    const draft = JSON.parse(sessionStorage.getItem("torneo_wizard_draft") || "{}");
    sessionStorage.setItem("torneo_wizard_draft", JSON.stringify({ ...draft, paso2: formato }));
    router.push("/torneos/nuevo/equipos");
  }

  if (!paso1) return null;

  const esEliminacion = formato.tipo_formato === "eliminacion" || formato.tipo_formato === "liga_playoffs";
  const esLiga = formato.tipo_formato === "liga" || formato.tipo_formato === "liga_playoffs";
  const esGrupos = formato.tipo_formato === "grupos_eliminacion";
  const totalClasificados = (formato.num_grupos ?? 4) * (formato.clasificados_por_grupo ?? 2);

  return (
    <AppLayout>
      <div className="min-h-screen bg-background pb-24 overflow-y-auto">
        <div className="max-w-3xl mx-auto px-4 py-8">

          {/* Botón Regresar */}
          <button
            type="button"
            onClick={() => router.push("/torneos/nuevo")}
            className="inline-flex items-center gap-1.5 min-h-[40px] px-4 py-2 rounded-xl bg-secondary hover:bg-secondary/80 text-foreground font-semibold text-sm transition-colors mb-6"
          >
            ← Regresar a Datos
          </button>

          {/* Encabezado */}
          <div className="mb-6">
            <h1 className="text-2xl sm:text-3xl font-black text-foreground tracking-tight">
              Estructura del Torneo
            </h1>
            <p className="text-muted-foreground text-sm mt-1">
              <span className="font-semibold text-foreground">{paso1.nombre}</span>
              {" — "}Elige cómo se disputarán los partidos.
            </p>
          </div>

          {/* Barra de Progreso */}
          <WizardProgressBar currentStep={2} />

          <div className="space-y-5">

            {/* ── Tipo de Formato ─────────────────────────────────────────── */}
            <div className="bg-card rounded-2xl border border-secondary p-5 space-y-3 shadow-sm">
              <h2 className="font-black text-foreground text-sm uppercase tracking-wider">
                Tipo de Formato
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {FORMATO_OPTIONS.map((opt) => {
                  const isSelected = formato.tipo_formato === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => set("tipo_formato", opt.id)}
                      className={`p-4 rounded-2xl border-2 text-left transition-all space-y-1.5 ${
                        isSelected ? opt.colorActive : "border-secondary bg-background hover:border-primary/40"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded border ${opt.colorBadge}`}>
                          {opt.titulo}
                        </span>
                        {isSelected && (
                          <svg width="14" height="12" viewBox="0 0 14 12" fill="none">
                            <path d="M1 6L5.5 10.5L13 1" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-primary" />
                          </svg>
                        )}
                      </div>
                      <p className="text-[10px] text-muted-foreground leading-relaxed">
                        {opt.descripcion}
                      </p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* ── Modalidad de Liga ──────────────────────────────────────── */}
            {esLiga && (
              <div className="bg-card rounded-2xl border border-secondary p-5 space-y-3 shadow-sm">
                <h2 className="font-black text-foreground text-sm uppercase tracking-wider">
                  Modalidad de Liga
                </h2>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { id: "ida" as const, label: "Solo Ida", desc: "Cada par de equipos se enfrenta una sola vez." },
                    { id: "ida_vuelta" as const, label: "Ida y Vuelta", desc: "Cada par juega dos veces (local y visitante)." },
                  ].map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => set("modalidad_liga", opt.id)}
                      className={`p-4 rounded-2xl border-2 text-left transition-all ${
                        formato.modalidad_liga === opt.id
                          ? "border-primary ring-2 ring-primary/30 bg-primary/5"
                          : "border-secondary bg-background hover:border-primary/40"
                      }`}
                    >
                      <div className="font-black text-sm text-foreground mb-1">{opt.label}</div>
                      <p className="text-[10px] text-muted-foreground">{opt.desc}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* ── Modalidad de Eliminación ─────────────────────────────── */}
            {esEliminacion && (
              <div className="bg-card rounded-2xl border border-secondary p-5 space-y-3 shadow-sm">
                <h2 className="font-black text-foreground text-sm uppercase tracking-wider">
                  {formato.tipo_formato === "liga_playoffs" ? "Formato de Liguilla" : "Modalidad de Eliminación"}
                </h2>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { id: "partido_unico" as const, label: "Partido Único", desc: "Un solo partido decide quién avanza." },
                    { id: "ida_vuelta_ko" as const, label: "Ida y Vuelta", desc: "Dos partidos; avanza quien gane la eliminatoria." },
                  ].map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => set("modalidad_ko", opt.id)}
                      className={`p-4 rounded-2xl border-2 text-left transition-all ${
                        formato.modalidad_ko === opt.id
                          ? "border-primary ring-2 ring-primary/30 bg-primary/5"
                          : "border-secondary bg-background hover:border-primary/40"
                      }`}
                    >
                      <div className="font-black text-sm text-foreground mb-1">{opt.label}</div>
                      <p className="text-[10px] text-muted-foreground">{opt.desc}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* ── Clasificados a Playoffs ───────────────────────────────── */}
            {formato.tipo_formato === "liga_playoffs" && (
              <div className="bg-card rounded-2xl border border-secondary p-5 space-y-3 shadow-sm">
                <h2 className="font-black text-foreground text-sm uppercase tracking-wider">
                  Clasificados a Liguilla
                </h2>
                <div className="grid grid-cols-2 gap-3">
                  {([4, 8] as const).map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => set("clasificados_playoffs", n)}
                      className={`p-4 rounded-2xl border-2 text-left transition-all ${
                        formato.clasificados_playoffs === n
                          ? "border-primary ring-2 ring-primary/30 bg-primary/5"
                          : "border-secondary bg-background hover:border-primary/40"
                      }`}
                    >
                      <div className="font-black text-2xl text-foreground">Top {n}</div>
                      <p className="text-[10px] text-muted-foreground mt-1">
                        {n === 4 ? "Semifinales directas" : "Desde Cuartos de Final"}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* ── Configuración de Grupos ───────────────────────────────── */}
            {esGrupos && (
              <div className="bg-card rounded-2xl border border-secondary p-5 space-y-5 shadow-sm">
                <h2 className="font-black text-foreground text-sm uppercase tracking-wider">
                  Configuración de Grupos
                </h2>

                {/* Número de grupos */}
                <div>
                  <p className="text-xs font-semibold text-foreground mb-2">Número de Grupos</p>
                  <div className="grid grid-cols-3 gap-2">
                    {([2, 4, 8] as const).map((n) => (
                      <button
                        key={n}
                        type="button"
                        onClick={() => set("num_grupos", n)}
                        className={`p-3 rounded-xl border-2 text-center transition-all ${
                          formato.num_grupos === n
                            ? "border-primary ring-2 ring-primary/30 bg-primary/5"
                            : "border-secondary bg-background hover:border-primary/40"
                        }`}
                      >
                        <div className="font-black text-xl text-foreground">{n}</div>
                        <p className="text-[9px] text-muted-foreground">grupos</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Equipos por grupo */}
                <div>
                  <p className="text-xs font-semibold text-foreground mb-2">Equipos por Grupo</p>
                  <div className="grid grid-cols-3 gap-2">
                    {([3, 4, 5] as const).map((n) => (
                      <button
                        key={n}
                        type="button"
                        onClick={() => set("equipos_por_grupo", n)}
                        className={`p-3 rounded-xl border-2 text-center transition-all ${
                          formato.equipos_por_grupo === n
                            ? "border-primary ring-2 ring-primary/30 bg-primary/5"
                            : "border-secondary bg-background hover:border-primary/40"
                        }`}
                      >
                        <div className="font-black text-xl text-foreground">{n}</div>
                        <p className="text-[9px] text-muted-foreground">equipos</p>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Clasificados por grupo */}
                <div>
                  <p className="text-xs font-semibold text-foreground mb-2">Clasificados por Grupo</p>
                  <div className="grid grid-cols-2 gap-2">
                    {([1, 2] as const).map((n) => (
                      <button
                        key={n}
                        type="button"
                        onClick={() => set("clasificados_por_grupo", n)}
                        className={`p-3 rounded-xl border-2 text-left transition-all ${
                          formato.clasificados_por_grupo === n
                            ? "border-primary ring-2 ring-primary/30 bg-primary/5"
                            : "border-secondary bg-background hover:border-primary/40"
                        }`}
                      >
                        <div className="font-black text-foreground text-sm">
                          {n === 1 ? "Solo el 1er lugar" : "1ro y 2do lugar"}
                        </div>
                        <p className="text-[9px] text-muted-foreground mt-0.5">
                          {totalClasificados} equipos clasifican en total
                        </p>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ── Extras Opcionales ─────────────────────────────────────── */}
            <div className="bg-card rounded-2xl border border-secondary p-5 space-y-4 shadow-sm">
              <h2 className="font-black text-foreground text-sm uppercase tracking-wider">
                Opciones Adicionales
              </h2>

              {/* Tercer Lugar */}
              <label className="flex items-center justify-between gap-4 cursor-pointer">
                <div>
                  <div className="font-bold text-foreground text-sm">Partido por 3er Lugar</div>
                  <p className="text-[10px] text-muted-foreground">Los perdedores de semifinal disputan la medalla de bronce.</p>
                </div>
                <button
                  type="button"
                  role="switch"
                  aria-checked={formato.tercer_lugar}
                  onClick={() => set("tercer_lugar", !formato.tercer_lugar)}
                  className={`relative inline-flex h-6 w-11 flex-shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 ${
                    formato.tercer_lugar ? "bg-primary" : "bg-secondary"
                  }`}
                >
                  <span
                    className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform duration-200 ${
                      formato.tercer_lugar ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
              </label>

              {/* Número de equipos (solo para no-grupos) */}
              {!esGrupos && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <div className="font-bold text-foreground text-sm">Límite Máximo de Equipos</div>
                      <p className="text-[10px] text-muted-foreground">Cupo máximo de inscripciones permitidas.</p>
                    </div>
                    <span className="font-black text-primary text-lg">{formato.num_equipos}</span>
                  </div>
                  <input
                    type="range"
                    min={4}
                    max={32}
                    step={4}
                    value={formato.num_equipos}
                    onChange={(e) => set("num_equipos", Number(e.target.value))}
                    className="w-full accent-primary h-1.5 rounded-full"
                  />
                  <div className="flex justify-between text-[9px] text-muted-foreground mt-1">
                    <span>4</span><span>8</span><span>16</span><span>24</span><span>32</span>
                  </div>
                </div>
              )}

              {/* Descripción */}
              <div className="pt-6 border-t border-secondary space-y-6">
                <div>
                  <label className="block font-bold text-foreground text-sm mb-1.5">
                    Descripción del Torneo <span className="text-muted-foreground font-normal text-xs">(opcional)</span>
                  </label>
                  <textarea
                    rows={3}
                    value={formato.descripcion || ""}
                    onChange={(e) => set("descripcion", e.target.value)}
                    className="w-full px-4 py-3 border border-secondary rounded-xl bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-primary text-sm transition-all placeholder:text-muted-foreground resize-none"
                    placeholder="Ej: Torneo relámpago, premios al primer lugar, nivel amateur, etc."
                  />
                </div>

                {/* Reglas */}
                <div>
                  <label className="block font-bold text-foreground text-sm mb-1.5">
                    Reglas y Detalles Adicionales <span className="text-muted-foreground font-normal text-xs">(opcional)</span>
                  </label>
                  <textarea
                    rows={3}
                    value={formato.reglas || ""}
                    onChange={(e) => set("reglas", e.target.value)}
                    className="w-full px-4 py-3 border border-secondary rounded-xl bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-primary text-sm transition-all placeholder:text-muted-foreground resize-none"
                    placeholder="Ej: Tolerancia de 15 minutos, credencial obligatoria, etc."
                  />
                </div>
              </div>
            </div>

            {/* ── Previsualización del Bracket ──────────────────────────── */}
            <div className="bg-card rounded-2xl border border-secondary p-5 shadow-sm space-y-3">
              <h2 className="font-black text-foreground text-sm uppercase tracking-wider flex items-center gap-2">
                Previsualización
                <span className="text-[9px] font-semibold text-muted-foreground normal-case tracking-normal">
                  (se actualiza automáticamente)
                </span>
              </h2>
              <BracketPreview
                numEquipos={formato.num_equipos ?? 8}
                tipoFormato={formato.tipo_formato}
                terCerLugar={formato.tercer_lugar ?? false}
                clasificados={formato.clasificados_playoffs ?? 4}
                numGrupos={formato.num_grupos ?? 4}
                equiposPorGrupo={formato.equipos_por_grupo ?? 4}
                clasificadosPorGrupo={formato.clasificados_por_grupo ?? 2}
              />
            </div>

            {/* ── Error + CTA ───────────────────────────────────────────── */}
            {error && (
              <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-4 text-sm text-red-600 font-medium">
                {error}
              </div>
            )}

            <div className="pt-2">
              <button
                type="button"
                onClick={handleSiguiente}
                className="w-full min-h-[52px] py-4 bg-primary hover:bg-primary-light text-primary-foreground rounded-2xl font-black text-base shadow-xl hover:shadow-2xl transition-all uppercase tracking-wider flex items-center justify-center"
              >
                Siguiente: Invitar Equipos →
              </button>
              <p className="text-center text-[11px] text-muted-foreground mt-2.5">
                Paso 2 de 3 — Después podrás invitar equipos y publicar.
              </p>
            </div>

          </div>
        </div>
      </div>
    </AppLayout>
  );
}
