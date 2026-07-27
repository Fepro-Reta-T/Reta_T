/**
 * Cliente HTTP base del monorepo.
 *
 * Centraliza headers, manejo de errores HTTP y el JWT.
 * web-next y registro-pwa NUNCA hacen fetch directo — siempre a través de este cliente.
 *
 * La baseUrl se pasa al constructor; cada app la lee de su variable de entorno:
 *   - Next.js:  process.env.NEXT_PUBLIC_API_URL
 *   - Vite/PWA: import.meta.env.VITE_API_URL
 */

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly detail: string,
  ) {
    super(`API error ${status}: ${detail}`);
    this.name = "ApiError";
  }
}

export class ApiClient {
  private token: string | null = null;

  constructor(private readonly baseUrl: string) {}

  /** Guarda el JWT para incluirlo en todas las requests siguientes. */
  setToken(token: string | null): void {
    this.token = token;
  }

  private get headers(): HeadersInit {
    const h: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (this.token) {
      h["Authorization"] = `Bearer ${this.token}`;
    }
    return h;
  }

  async get<T>(path: string): Promise<T> {
    const res = await fetch(`${this.baseUrl}${path}`, {
      method: "GET",
      headers: this.headers,
    });
    return this.handleResponse<T>(res);
  }

  async post<T>(path: string, body: unknown): Promise<T> {
    const res = await fetch(`${this.baseUrl}${path}`, {
      method: "POST",
      headers: this.headers,
      body: JSON.stringify(body),
    });
    return this.handleResponse<T>(res);
  }

  private async handleResponse<T>(res: Response): Promise<T> {
    if (!res.ok) {
      let detail = "Error desconocido";
      try {
        const json = (await res.json()) as { detail?: string };
        detail = json?.detail ?? detail;
      } catch {
        // Error de parseo — mantener mensaje genérico
      }
      throw new ApiError(res.status, detail);
    }
    return res.json() as Promise<T>;
  }
}

/** Factory para crear una instancia del cliente configurada con la URL de la API. */
export function createApiClient(baseUrl: string): ApiClient {
  return new ApiClient(baseUrl);
}
