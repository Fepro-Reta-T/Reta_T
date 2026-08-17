# backend/api/app/routers/cancha.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from uuid import UUID
from typing import List
from app.core.database import get_db
from app.core.deps import require_role
from app.models.user import User, RoleEnum
from app.schemas.cancha import CanchaCreate, CanchaUpdate, CanchaResponse
from app.services.cancha_service import CanchaService
from app.repositories.cancha_repository import CanchaRepository

router = APIRouter(prefix="/canchas", tags=["Canchas"])

def get_cancha_service(db: AsyncSession = Depends(get_db)) -> CanchaService:
    return CanchaService(CanchaRepository(db))

@router.post("/", response_model=CanchaResponse, status_code=status.HTTP_201_CREATED)
async def crear_cancha(
    datos: CanchaCreate,
    current_user: User = Depends(
        require_role(RoleEnum.ADMIN, RoleEnum.ORGANIZER) 
    ),
    service: CanchaService = Depends(get_cancha_service)
):
    return await service.crear_cancha(datos, current_user.id)

@router.get("/", response_model=List[CanchaResponse])
async def listar_canchas(
    service: CanchaService = Depends(get_cancha_service)
):
    return await service.listar_canchas()

@router.get("/{cancha_id}", response_model=CanchaResponse)
async def obtener_cancha(
    cancha_id: UUID,
    service: CanchaService = Depends(get_cancha_service)
):
    cancha = await service.obtener_cancha(cancha_id)
    if not cancha:
        raise HTTPException(status_code=404, detail="Cancha no encontrada")
    return cancha

@router.put("/{cancha_id}", response_model=CanchaResponse)
async def actualizar_cancha(
    cancha_id: UUID,
    datos: CanchaUpdate,
    current_user: User = Depends(require_role(RoleEnum.ADMIN, RoleEnum.ORGANIZER)),
    service: CanchaService = Depends(get_cancha_service)
):
    cancha = await service.actualizar_cancha(cancha_id, datos)
    if not cancha:
        raise HTTPException(status_code=404, detail="Cancha no encontrada")
    return cancha

@router.delete("/{cancha_id}", status_code=status.HTTP_204_NO_CONTENT)
async def eliminar_cancha(
    cancha_id: UUID,
    current_user: User = Depends(require_role(RoleEnum.ADMIN, RoleEnum.ORGANIZER)),
    service: CanchaService = Depends(get_cancha_service)
):
    eliminado = await service.eliminar_cancha(cancha_id)
    if not eliminado:
        raise HTTPException(status_code=404, detail="Cancha no encontrada")