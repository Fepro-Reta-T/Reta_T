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
function SlotPill({ name, highlight }: { name?: string; highlight?: boolean }) {
  return (
    <div
      className={`h-10 rounded-lg border text-[10px] font-semibold flex items-center px-3 truncate w-full transition-colors ${
        highlight
          ? "bg-primary/15 border-primary/40 text-primary font-extrabold"
          : "bg-secondary/60 border-secondary text-muted-foreground"
      }`}
    >
      {name || "Por definir"}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Componente: Conector entre rondas del bracket (brazos CSS)
// ---------------------------------------------------------------------------
function BracketConnector({ numMatches, areaH }: { numMatches: number; areaH: number }) {
  const numBrackets = Math.ceil(numMatches / 2);
  return (
    <div className="flex flex-col flex-shrink-0" style={{ height: `${areaH}px`, width: "20px" }}>
      {Array.from({ length: numBrackets }).map((_, bi) => (
        <div key={bi} className="flex flex-col" style={{ height: `${areaH / numBrackets}px` }}>
          <div className="flex-1 border-t-2 border-r-2 border-secondary/70 rounded-tr" />
          <div className="flex-1 border-b-2 border-r-2 border-secondary/70 rounded-br" />
        </div>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Componente: Árbol de Bracket
// ---------------------------------------------------------------------------
const ROUND_LABELS: Record<number, string> = {
  0: "Final",
  1: "Semis",
  2: "Cuartos",
  3: "Octavos",
  4: "Dieciseisavos",
};

function BracketTree({
  numEquipos,
  terCerLugar = false,
  teamNames = [],
}: {
  numEquipos: number;
  terCerLugar?: boolean;
  teamNames?: string[];
}) {
  const bracketSize = Math.max(numEquipos, 2);
  const rounds: number[] = [];
  let n = Math.ceil(bracketSize / 2);
  while (n >= 1) {
    rounds.push(n);
    if (n === 1) break;
    n = Math.ceil(n / 2);
  }

  const ITEM_H = 96; // px por partido (dos slots + espacio)
  const areaH = rounds[0] * ITEM_H;

  return (
    <div className="overflow-x-auto rounded-xl bg-background/50 border border-secondary">
      <div className="p-4 min-w-max">
        {/* Etiquetas de rondas */}
        <div className="flex items-center gap-0 mb-3">
          {rounds.map((_, ri) => {
            const labelIdx = rounds.length - 1 - ri;
            return (
              <div key={ri} className="flex items-center">
                <div
                  className="text-[9px] uppercase font-extrabold text-muted-foreground text-center tracking-wider"
                  style={{ width: "144px" }}
                >
                  {ROUND_LABELS[labelIdx] ?? `Ronda ${ri + 1}`}
                </div>
                {ri < rounds.length - 1 && <div style={{ width: "20px" }} />}
              </div>
            );
          })}
          <div
            className="text-[9px] uppercase font-extrabold text-primary/70 text-center tracking-wider"
            style={{ width: "144px" }}
          >
            Campeón
          </div>
        </div>

        {/* Bracket body */}
        <div className="flex items-stretch" style={{ height: `${areaH}px` }}>
          {rounds.map((matchCount, ri) => (
            <div key={ri} className="flex items-stretch">
              {/* Columna de partidos */}
              <div
                className="flex flex-col justify-around flex-shrink-0"
                style={{ height: `${areaH}px`, width: "144px" }}
              >
                {Array.from({ length: matchCount }).map((_, mi) => {
                  const t1 = ri === 0 ? teamNames[mi * 2] : undefined;
                  const t2 = ri === 0 ? teamNames[mi * 2 + 1] : undefined;
                  return (
                    <div key={mi} className="flex flex-col gap-0.5">
                      <SlotPill name={t1} />
                      <div className="h-px bg-secondary/30 mx-1" />
                      <SlotPill name={t2} />
                    </div>
                  );
                })}
              </div>

              {/* Conector al siguiente round */}
              {ri < rounds.length - 1 && (
                <BracketConnector numMatches={matchCount} areaH={areaH} />
              )}
            </div>
          ))}

          {/* Slot de Campeón */}
          <div
            className="flex items-center justify-center flex-shrink-0 pl-4"
            style={{ height: `${areaH}px`, width: "144px" }}
          >
            <div className="w-full h-14 rounded-xl bg-primary/15 border-2 border-primary/40 text-xs text-primary font-black flex items-center justify-center text-center uppercase tracking-wider px-2 shadow-inner">
              Campeón
            </div>
          </div>
        </div>

        {/* 3er Lugar */}
        {terCerLugar && (
          <div className="mt-4 pt-4 border-t border-secondary flex items-center gap-3 flex-wrap">
            <span className="text-[9px] uppercase font-extrabold text-amber-500 tracking-wider flex-shrink-0">
              3er Lugar
            </span>
            <div style={{ width: "144px" }}>
              <SlotPill />
            </div>
            <span className="text-[10px] text-muted-foreground font-extrabold">vs</span>
            <div style={{ width: "144px" }}>
              <SlotPill />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Componente: Preview de Grupos
// ---------------------------------------------------------------------------
const GROUP_LETTERS = ["A", "B", "C", "D", "E", "F", "G", "H"];

function GroupsPreview({
  numGrupos,
  equiposPorGrupo,
  clasificadosPorGrupo,
}: {
  numGrupos: number;
  equiposPorGrupo: number;
  clasificadosPorGrupo: number;
}) {
  return (
    <div
      className={`grid gap-2 ${
        numGrupos <= 2
          ? "grid-cols-2"
          : numGrupos <= 4
          ? "grid-cols-2 sm:grid-cols-4"
          : "grid-cols-2 sm:grid-cols-4"
      }`}
    >
      {Array.from({ length: numGrupos }).map((_, gi) => (
        <div key={gi} className="bg-background rounded-xl border border-secondary overflow-hidden">
          <div className="bg-secondary/40 px-2.5 py-1.5 text-[9px] font-extrabold uppercase tracking-widest text-muted-foreground">
            Grupo {GROUP_LETTERS[gi]}
          </div>
          {Array.from({ length: equiposPorGrupo }).map((_, ei) => (
            <div
              key={ei}
              className={`px-2.5 py-1.5 border-t border-secondary/30 text-[9px] flex items-center justify-between ${
                ei < clasificadosPorGrupo
                  ? "text-emerald-600 dark:text-emerald-400 font-semibold"
                  : "text-muted-foreground"
              }`}
            >
              <span className="truncate">Equipo {gi * equiposPorGrupo + ei + 1}</span>
              {ei < clasificadosPorGrupo && (
                <span className="text-emerald-500 text-[8px] font-black ml-1 flex-shrink-0">
                  Clasifica
                </span>
              )}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Componente: Preview Principal (cambia según tipo_formato)
// ---------------------------------------------------------------------------
function BracketPreview({
  numEquipos,
  tipoFormato,
  terCerLugar,
  clasificados,
  numGrupos,
  equiposPorGrupo,
  clasificadosPorGrupo,
  teamNames = [],
}: {
  numEquipos: number;
  tipoFormato: TorneoFormato["tipo_formato"] | "";
  terCerLugar: boolean;
  clasificados: 4 | 8;
  numGrupos: 2 | 4 | 8;
  equiposPorGrupo: 3 | 4 | 5;
  clasificadosPorGrupo: 1 | 2;
  teamNames?: string[];
}) {
  if (!tipoFormato) {
    return (
      <div className="rounded-2xl border border-secondary bg-secondary/10 flex items-center justify-center h-36 text-[11px] text-muted-foreground">
        Selecciona un formato para ver la previsualización
      </div>
    );
  }

  if (tipoFormato === "liga") {
    const rows = Math.max(numEquipos, 4);
    return (
      <div className="rounded-xl border border-secondary bg-background overflow-hidden text-[10px]">
        <div className="bg-secondary/40 px-3 py-1.5 grid grid-cols-5 gap-1 font-extrabold uppercase tracking-wider text-muted-foreground">
          <span className="col-span-2">Equipo</span>
          <span className="text-center">J</span>
          <span className="text-center">G-P</span>
          <span className="text-center font-black text-foreground">Pts</span>
        </div>
        {Array.from({ length: Math.min(rows, 10) }).map((_, i) => (
          <div
            key={i}
            className={`px-3 py-1.5 grid grid-cols-5 gap-1 border-t border-secondary/30 ${i < 2 ? "bg-primary/5" : ""}`}
          >
            <span className="col-span-2 truncate text-foreground font-semibold">
              {teamNames[i] || `Equipo ${i + 1}`}
            </span>
            <span className="text-center text-muted-foreground">0</span>
            <span className="text-center text-muted-foreground">0-0</span>
            <span className="text-center font-black text-foreground">0</span>
          </div>
        ))}
      </div>
    );
  }

  if (tipoFormato === "eliminacion") {
    return (
      <BracketTree numEquipos={numEquipos} terCerLugar={terCerLugar} teamNames={teamNames} />
    );
  }

  if (tipoFormato === "liga_playoffs") {
    return (
      <div className="space-y-4">
        {/* Mini tabla */}
        <div className="rounded-xl border border-secondary bg-background overflow-hidden text-[10px]">
          <div className="bg-secondary/40 px-3 py-1 text-[9px] font-extrabold uppercase tracking-wider text-muted-foreground flex items-center justify-between">
            <span>Fase Regular</span>
            <span className="text-primary">Top {clasificados} clasifican</span>
          </div>
          {Array.from({ length: Math.min(clasificados + 2, 8) }).map((_, i) => (
            <div
              key={i}
              className={`px-3 py-1.5 grid grid-cols-5 gap-1 border-t border-secondary/30 ${i < clasificados ? "bg-primary/5" : ""}`}
            >
              <span className="col-span-2 truncate text-foreground font-semibold">
                {i < clasificados ? <span className="text-primary mr-1">▶</span> : null}
                {teamNames[i] || `Equipo ${i + 1}`}
              </span>
              <span className="text-center text-muted-foreground">0</span>
              <span className="text-center text-muted-foreground">0-0</span>
              <span className="text-center font-black text-foreground">0</span>
            </div>
          ))}
        </div>
        {/* Bracket de liguilla */}
        <div>
          <p className="text-[9px] uppercase font-extrabold text-muted-foreground mb-2 tracking-wider">
            Liguilla — Top {clasificados}
          </p>
          <BracketTree numEquipos={clasificados} terCerLugar={terCerLugar} />
        </div>
      </div>
    );
  }

  if (tipoFormato === "grupos_eliminacion") {
    const totalClasificados = numGrupos * clasificadosPorGrupo;
    return (
      <div className="space-y-4">
        {/* Grupos */}
        <div>
          <p className="text-[9px] uppercase font-extrabold text-muted-foreground mb-2 tracking-wider">
            Fase de Grupos — {numGrupos} grupos de {equiposPorGrupo} equipos
          </p>
          <GroupsPreview
            numGrupos={numGrupos}
            equiposPorGrupo={equiposPorGrupo}
            clasificadosPorGrupo={clasificadosPorGrupo}
          />
        </div>
        {/* Bracket */}
        <div>
          <p className="text-[9px] uppercase font-extrabold text-muted-foreground mb-2 tracking-wider">
            Fase de Eliminación — {totalClasificados} clasificados
          </p>
          <BracketTree numEquipos={totalClasificados} terCerLugar={terCerLugar} />
        </div>
      </div>
    );
  }

  return null;
}

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
  const [formato, setFormato] = useState<TorneoFormato>(DEFAULT_FORMATO);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const draft = sessionStorage.getItem("torneo_wizard_draft");
    if (!draft) { router.replace("/torneos/nuevo"); return; }
    const parsed = JSON.parse(draft);
    if (!parsed.paso1) { router.replace("/torneos/nuevo"); return; }
    setPaso1(parsed.paso1);
    if (parsed.paso2) setFormato((prev) => ({ ...prev, ...parsed.paso2 }));
  }, [router]);

  function set<K extends keyof TorneoFormato>(key: K, value: TorneoFormato[K]) {
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
                      <div className="font-bold text-foreground text-sm">Equipos Estimados</div>
                      <p className="text-[10px] text-muted-foreground">Para previsualizar el bracket.</p>
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

              {/* Reglas */}
              <div>
                <label className="block font-bold text-foreground text-sm mb-1.5">
                  Reglas y Detalles <span className="text-muted-foreground font-normal text-xs">(opcional)</span>
                </label>
                <textarea
                  rows={3}
                  value={formato.reglas}
                  onChange={(e) => set("reglas", e.target.value)}
                  className="w-full px-4 py-3 border border-secondary rounded-xl bg-background text-foreground focus:ring-2 focus:ring-primary focus:border-primary text-sm transition-all placeholder:text-muted-foreground resize-none"
                  placeholder="Ej: Premiación al 1er y 2do lugar. Costo por partido: $200 MXN."
                />
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
