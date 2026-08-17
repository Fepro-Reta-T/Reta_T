export interface Inscripcion {
  id: string;
  equipo_id: string;
  torneo_id: string;
  fecha_inscripcion: string;
}

export interface InscripcionCrearPayload {
  equipo_id: string;
  torneo_id: string;
}