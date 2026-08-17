import type { Role } from "./roles";

/**
 * Representación del usuario en el frontend.
 * Espejo de UserOut en backend/api/app/schemas/user.py.
 * Nunca contiene hashed_password.
 */
export interface User {
  id: string;          // UUID serializado como string
  email: string;
  telefono?: string | null;
  full_name: string;
  role: Role;
  is_active: boolean;
  datos_adicionales?: Record<string, any> | null;
}

export interface UserOnboardingUpdate {
  role?: Role;
  datos_adicionales?: Record<string, any> | null;
}

/**
 * Payload para registrar un usuario nuevo.
 * Espejo de UserCreate en backend/api/app/schemas/user.py.
 */
export interface RegisterPayload {
  email: string;
  telefono?: string;
  password: string;
  full_name: string;
  role?: Role;         // El backend asigna PLAYER por defecto si se omite
}

/**
 * Payload de inicio de sesión.
 * Espejo de LoginRequest en backend/api/app/schemas/auth.py.
 */
export interface LoginPayload {
  email: string;
  password: string;
}

/**
 * Respuesta del endpoint /auth/login.
 * Espejo de Token en backend/api/app/schemas/auth.py.
 */
export interface AuthToken {
  access_token: string;
  token_type: "bearer";
}
