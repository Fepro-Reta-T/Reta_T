import type { ApiClient } from './client';
import type { Equipo, EquipoCrearPayload, EquipoActualizarPayload } from '@reta-t/types';

export function createEquiposApi(client: ApiClient) {
  return {
    crear: (payload: EquipoCrearPayload): Promise<Equipo> => {
      return client.post<Equipo>('/equipos', payload);
    },

    listar: (): Promise<Equipo[]> => {
      return client.get<Equipo[]>('/equipos');
    },

    obtener: (id: string): Promise<Equipo> => {
      return client.get<Equipo>(`/equipos/${id}`);
    },

    actualizar: (id: string, payload: EquipoActualizarPayload): Promise<Equipo> => {
      return client.put<Equipo>(`/equipos/${id}`, payload);
    },

    eliminar: (id: string): Promise<void> => {
      return client.delete<void>(`/equipos/${id}`);
    },
  };
}

export type EquiposApi = ReturnType<typeof createEquiposApi>;