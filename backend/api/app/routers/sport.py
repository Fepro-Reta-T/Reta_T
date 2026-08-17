# backend/api/app/routers/sport.py
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List
from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.user import User
from app.models.sport import Sport
from app.schemas.sport import SportResponse  

router = APIRouter(prefix="/sports", tags=["Sports"])

# ✅ CORREGIDO: Usa schema SportResponse y requiere login
@router.get("/", response_model=List[SportResponse])
async def listar_sports(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Listar todos los deportes disponibles"""
    resultado = await db.execute(select(Sport).where(Sport.is_active == True))
    sports = resultado.scalars().all()
    return sports  # ✅ SQLAlchemy ya devuelve objetos compatibles con el schema