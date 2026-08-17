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
    public readonly detail: any,
  ) {
    let message = `API error ${status}`;
    
    if (typeof detail === 'string') {
      message += `: ${detail}`;
    } else if (Array.isArray(detail)) {
      const errors = detail.map((d: any) => {
        const field = d.loc?.join('.') || 'campo';
        return `${field}: ${d.msg}`;
      }).join(', ');
      message += `: ${errors}`;
    } else if (detail && typeof detail === 'object') {
      message += `: ${JSON.stringify(detail)}`;
    }
    
    super(message);
    this.name = "ApiError";
  }
}

export class ApiClient {
  private token: string | null = null;
  private onUnauthorized: (() => void) | null = null;

  constructor(private readonly baseUrl: string) {}

  setToken(token: string | null): void {
    this.token = token;
  }

  getToken(): string | null {
    return this.token;
  }

  setUnauthorizedHandler(fn: () => void): void {
    this.onUnauthorized = fn;
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

  async put<T>(path: string, body: unknown): Promise<T> {
    const res = await fetch(`${this.baseUrl}${path}`, {
      method: "PUT",
      headers: this.headers,
      body: JSON.stringify(body),
    });

    if (res.status === 204) {
      return null as T;
    }

    return this.handleResponse<T>(res);
  }

  async patch<T>(path: string, body: unknown): Promise<T> {
    const res = await fetch(`${this.baseUrl}${path}`, {
      method: "PATCH",
      headers: this.headers,
      body: JSON.stringify(body),
    });

    if (res.status === 204) {
      return null as T;
    }

    return this.handleResponse<T>(res);
  }

  async delete<T>(path: string): Promise<T> {
    const res = await fetch(`${this.baseUrl}${path}`, {
      method: "DELETE",
      headers: this.headers,
    });

    if (res.status === 204) {
      return null as T;
    }

    return this.handleResponse<T>(res);
  }

  private async handleResponse<T>(res: Response): Promise<T> {
    if (res.status === 401) {
      this.onUnauthorized?.();
    }

    if (!res.ok) {
      let detail: any = "Error desconocido";
      try {
        const json = await res.json();
        detail = json?.detail ?? json ?? "Error desconocido";
      } catch {
      }
      throw new ApiError(res.status, detail);
    }

    if (res.status === 204) {
      return null as T;
    }

    const text = await res.text();
    if (!text) {
      return null as T;
    }

    try {
      return JSON.parse(text) as T;
    } catch {
      return null as T;
    }
  }
}

/** Factory para crear una instancia del cliente configurada con la URL de la API. */
export function createApiClient(baseUrl: string): ApiClient {
  return new ApiClient(baseUrl);
}