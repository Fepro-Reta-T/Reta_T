import type { Equipo } from './equipo';

export type FormatoTorneo = 'liga' | 'eliminacion_directa' | 'liga_playoffs';

export interface EstructuraTorneoConfig {
  tipo_formato: FormatoTorneo;
  ida_y_vuelta?: boolean;
  clasificados_playoffs?: number; // 4 u 8 equipos
  formato_playoffs?: 'partido_unico' | 'ida_y_vuelta';
  tercer_lugar?: boolean;
}

export interface Torneo {
  id: string;
  nombre: string;
  categoria: string;
  sport_id: string;
  organizer_id: string;
  creado_en?: string;
  datos_adicionales?: Record<string, any> & {
    estructura?: EstructuraTorneoConfig;
    imagen_portada?: string;
    reglas?: string;
    equipos_invitados_ids?: string[];
  };
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