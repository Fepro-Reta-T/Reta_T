# backend/api/app/routers/municipio.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List
from app.core.database import get_db
from app.core.deps import require_role
from app.models.user import User, RoleEnum
from app.models.geo import Municipio
from app.schemas.municipio import MunicipioCreate, MunicipioResponse

router = APIRouter(prefix="/municipios", tags=["Municipios"])

# ✅ CORREGIDO: require_role con lista
@router.get("/", response_model=List[MunicipioResponse])
async def listar_municipios(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(
        require_role(RoleEnum.ADMIN, RoleEnum.ORGANIZER, RoleEnum.VIEWER)
    )
):
    resultado = await db.execute(select(Municipio).order_by(Municipio.nombre))
    municipios = resultado.scalars().all()
    return municipios

# ✅ CORREGIDO: require_role con lista y validación de existencia
@router.post("/", response_model=MunicipioResponse, status_code=status.HTTP_201_CREATED)
async def crear_municipio(
    datos: MunicipioCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_role(RoleEnum.ADMIN))
):
    # ✅ Validar que no exista
    resultado = await db.execute(
        select(Municipio).where(Municipio.nombre == datos.nombre)
    )
    if resultado.scalar_one_or_none():
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Municipio ya existe"
        )
    
    nuevo = Municipio(
        nombre=datos.nombre,
        estado=datos.estado,
        clave_inegi=datos.clave_inegi
    )
    db.add(nuevo)
    await db.commit()
    await db.refresh(nuevo)
    return nuevo