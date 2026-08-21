export interface Equipo {
  id: string;
  nombre: string;
  color?: string | null;
  logo_url?: string | null;
  creado_en?: string;
  datos_adicionales?: Record<string, any>;
}

export interface EquipoCrearPayload {
  nombre: string;
  color?: string | null;
  logo_url?: string | null;
  organizer_id?: string;
  datos_adicionales?: Record<string, any>;
}

export interface EquipoActualizarPayload {
  nombre?: string;
  color?: string | null;
  logo_url?: string | null;
  datos_adicionales?: Record<string, any>;
}

export interface EquipoTransferirPayload {
  email: string;
}