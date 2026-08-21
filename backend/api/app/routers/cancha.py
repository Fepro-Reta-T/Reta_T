# backend/api/app/routers/cancha.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from uuid import UUID
from typing import List
from app.core.database import get_db
from app.core.deps import get_current_user
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
    current_user: User = Depends(get_current_user),
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
    current_user: User = Depends(get_current_user),
    service: CanchaService = Depends(get_cancha_service)
):
    cancha = await service.obtener_cancha(cancha_id)
    if not cancha:
        raise HTTPException(status_code=404, detail="Cancha no encontrada")
    if current_user.role != RoleEnum.ADMIN and cancha.propietario_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tienes permiso para modificar esta cancha"
        )
    return await service.actualizar_cancha(cancha_id, datos)

@router.delete("/{cancha_id}", status_code=status.HTTP_204_NO_CONTENT)
async def eliminar_cancha(
    cancha_id: UUID,
    current_user: User = Depends(get_current_user),
    service: CanchaService = Depends(get_cancha_service)
):
    cancha = await service.obtener_cancha(cancha_id)
    if not cancha:
        raise HTTPException(status_code=404, detail="Cancha no encontrada")
    if current_user.role != RoleEnum.ADMIN and cancha.propietario_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tienes permiso para eliminar esta cancha"
        )
    await service.eliminar_cancha(cancha_id)