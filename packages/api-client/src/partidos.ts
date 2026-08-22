import type { ApiClient } from './client';
import type { Partido, PartidoCrearPayload, PartidoActualizarPayload } from '@reta-t/types';

export function createPartidosApi(client: ApiClient) {
  return {
    crear: (payload: PartidoCrearPayload): Promise<Partido> => {
      return client.post<Partido>('/partidos/', payload);
    },

    obtener: (id: string): Promise<Partido> => {
      return client.get<Partido>(`/partidos/${id}`);
    },

    listarPorTorneo: (torneoId: string): Promise<Partido[]> => {
      return client.get<Partido[]>(`/torneos/${torneoId}/partidos`);
    },

    actualizar: (id: string, payload: PartidoActualizarPayload): Promise<Partido> => {
      return client.put<Partido>(`/partidos/${id}`, payload);
    },

    eliminar: (id: string): Promise<void> => {
      return client.delete<void>(`/partidos/${id}`);
    },

    asignarEncargado: (id: string, matchManagerId: string): Promise<Partido> => {
      return client.patch<Partido>(`/partidos/${id}/encargado`, { match_manager_id: matchManagerId });
    },

    generarFixture: (torneoId: string): Promise<Partido[]> => {
      return client.post<Partido[]>(`/torneos/${torneoId}/generar_fixture`, {});
    },
  };
}

export type PartidosApi = ReturnType<typeof createPartidosApi>;
