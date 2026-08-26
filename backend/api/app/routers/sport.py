from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.database import get_db
from app.models.sport import Sport

router = APIRouter(prefix="/sports", tags=["Deportes"])

@router.get("")
async def listar_sports(db: AsyncSession = Depends(get_db)):
    """Lista todos los deportes disponibles en el sistema."""
    try:
        result = await db.execute(select(Sport))
        sports = result.scalars().all()
        return sports
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error al cargar deportes: {str(e)}")