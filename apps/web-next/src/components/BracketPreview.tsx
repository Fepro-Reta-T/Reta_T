import React from 'react';
import type { TorneoFormato } from '@reta-t/types';

// ---------------------------------------------------------------------------
export function SlotPill({ team, score, highlight }: { team?: any; score?: number | string; highlight?: boolean }) {
  const name = team?.equipo || team?.nombre || team?.name || (typeof team === 'string' ? team : undefined);
  return (
    <div
      className={`h-10 rounded-lg border text-[10px] font-semibold flex items-center px-2 gap-2 truncate w-full transition-colors justify-between ${
        highlight && !team?.color
          ? "bg-primary/15 border-primary/40 text-primary font-extrabold"
          : !highlight
          ? "bg-secondary/60 border-secondary text-muted-foreground"
          : "font-extrabold"
      }`}
      style={
        highlight && team?.color
          ? {
              backgroundColor: `${team.color}26`, // 15% opacity
              borderColor: `${team.color}66`, // 40% opacity
              color: team.color,
            }
          : undefined
      }
    >
      <div className="flex items-center gap-1.5 min-w-0">
        {team?.logo_url ? (
           <img src={team.logo_url} className="w-4 h-4 rounded-full object-cover flex-shrink-0" alt="" />
        ) : team?.color ? (
           <span className="w-3 h-3 rounded-full border border-white/20 flex-shrink-0" style={{ backgroundColor: team.color }} />
        ) : null}
        <span className="truncate">{name || "Por definir"}</span>
      </div>
      {score !== undefined && (
        <span className="font-black bg-background/50 px-1.5 py-0.5 rounded border border-secondary/50 flex-shrink-0">
          {score}
        </span>
      )}
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
  liguillaMatches = [],
  onBracketClick,
}: {
  numEquipos: number;
  terCerLugar?: boolean;
  teamNames?: any[];
  liguillaMatches?: any[];
  onBracketClick?: () => void;
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

  // Pre-calculate bracket tree data
  const bracketData: { team?: any; score?: number; winner?: boolean }[][] = rounds.map(matchCount => 
    Array.from({ length: matchCount * 2 }).map(() => ({ team: undefined }))
  );

  // Round 0 (e.g. Semis)
  for (let i = 0; i < teamNames.length; i++) {
    if (teamNames[i]) bracketData[0][i] = { team: teamNames[i] };
  }

  // Iterate over rounds to resolve winners
  for (let ri = 0; ri < rounds.length; ri++) {
    const matchCount = rounds[ri];
    for (let mi = 0; mi < matchCount; mi++) {
      const t1 = bracketData[ri][mi * 2];
      const t2 = bracketData[ri][mi * 2 + 1];
      
      const t1Name = t1.team?.equipo || t1.team?.nombre || t1.team?.name || (typeof t1.team === 'string' ? t1.team : undefined);
      const t2Name = t2.team?.equipo || t2.team?.nombre || t2.team?.name || (typeof t2.team === 'string' ? t2.team : undefined);
      
      if (t1Name && t2Name && liguillaMatches.length > 0) {
        const match = liguillaMatches.find(m => 
          (m.local === t1Name && m.visitante === t2Name) ||
          (m.local === t2Name && m.visitante === t1Name)
        );

        if (match && match.estado === "FINALIZADO") {
          const t1Score = match.local === t1Name ? match.gl : match.gv;
          const t2Score = match.local === t2Name ? match.gl : match.gv;
          t1.score = t1Score;
          t2.score = t2Score;
          t1.winner = t1Score > t2Score;
          t2.winner = t2Score > t1Score;

          // Advance winner to next round if there is one
          if (ri + 1 < rounds.length) {
            const nextMatchIndex = Math.floor(mi / 2);
            const nextSlotIndex = mi % 2 === 0 ? nextMatchIndex * 2 : nextMatchIndex * 2 + 1;
            bracketData[ri + 1][nextSlotIndex] = { team: t1.winner ? t1.team : t2.team };
          }
        }
      }
    }
  }

  return (
    <div 
      className={`overflow-x-auto rounded-xl bg-background/50 border border-secondary ${onBracketClick ? "cursor-pointer hover:bg-secondary/10 transition-colors" : ""}`}
      onClick={onBracketClick}
    >
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
                  const t1 = bracketData[ri][mi * 2] || { team: undefined };
                  const t2 = bracketData[ri][mi * 2 + 1] || { team: undefined };
                  return (
                    <div key={mi} className="flex flex-col gap-0.5">
                      <SlotPill team={t1.team} score={t1.score} highlight={t1.winner} />
                      <div className="h-px bg-secondary/30 mx-1" />
                      <SlotPill team={t2.team} score={t2.score} highlight={t2.winner} />
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
            {(() => {
              // Determinar campeón si existe
              const finalMatchCount = rounds[rounds.length - 1];
              if (finalMatchCount > 0) {
                const f1 = bracketData[rounds.length - 1][0];
                const f2 = bracketData[rounds.length - 1][1];
                if (f1?.winner) {
                  const name = f1.team?.equipo || f1.team?.nombre || f1.team?.name || (typeof f1.team === 'string' ? f1.team : "");
                  return (
                    <div className="w-full h-14 rounded-xl bg-amber-500/15 border-2 border-amber-500/40 text-xs text-amber-500 font-black flex items-center justify-center text-center uppercase tracking-wider px-2 shadow-inner">
                      {name}
                    </div>
                  );
                } else if (f2?.winner) {
                  const name = f2.team?.equipo || f2.team?.nombre || f2.team?.name || (typeof f2.team === 'string' ? f2.team : "");
                  return (
                    <div className="w-full h-14 rounded-xl bg-amber-500/15 border-2 border-amber-500/40 text-xs text-amber-500 font-black flex items-center justify-center text-center uppercase tracking-wider px-2 shadow-inner">
                      {name}
                    </div>
                  );
                }
              }
              return (
                <div className="w-full h-14 rounded-xl bg-primary/15 border-2 border-primary/40 text-xs text-primary font-black flex items-center justify-center text-center uppercase tracking-wider px-2 shadow-inner">
                  Campeón
                </div>
              );
            })()}
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
  tablaPosiciones,
  liguillaMatches = [],
  onTableClick,
  onBracketClick,
  viewMode = "all",
}: {
  numEquipos: number;
  tipoFormato: TorneoFormato["tipo_formato"] | "";
  terCerLugar: boolean;
  clasificados: 4 | 8;
  numGrupos: 2 | 4 | 8;
  equiposPorGrupo: 3 | 4 | 5;
  clasificadosPorGrupo: 1 | 2;
  teamNames?: string[];
  tablaPosiciones?: any[];
  liguillaMatches?: any[];
  onTableClick?: () => void;
  onBracketClick?: () => void;
  viewMode?: "all" | "table" | "bracket";
}) {
  const useRealData = Boolean(tablaPosiciones && tablaPosiciones.length > 0);

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
      <div className="rounded-xl border border-secondary bg-background overflow-hidden overflow-x-auto text-[10px]">
        <table className="w-full text-left text-xs whitespace-nowrap min-w-max">
          <thead>
            <tr className="bg-secondary/40 border-b border-secondary/30 text-muted-foreground font-black uppercase text-[10px] tracking-wider text-center">
              <th className="py-2.5 px-3">Pos</th>
              <th className="py-2.5 px-3 text-left">Equipo</th>
              <th className="py-2.5 px-2">PJ</th>
              <th className="py-2.5 px-2">PG</th>
              <th className="py-2.5 px-2">PE</th>
              <th className="py-2.5 px-2">PP</th>
              <th className="py-2.5 px-2">GF</th>
              <th className="py-2.5 px-2">GC</th>
              <th className="py-2.5 px-2">DG</th>
              <th className="py-2.5 px-3 font-black text-foreground">Pts</th>
            </tr>
          </thead>
          <tbody
            className={`font-semibold text-foreground ${onTableClick ? "cursor-pointer hover:bg-secondary/10 transition-colors" : ""}`}
            onClick={onTableClick}
          >
            {useRealData && tablaPosiciones ? (
              tablaPosiciones.map((row, i) => (
                <tr
                  key={i}
                  className={`border-t border-secondary/30 items-center text-center ${i < 2 ? "bg-primary/5" : ""} hover:bg-secondary/30 transition-colors`}
                >
                  <td className={`py-2 px-3 font-black ${i === 0 ? "text-amber-500" : i === 1 ? "text-slate-400" : i === 2 ? "text-amber-700" : "text-muted-foreground"}`}>{row.pos || i + 1}</td>
                  <td className="py-2 px-3 flex items-center gap-2 min-w-[120px] text-left">
                    {row.logo_url ? (
                      <img src={row.logo_url} className="w-5 h-5 rounded-full object-cover border border-secondary flex-shrink-0" alt="" />
                    ) : (
                      <span className="w-4 h-4 rounded-full border border-white/20 flex-shrink-0" style={{ backgroundColor: row.color || "#991b1b" }} />
                    )}
                    <span className="font-bold text-foreground truncate max-w-[180px]">{row.equipo}</span>
                  </td>
                  <td className="py-2 px-2 text-muted-foreground">{row.pj}</td>
                  <td className="py-2 px-2 text-muted-foreground">{row.pg}</td>
                  <td className="py-2 px-2 text-muted-foreground">{row.pe}</td>
                  <td className="py-2 px-2 text-muted-foreground">{row.pp}</td>
                  <td className="py-2 px-2 text-muted-foreground">{row.gf}</td>
                  <td className="py-2 px-2 text-muted-foreground">{row.gc}</td>
                  <td className="py-2 px-2 text-muted-foreground">{row.dg > 0 ? `+${row.dg}` : row.dg}</td>
                  <td className="py-2 px-3 font-black text-primary bg-primary/10">{row.pts}</td>
                </tr>
              ))
            ) : (
              Array.from({ length: Math.min(rows, 10) }).map((_, i) => (
                <tr
                  key={i}
                  className={`border-t border-secondary/30 items-center text-center ${i < 2 ? "bg-primary/5" : ""}`}
                >
                  <td className="py-2 px-3 font-black text-muted-foreground">{i + 1}</td>
                  <td className="py-2 px-3 flex items-center gap-2 min-w-[120px] text-left">
                    <span className="w-4 h-4 rounded-full border border-white/20 bg-secondary flex-shrink-0" />
                    <span className="font-bold text-foreground truncate max-w-[180px]">{teamNames[i] || `Equipo ${i + 1}`}</span>
                  </td>
                  <td className="py-2 px-2 text-muted-foreground">0</td>
                  <td className="py-2 px-2 text-muted-foreground">0</td>
                  <td className="py-2 px-2 text-muted-foreground">0</td>
                  <td className="py-2 px-2 text-muted-foreground">0</td>
                  <td className="py-2 px-2 text-muted-foreground">0</td>
                  <td className="py-2 px-2 text-muted-foreground">0</td>
                  <td className="py-2 px-2 text-muted-foreground">0</td>
                  <td className="py-2 px-3 font-black text-primary bg-primary/10">0</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
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
        {(viewMode === "all" || viewMode === "table") && (
          <div className="rounded-xl border border-secondary bg-background overflow-hidden overflow-x-auto text-[10px]">
          <table className="w-full text-left text-xs whitespace-nowrap min-w-max">
            <thead>
              <tr className="bg-secondary/40 border-b border-secondary/30 text-muted-foreground font-black uppercase text-[10px] tracking-wider text-center">
                <th className="py-2.5 px-3">Pos</th>
                <th className="py-2.5 px-3 text-left">Equipo (Top {clasificados})</th>
                <th className="py-2.5 px-2">PJ</th>
                <th className="py-2.5 px-2">PG</th>
                <th className="py-2.5 px-2">PE</th>
                <th className="py-2.5 px-2">PP</th>
                <th className="py-2.5 px-2">GF</th>
                <th className="py-2.5 px-2">GC</th>
                <th className="py-2.5 px-2">DG</th>
                <th className="py-2.5 px-3 font-black text-foreground">Pts</th>
              </tr>
            </thead>
            <tbody
              className={`font-semibold text-foreground ${onTableClick ? "cursor-pointer hover:bg-secondary/10 transition-colors" : ""}`}
              onClick={onTableClick}
            >
              {useRealData && tablaPosiciones ? (
                tablaPosiciones.map((row, i) => (
                  <tr
                    key={i}
                    className={`border-t border-secondary/30 items-center text-center ${i < clasificados ? "bg-primary/5" : ""} hover:bg-secondary/30 transition-colors`}
                  >
                    <td className={`py-2 px-3 font-black ${i < clasificados ? "text-primary" : "text-muted-foreground"}`}>{row.pos || i + 1}</td>
                    <td className="py-2 px-3 flex items-center gap-2 min-w-[120px] text-left">
                      {i < clasificados && <span className="text-primary text-[8px] flex-shrink-0">▶</span>}
                      {row.logo_url ? (
                        <img src={row.logo_url} className="w-5 h-5 rounded-full object-cover border border-secondary flex-shrink-0" alt="" />
                      ) : (
                        <span className="w-4 h-4 rounded-full border border-white/20 flex-shrink-0" style={{ backgroundColor: row.color || "#991b1b" }} />
                      )}
                      <span className="font-bold text-foreground truncate max-w-[180px]">{row.equipo}</span>
                    </td>
                    <td className="py-2 px-2 text-muted-foreground">{row.pj}</td>
                    <td className="py-2 px-2 text-muted-foreground">{row.pg}</td>
                    <td className="py-2 px-2 text-muted-foreground">{row.pe}</td>
                    <td className="py-2 px-2 text-muted-foreground">{row.pp}</td>
                    <td className="py-2 px-2 text-muted-foreground">{row.gf}</td>
                    <td className="py-2 px-2 text-muted-foreground">{row.gc}</td>
                    <td className="py-2 px-2 text-muted-foreground">{row.dg > 0 ? `+${row.dg}` : row.dg}</td>
                    <td className="py-2 px-3 font-black text-primary bg-primary/10">{row.pts}</td>
                  </tr>
                ))
              ) : (
                Array.from({ length: Math.min(clasificados + 2, 8) }).map((_, i) => (
                  <tr
                    key={i}
                    className={`border-t border-secondary/30 items-center text-center ${i < clasificados ? "bg-primary/5" : ""}`}
                  >
                    <td className={`py-2 px-3 font-black ${i < clasificados ? "text-primary" : "text-muted-foreground"}`}>{i + 1}</td>
                    <td className="py-2 px-3 flex items-center gap-2 min-w-[120px] text-left">
                      {i < clasificados && <span className="text-primary text-[8px] flex-shrink-0">▶</span>}
                      <span className="w-4 h-4 rounded-full border border-white/20 bg-secondary flex-shrink-0" />
                      <span className="font-bold text-foreground truncate max-w-[180px]">{teamNames[i] || `Equipo ${i + 1}`}</span>
                    </td>
                    <td className="py-2 px-2 text-muted-foreground">0</td>
                    <td className="py-2 px-2 text-muted-foreground">0</td>
                    <td className="py-2 px-2 text-muted-foreground">0</td>
                    <td className="py-2 px-2 text-muted-foreground">0</td>
                    <td className="py-2 px-2 text-muted-foreground">0</td>
                    <td className="py-2 px-2 text-muted-foreground">0</td>
                    <td className="py-2 px-2 text-muted-foreground">0</td>
                    <td className="py-2 px-3 font-black text-primary bg-primary/10">0</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        )}
        {/* Bracket de liguilla */}
        {(viewMode === "all" || viewMode === "bracket") && (
        <div>
          <p className="text-[9px] uppercase font-extrabold text-muted-foreground mb-2 tracking-wider">
            Liguilla — Top {clasificados}
          </p>
          {(() => {
            let bracketTeamsData: any[] = [];
            if (useRealData && tablaPosiciones && tablaPosiciones.length >= clasificados) {
              if (clasificados === 4) {
                bracketTeamsData = [0, 3, 1, 2].map(s => tablaPosiciones[s]);
              } else if (clasificados === 8) {
                bracketTeamsData = [0, 7, 3, 4, 1, 6, 2, 5].map(s => tablaPosiciones[s]);
              }
            }
            return (
              <BracketTree 
                numEquipos={clasificados} 
                terCerLugar={terCerLugar} 
                teamNames={bracketTeamsData.length > 0 ? bracketTeamsData : undefined} 
                liguillaMatches={liguillaMatches}
                onBracketClick={onBracketClick}
              />
            );
          })()}
          </div>
        )}
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
