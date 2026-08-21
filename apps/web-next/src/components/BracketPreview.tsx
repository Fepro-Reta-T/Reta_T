import React from 'react';
import type { TorneoFormato } from '@reta-t/types';

// ---------------------------------------------------------------------------
export function SlotPill({ name, highlight }: { name?: string; highlight?: boolean }) {
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
export function BracketConnector({ numMatches, areaH }: { numMatches: number; areaH: number }) {
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

export function BracketTree({
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

export function GroupsPreview({
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
export function BracketPreview({
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
