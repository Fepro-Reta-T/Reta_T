import type { ApiClient } from './client';
import type { Torneo, TorneoCrearPayload, TorneoActualizarPayload } from '@reta-t/types';

export function createTorneosApi(client: ApiClient) {
  return {
    crear: (payload: TorneoCrearPayload): Promise<Torneo> => {
      return client.post<Torneo>('/torneos', payload);
    },

    listar: (): Promise<Torneo[]> => {
      return client.get<Torneo[]>('/torneos');
    },

    obtener: (id: string): Promise<Torneo> => {
      return client.get<Torneo>(`/torneos/${id}`);
    },

    actualizar: (id: string, payload: TorneoActualizarPayload): Promise<Torneo> => {
      return client.put<Torneo>(`/torneos/${id}`, payload);
    },

    eliminar: (id: string): Promise<void> => {
      return client.delete<void>(`/torneos/${id}`);
    },
    
    // Si llegas a necesitar un endpoint específico para los torneos del usuario
    // similar a "misCanchas", lo puedes agregar así:
    misTorneos: (): Promise<Torneo[]> => {
      return client.get<Torneo[]>('/torneos/mis-torneos');
    },
  };
}

export type TorneosApi = ReturnType<typeof createTorneosApi>;