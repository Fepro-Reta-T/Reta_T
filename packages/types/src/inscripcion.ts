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

export interface SolicitudInscripcion {
  id: string;
  torneo_id: string;
  equipo_id: string;
  estado: "PENDIENTE" | "APROBADA" | "RECHAZADA";
  fecha_solicitud: string;
  equipo?: any; // Para cuando se liste con el equipo populado
}

export interface SolicitudAccionPayload {
  accion: "ACEPTAR" | "RECHAZAR";
}