/**
 * Roles del sistema en TypeScript.
 *
 * IMPORTANTE: Espejo exacto de RoleEnum en backend/api/app/models/user.py.
 * Si el backend agrega o renombra un rol, este archivo debe actualizarse
 * de forma simultánea (AGENTS.md §4).
 */
export enum Role {
  ADMIN         = "admin",
  ORGANIZER     = "organizer",
  MATCH_MANAGER = "match_manager",
  PLAYER        = "player",
  VIEWER        = "viewer",
}
