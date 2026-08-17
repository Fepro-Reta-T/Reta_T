# backend/api/app/routers/torneo.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from uuid import UUID
from typing import List
from app.core.database import get_db
from app.core.deps import require_role
from app.models.user import User, RoleEnum
from app.schemas.torneo import TorneoCreate, TorneoUpdate, TorneoResponse
from app.schemas.equipo import EquipoResponse
from app.services.torneo_service import TorneoService
from app.repositories.torneo_repository import TorneoRepository

router = APIRouter(prefix="/torneos", tags=["Torneos"])

def get_torneo_service(db: AsyncSession = Depends(get_db)) -> TorneoService:
    return TorneoService(TorneoRepository(db))

@router.post("/", response_model=TorneoResponse, status_code=status.HTTP_201_CREATED)
async def crear_torneo(
    datos: TorneoCreate,
    current_user: User = Depends(require_role(RoleEnum.ADMIN, RoleEnum.ORGANIZER)),
    service: TorneoService = Depends(get_torneo_service)
):
    return await service.crear(datos, current_user.id)

@router.get("/", response_model=List[TorneoResponse])
async def listar_torneos(
    service: TorneoService = Depends(get_torneo_service)
):
    return await service.listar()

# ✅ CORREGIDO: Nombre consistente
@router.get("/{torneo_id}", response_model=TorneoResponse)
async def obtener_torneo(
    torneo_id: UUID,
    service: TorneoService = Depends(get_torneo_service)
):
    torneo = await service.obtener(torneo_id)
    if not torneo:
        raise HTTPException(status_code=404, detail="Torneo no encontrado")
    return torneo

@router.put("/{torneo_id}", response_model=TorneoResponse)
async def actualizar_torneo(
    torneo_id: UUID,
    datos: TorneoUpdate,
    current_user: User = Depends(require_role(RoleEnum.ADMIN, RoleEnum.ORGANIZER)),
    service: TorneoService = Depends(get_torneo_service)
):
    torneo = await service.actualizar(torneo_id, datos)
    if not torneo:
        raise HTTPException(status_code=404, detail="Torneo no encontrado")
    return torneo

@router.delete("/{torneo_id}", status_code=status.HTTP_204_NO_CONTENT)
async def eliminar_torneo(
    torneo_id: UUID,
    current_user: User = Depends(require_role(RoleEnum.ADMIN, RoleEnum.ORGANIZER)),
    service: TorneoService = Depends(get_torneo_service)
):
    eliminado = await service.eliminar(torneo_id)
    if not eliminado:
        raise HTTPException(status_code=404, detail="Torneo no encontrado")

# ✅ AGREGADOS: Endpoints de inscripción
@router.post("/{torneo_id}/inscripciones", status_code=status.HTTP_201_CREATED)
async def inscribir_equipo(
    torneo_id: UUID,
    equipo_id: UUID,
    current_user: User = Depends(require_role(RoleEnum.ADMIN, RoleEnum.ORGANIZER)),
    service: TorneoService = Depends(get_torneo_service)
):
    resultado = await service.inscribir_equipo(torneo_id, equipo_id)
    if not resultado:
        raise HTTPException(
            status_code=400,
            detail="No se pudo inscribir el equipo"
        )
    return {"message": "Equipo inscrito correctamente"}

@router.get("/{torneo_id}/equipos", response_model=List[EquipoResponse])
async def listar_equipos_inscritos(
    torneo_id: UUID,
    service: TorneoService = Depends(get_torneo_service)
):
    equipos = await service.listar_equipos_inscritos(torneo_id)
    return equipos

@router.delete("/{torneo_id}/inscripciones/{equipo_id}", status_code=status.HTTP_204_NO_CONTENT)
async def retirar_equipo(
    torneo_id: UUID,
    equipo_id: UUID,
    current_user: User = Depends(require_role(RoleEnum.ADMIN, RoleEnum.ORGANIZER)),
    service: TorneoService = Depends(get_torneo_service)
):
    resultado = await service.retirar_equipo(torneo_id, equipo_id)
    if not resultado:
        raise HTTPException(
            status_code=400,
            detail="No se pudo retirar el equipo"
        )