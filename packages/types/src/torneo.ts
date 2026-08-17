import type { Equipo } from './equipo';

export interface Torneo {
  id: string;
  nombre: string;
  categoria: string;
  sport_id: string;
  organizer_id: string;
  creado_en?: string;
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
}

export interface TorneoActualizarPayload {
  nombre?: string;
  categoria?: string;
  sport_id?: string;
}