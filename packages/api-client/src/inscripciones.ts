import type { ApiClient } from './client';
import type { Inscripcion, InscripcionCrearPayload, Equipo } from '@reta-t/types';

export function createInscripcionesApi(client: ApiClient) {
  return {
    inscribir: (torneoId: string, equipoId: string): Promise<Inscripcion> => {
      return client.post(`/torneos/${torneoId}/inscripciones`, { equipo_id: equipoId }) as Promise<Inscripcion>;
    },

    listarEquiposInscritos: (torneoId: string): Promise<Equipo[]> => {
      return client.get(`/torneos/${torneoId}/equipos`) as Promise<Equipo[]>;
    },

    retirar: (torneoId: string, equipoId: string): Promise<void> => {
      return client.delete(`/torneos/${torneoId}/inscripciones/${equipoId}`) as Promise<void>;
    },

    crearSolicitud: (torneoId: string, equipoId: string): Promise<{message: string}> => {
      return client.post(`/torneos/${torneoId}/solicitudes`, { equipo_id: equipoId }) as Promise<{message: string}>;
    },

    listarSolicitudes: (torneoId: string): Promise<any[]> => {
      return client.get(`/torneos/${torneoId}/solicitudes`) as Promise<any[]>;
    },

    procesarSolicitud: (torneoId: string, equipoId: string, accion: "ACEPTAR" | "RECHAZAR"): Promise<{message: string}> => {
      return client.patch(`/torneos/${torneoId}/solicitudes/${equipoId}`, { accion }) as Promise<{message: string}>;
    },
  };
}

export type InscripcionesApi = ReturnType<typeof createInscripcionesApi>;