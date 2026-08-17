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
  };
}

export type InscripcionesApi = ReturnType<typeof createInscripcionesApi>;