import type { Equipo } from './equipo';

export interface Torneo {
  id: string;
  nombre: string;
  categoria: string;
  sport_id: string;
  organizer_id: string;
  creado_en?: string;
  datos_adicionales?: Record<string, any>;
  // Relaciones
  sport?: {
    id: string;
    nombre: string;
  };
  equipos?: Equipo[];
}

export interface TorneoCrearPayload {
  nombre: string;
  categoria: string;
  sport_id: string;
  datos_adicionales?: Record<string, any>;
}

export interface TorneoActualizarPayload {
  nombre?: string;
  categoria?: string;
  sport_id?: string;
  datos_adicionales?: Record<string, any>;
}

/** Configuración del formato y estructura de competencia de un torneo.
 *  Se serializa como JSON dentro de Tournament.datos_adicionales.formato */
export interface TorneoFormato {
  tipo_formato: "liga" | "eliminacion" | "liga_playoffs" | "grupos_eliminacion";
  /** Solo aplica cuando tipo_formato es "liga" o "liga_playoffs" */
  modalidad_liga?: "ida" | "ida_vuelta";
  /** Solo aplica cuando tipo_formato es "eliminacion" o "liga_playoffs" */
  modalidad_ko?: "partido_unico" | "ida_vuelta_ko";
  tercer_lugar?: boolean;
  /** Solo aplica cuando tipo_formato es "liga_playoffs" */
  clasificados_playoffs?: 4 | 8;
  /** Solo aplica cuando tipo_formato es "grupos_eliminacion" */
  num_grupos?: 2 | 4 | 8;
  equipos_por_grupo?: 3 | 4 | 5;
  clasificados_por_grupo?: 1 | 2;
  /** Número estimado de equipos participantes */
  num_equipos?: number;
  /** Reglas, premios y detalles adicionales redactados por el organizador */
  reglas?: string;
}