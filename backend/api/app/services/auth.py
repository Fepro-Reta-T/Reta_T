from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import create_access_token, hash_password, verify_password
from app.models.user import User
from app.repositories import user as user_repo
from app.schemas.user import UserCreate


async def register_user(db: AsyncSession, data: UserCreate) -> User:
    existing = await user_repo.get_user_by_email(db, data.email)
    if existing is not None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Ya existe un usuario con ese email",
        )

    hashed = hash_password(data.password)
    return await user_repo.create_user(
        db,
        email=data.email,
        hashed_password=hashed,
        full_name=data.full_name,
        role=data.role,
    )


async def authenticate_user(db: AsyncSession, email: str, password: str) -> str:
    """Devuelve el access token si las credenciales son válidas, o lanza 401/403."""
    user = await user_repo.get_user_by_email(db, email)
    if user is None or not verify_password(password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email o contraseña incorrectos",
        )
    if not user.is_active:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Usuario inactivo")

    return create_access_token(subject=str(user.id), role=user.role.value)
