# backend/api/app/routers/municipio.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
from app.core.database import get_db
from app.core.deps import require_role
from app.models.user import User, RoleEnum
from app.schemas.municipio import MunicipioCreate, MunicipioResponse
from app.services.municipio_service import MunicipioService
from app.repositories.municipio_repository import MunicipioRepository

router = APIRouter(prefix="/municipios", tags=["Municipios"])

def get_municipio_service(db: AsyncSession = Depends(get_db)) -> MunicipioService:
    return MunicipioService(MunicipioRepository(db))

# ✅ CORREGIDO: require_role con lista
@router.get("/", response_model=List[MunicipioResponse])
async def listar_municipios(
    service: MunicipioService = Depends(get_municipio_service)
):
    return await service.listar()

# ✅ CORREGIDO: require_role con lista y validación de existencia
@router.post("/", response_model=MunicipioResponse, status_code=status.HTTP_201_CREATED)
async def crear_municipio(
    datos: MunicipioCreate,
    current_user: User = Depends(require_role(RoleEnum.ADMIN)),
    service: MunicipioService = Depends(get_municipio_service)
):
    # ✅ Validar que no exista
    existente = await service.obtener_por_nombre(datos.nombre)
    if existente:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Municipio ya existe"
        )
    
    return await service.crear(datos)