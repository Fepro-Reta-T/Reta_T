import uuid

import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.core.security import decode_access_token
from app.models.user import User
from app.repositories import user as user_repo

# tokenUrl es solo para que /docs muestre el botón de "Authorize" apuntando al endpoint correcto.
# El login real de este proyecto recibe JSON, no form-data — ver schemas/auth.py.
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login", auto_error=False)


async def get_current_user(
    token: str | None = Depends(oauth2_scheme),
    db: AsyncSession = Depends(get_db),
) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="No se pudo validar la credencial",
        headers={"WWW-Authenticate": "Bearer"},
    )
    if token is None:
        raise credentials_exception

    try:
        payload = decode_access_token(token)
    except jwt.PyJWTError:
        raise credentials_exception

    raw_user_id = payload.get("sub")
    if raw_user_id is None:
        raise credentials_exception

    try:
        user_id = uuid.UUID(raw_user_id)
    except ValueError:
        raise credentials_exception

    user = await user_repo.get_user_by_id(db, user_id)
    if user is None:
        raise credentials_exception

    return user
