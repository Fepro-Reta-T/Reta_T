# backend/api/app/core/deps.py
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.ext.asyncio import AsyncSession
import jwt
from app.core.config import settings
from app.core.database import get_db
from app.repositories import user as user_repo
from app.models.user import User, RoleEnum

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")


async def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: AsyncSession = Depends(get_db),
) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Credenciales inválidas",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        payload = jwt.decode(token, settings.jwt_secret_key, algorithms=[settings.jwt_algorithm])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise credentials_exception
    except jwt.PyJWTError:
        raise credentials_exception

    user = await user_repo.get_user_by_id(db, user_id)
    if user is None:
        raise credentials_exception

    return user


def require_role(*allowed_roles: RoleEnum):
    """
    Dependencia para verificar que el usuario tenga uno de los roles permitidos.

    Uso:
        current_user: User = Depends(require_role(RoleEnum.ADMIN, RoleEnum.ORGANIZER))
    """
    allowed_values = {
        role.value if hasattr(role, "value") else str(role)
        for role in allowed_roles
    }

    async def role_checker(
        current_user: User = Depends(get_current_user),
    ) -> User:
        user_role_value = (
            current_user.role.value if hasattr(current_user.role, "value")
            else str(current_user.role)
        )

        if user_role_value not in allowed_values:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Insufficient role. Required one of: {sorted(allowed_values)}. Your role: {user_role_value}",
            )
        return current_user

    return role_checker