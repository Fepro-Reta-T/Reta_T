export interface Partido {
  id: string;
  torneo_id: string;
  equipo_local_id: string;
  equipo_visitante_id: string;
  cancha_id?: string | null;
  match_manager_id?: string | null;
  fecha?: string | null;
  datos_adicionales?: Record<string, any> | null;
  
  // Relaciones pobladas opcionales
  equipo_local?: { id: string; nombre: string; color?: string | null; logo_url?: string | null };
  equipo_visitante?: { id: string; nombre: string; color?: string | null; logo_url?: string | null };
  cancha?: { id: string; nombre: string };
}

export interface PartidoCrearPayload {
  torneo_id: string;
  equipo_local_id: string;
  equipo_visitante_id: string;
  cancha_id?: string | null;
  match_manager_id?: string | null;
  fecha?: string | null;
  datos_adicionales?: Record<string, any> | null;
}

export interface PartidoActualizarPayload {
  equipo_local_id?: string;
  equipo_visitante_id?: string;
  cancha_id?: string | null;
  match_manager_id?: string | null;
  fecha?: string | null;
  datos_adicionales?: Record<string, any> | null;
}
