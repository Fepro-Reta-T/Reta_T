# Seguridad — reglas detalladas

Complementa `AGENTS.md` §8 y `GEMINI.md` §Archivos que no debe tocar el agente.

## Secretos

- Nunca hardcodear credenciales, tokens, API keys o connection strings — siempre variables de entorno.
- `.env` y `.env.local` nunca se commitean (deben estar en `.gitignore` desde el primer commit).
- El agente no debe crear, editar ni leer el contenido de archivos de secretos sin confirmación explícita del usuario en esa sesión.

## Logging

- Nunca loguear tokens, contraseñas, JWTs completos, ni el `metadata` crudo si puede contener datos sensibles de un usuario.
- Si se necesita debug de auth, loguear el `user_id`/rol, nunca el token.

## Validación de entrada

- Toda entrada de usuario se valida en `backend/api` (Pydantic), sin excepción — la validación de frontend es UX, no seguridad, y nunca se asume como única barrera.

## Autenticación

- JWT con expiración razonable + estrategia de refresh definida en `backend/api` (documentar la estrategia elegida en `backend-fastapi.md` cuando se implemente).
- Hash de contraseñas con un algoritmo moderno (ej. bcrypt o argon2) — nunca texto plano ni hashes reversibles.
- Un solo dispositivo autorizado por partido (regla de negocio + control de acceso, ver `pwa-vite.md`).

## Operaciones destructivas

Requieren confirmación explícita del usuario antes de ejecutarse, nunca en modo automático/turbo:
- Borrar liga, torneo, equipo o partido.
- Cualquier migración de base de datos.
- Cualquier `DELETE`/`DROP` fuera de un test.

## Archivos que el agente no toca sin confirmación explícita

- `.env`, `.env.local`, cualquier archivo de secretos.
- `packages/types` (rompe ambos frontends si se cambia sin coordinar).
- Configuración de despliegue (Vercel, Docker, CI/CD).
