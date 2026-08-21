import { 
  createApiClient, 
  createAuthApi,
  createTorneosApi,
  createEquiposApi,
  createCanchasApi,
  createInscripcionesApi,
  createPartidosApi,
} from '@reta-t/api-client';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export const apiClient = createApiClient(API_URL);

export const authApi = createAuthApi(apiClient);
export const torneosApi = createTorneosApi(apiClient);
export const equiposApi = createEquiposApi(apiClient);
export const canchasApi = createCanchasApi(apiClient);
export const inscripcionesApi = createInscripcionesApi(apiClient);
export const partidosApi = createPartidosApi(apiClient);

const TOKEN_KEY = 'auth_token';
export const setAuthToken = (token: string | null) => {
  apiClient.setToken(token);
  
  if (typeof window !== 'undefined') {
    if (token) {
      localStorage.setItem(TOKEN_KEY, token);
    } else {
      localStorage.removeItem(TOKEN_KEY);
    }
  }
};

export const getAuthToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('auth_token');
  }
  return null;
};

if (typeof window !== 'undefined') {
  const token = getAuthToken();
  if (token) {
    apiClient.setToken(token);
  }
}