import type { ApiClient } from "./client";
import type {
  AuthToken,
  LoginPayload,
  RegisterPayload,
  User,
} from "@reta-t/types";

/**
 * Wrapper tipado de los endpoints /auth/* del backend FastAPI.
 *
 * Espeja exactamente:
 *   POST /auth/register  →  UserOut
 *   POST /auth/login     →  Token
 *   GET  /auth/me        →  UserOut  (requiere token previo en el cliente)
 *
 * Uso:
 *   const client = createApiClient(process.env.NEXT_PUBLIC_API_URL!);
 *   const auth   = createAuthApi(client);
 *   const user   = await auth.register({ email, password, full_name });
 */
export function createAuthApi(client: ApiClient) {
  return {
    /** Crea un usuario nuevo. Devuelve el perfil creado (sin password). */
    register(payload: RegisterPayload): Promise<User> {
      return client.post<User>("/auth/register", payload);
    },

    /**
     * Autentica al usuario y devuelve el JWT.
     * Después de llamar a login(), usa client.setToken(token.access_token)
     * para que las siguientes requests vayan autenticadas.
     */
    login(payload: LoginPayload): Promise<AuthToken> {
      return client.post<AuthToken>("/auth/login", payload);
    },

    /**
     * Realiza el login y guarda el token en el `client` automáticamente.
     * Útil para centralizar el manejo del JWT y evitar olvidos en callers.
     */
    async loginAndSetToken(payload: LoginPayload): Promise<AuthToken> {
      const token = await client.post<AuthToken>("/auth/login", payload);
      client.setToken(token.access_token);
      return token;
    },

    /**
     * Devuelve el perfil del usuario autenticado.
     * Requiere que client.setToken() haya sido llamado previamente.
     */
    me(): Promise<User> {
      return client.get<User>("/auth/me");
    },
  };
}

export type AuthApi = ReturnType<typeof createAuthApi>;
