import React from "react";
import { BracketPreview } from "@/components/BracketPreview";

interface BracketModalProps {
  onClose: () => void;
  torneo: any;
  equipos: any[];
  tablaPosiciones: any[];
  liguillaMatches: any[];
}

export function BracketModal({ onClose, torneo, equipos, tablaPosiciones, liguillaMatches }: BracketModalProps) {
  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-card rounded-3xl border border-secondary max-w-5xl w-full p-6 shadow-2xl space-y-5 max-h-[90vh] flex flex-col animate-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center pb-3 border-b border-secondary">
          <div>
            <h3 className="text-xl font-black text-foreground tracking-tight">
              Estructura del Torneo Ampliada
            </h3>
            <p className="text-xs text-muted-foreground">
              Visualización detallada de la clasificación y llaves eliminatorias.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground text-xl font-bold p-1"
          >
            ✕
          </button>
        </div>

        <div className="overflow-y-auto flex-1 p-2">
          <BracketPreview
            numEquipos={torneo.max_equipos || torneo.datos_adicionales?.formato?.num_equipos || equipos.length || 4}
            tipoFormato={torneo.datos_adicionales?.formato?.tipo_formato}
            terCerLugar={torneo.datos_adicionales?.formato?.tercer_lugar}
            clasificados={torneo.datos_adicionales?.formato?.clasificados_playoffs}
            numGrupos={torneo.datos_adicionales?.formato?.num_grupos}
            equiposPorGrupo={torneo.datos_adicionales?.formato?.equipos_por_grupo}
            clasificadosPorGrupo={torneo.datos_adicionales?.formato?.clasificados_por_grupo}
            teamNames={equipos.map(e => e.nombre)}
            tablaPosiciones={tablaPosiciones}
            liguillaMatches={liguillaMatches}
            viewMode="bracket"
          />
        </div>

        <div className="pt-3 border-t border-secondary flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 bg-secondary text-foreground rounded-xl font-bold text-xs hover:bg-secondary/80 transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
