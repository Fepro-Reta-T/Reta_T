import type { ApiClient } from './client';
import type { Cancha, CanchaCrearPayload } from '@reta-t/types';

export function createCanchasApi(client: ApiClient) {
  return {
    crear: (payload: CanchaCrearPayload): Promise<Cancha> => {
      return client.post<Cancha>('/canchas', payload);
    },

    listar: (): Promise<Cancha[]> => {
      return client.get<Cancha[]>('/canchas');
    },

    obtener: (id: string): Promise<Cancha> => {
      return client.get<Cancha>(`/canchas/${id}`);
    },

    actualizar: (id: string, payload: Partial<CanchaCrearPayload>): Promise<Cancha> => {
      return client.put<Cancha>(`/canchas/${id}`, payload);
    },

    eliminar: (id: string): Promise<void> => {
      return client.delete<void>(`/canchas/${id}`);
    },

    // Si llegas a necesitar un endpoint específico para las canchas del usuario
    // similar a "misTorneos", lo puedes agregar así:
    misCanchas: (): Promise<Cancha[]> => {
      return client.get<Cancha[]>('/canchas/mis-canchas');
    },
  };
}

export type CanchasApi = ReturnType<typeof createCanchasApi>;