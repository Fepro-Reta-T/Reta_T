# backend/api/app/routers/equipo.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from uuid import UUID
from typing import List
from app.core.database import get_db
from app.core.deps import require_role
from app.models.user import User, RoleEnum
from app.schemas.equipo import EquipoCreate, EquipoUpdate, EquipoResponse
from app.services.equipo_service import EquipoService
from app.repositories.equipo_repository import EquipoRepository

router = APIRouter(prefix="/equipos", tags=["Equipos"])

def get_equipo_service(db: AsyncSession = Depends(get_db)) -> EquipoService:
    return EquipoService(EquipoRepository(db))

@router.post("/", response_model=EquipoResponse, status_code=status.HTTP_201_CREATED)
async def crear_equipo(
    datos: EquipoCreate,
    current_user: User = Depends(require_role(RoleEnum.ADMIN, RoleEnum.ORGANIZER)),
    service: EquipoService = Depends(get_equipo_service)
):
    return await service.crear(datos)

# ✅ CORREGIDO: Agregado require_role
@router.get("/", response_model=List[EquipoResponse])
async def listar_equipos(
    service: EquipoService = Depends(get_equipo_service)
):
    return await service.listar()

# ✅ CORREGIDO: Agregado require_role
@router.get("/{equipo_id}", response_model=EquipoResponse)
async def obtener_equipo(
    equipo_id: UUID,
    service: EquipoService = Depends(get_equipo_service)
):
    equipo = await service.obtener(equipo_id)
    if not equipo:
        raise HTTPException(status_code=404, detail="Equipo no encontrado")
    return equipo

@router.put("/{equipo_id}", response_model=EquipoResponse)
async def actualizar_equipo(
    equipo_id: UUID,
    datos: EquipoUpdate,
    current_user: User = Depends(require_role(RoleEnum.ADMIN, RoleEnum.ORGANIZER)),
    service: EquipoService = Depends(get_equipo_service)
):
    equipo = await service.actualizar(equipo_id, datos)
    if not equipo:
        raise HTTPException(status_code=404, detail="Equipo no encontrado")
    return equipo

@router.delete("/{equipo_id}", status_code=status.HTTP_204_NO_CONTENT)
async def eliminar_equipo(
    equipo_id: UUID,
    current_user: User = Depends(require_role(RoleEnum.ADMIN, RoleEnum.ORGANIZER)),
    service: EquipoService = Depends(get_equipo_service)
):
    eliminado = await service.eliminar(equipo_id)
    if not eliminado:
        raise HTTPException(status_code=404, detail="Equipo no encontrado")