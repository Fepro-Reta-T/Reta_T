export interface Equipo {
  id: string;
  nombre: string;
  color?: string | null;
  logo_url?: string | null;
  creado_en?: string;
}

export interface EquipoCrearPayload {
  nombre: string;
  color?: string | null;
  logo_url?: string | null;
  organizer_id?: string; 
}

export interface EquipoActualizarPayload {
  nombre?: string;
  color?: string | null;
  logo_url?: string | null;
}