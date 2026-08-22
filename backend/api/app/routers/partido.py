from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from uuid import UUID
from typing import List
from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.user import User, RoleEnum
from app.schemas.partido import PartidoCreate, PartidoUpdate, PartidoResponse, AsignarEncargadoRequest
from app.services.partido_service import PartidoService
from app.services.torneo_service import TorneoService
from app.repositories.partido_repository import PartidoRepository
from app.repositories.torneo_repository import TorneoRepository

router = APIRouter(tags=["Partidos"])

def get_partido_service(db: AsyncSession = Depends(get_db)) -> PartidoService:
    return PartidoService(PartidoRepository(db))

def get_torneo_service(db: AsyncSession = Depends(get_db)) -> TorneoService:
    return TorneoService(TorneoRepository(db))

@router.post("/partidos/", response_model=PartidoResponse, status_code=status.HTTP_201_CREATED)
async def crear_partido(
    datos: PartidoCreate,
    current_user: User = Depends(get_current_user),
    service: PartidoService = Depends(get_partido_service),
    torneo_service: TorneoService = Depends(get_torneo_service)
):
    torneo = await torneo_service.obtener(datos.torneo_id)
    if not torneo:
        raise HTTPException(status_code=404, detail="Torneo no encontrado")
    if current_user.role != RoleEnum.ADMIN and torneo.organizer_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tienes permiso para programar partidos en este torneo"
        )
    try:
        return await service.crear(datos)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc))

@router.get("/partidos/{partido_id}", response_model=PartidoResponse)
async def obtener_partido(
    partido_id: UUID,
    service: PartidoService = Depends(get_partido_service)
):
    partido = await service.obtener(partido_id)
    if not partido:
        raise HTTPException(status_code=404, detail="Partido no encontrado")
    return partido

@router.get("/torneos/{torneo_id}/partidos", response_model=List[PartidoResponse])
async def listar_partidos_por_torneo(
    torneo_id: UUID,
    service: PartidoService = Depends(get_partido_service)
):
    return await service.listar_por_torneo(torneo_id)

@router.put("/partidos/{partido_id}", response_model=PartidoResponse)
async def actualizar_partido(
    partido_id: UUID,
    datos: PartidoUpdate,
    current_user: User = Depends(get_current_user),
    service: PartidoService = Depends(get_partido_service),
    torneo_service: TorneoService = Depends(get_torneo_service)
):
    partido = await service.obtener(partido_id)
    if not partido:
        raise HTTPException(status_code=404, detail="Partido no encontrado")

    torneo = await torneo_service.obtener(partido.torneo_id)
    if current_user.role != RoleEnum.ADMIN and (not torneo or torneo.organizer_id != current_user.id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tienes permiso para modificar este partido"
        )
    return await service.actualizar(partido_id, datos)

@router.delete("/partidos/{partido_id}", status_code=status.HTTP_204_NO_CONTENT)
async def eliminar_partido(
    partido_id: UUID,
    current_user: User = Depends(get_current_user),
    service: PartidoService = Depends(get_partido_service),
    torneo_service: TorneoService = Depends(get_torneo_service)
):
    partido = await service.obtener(partido_id)
    if not partido:
        raise HTTPException(status_code=404, detail="Partido no encontrado")

    torneo = await torneo_service.obtener(partido.torneo_id)
    if current_user.role != RoleEnum.ADMIN and (not torneo or torneo.organizer_id != current_user.id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tienes permiso para eliminar este partido"
        )
    await service.eliminar(partido_id)

@router.patch("/partidos/{partido_id}/encargado", response_model=PartidoResponse)
async def asignar_encargado(
    partido_id: UUID,
    datos: AsignarEncargadoRequest,
    current_user: User = Depends(get_current_user),
    service: PartidoService = Depends(get_partido_service),
    torneo_service: TorneoService = Depends(get_torneo_service)
):
    partido = await service.obtener(partido_id)
    if not partido:
        raise HTTPException(status_code=404, detail="Partido no encontrado")

    torneo = await torneo_service.obtener(partido.torneo_id)
    if current_user.role != RoleEnum.ADMIN and (not torneo or torneo.organizer_id != current_user.id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tienes permiso para asignar encargado a este partido"
        )
    try:
        return await service.asignar_encargado(partido_id, datos.match_manager_id)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc))

@router.post("/torneos/{torneo_id}/generar_fixture", response_model=List[PartidoResponse], status_code=status.HTTP_201_CREATED)
async def generar_fixture_torneo(
    torneo_id: UUID,
    current_user: User = Depends(get_current_user),
    service: PartidoService = Depends(get_partido_service),
    torneo_service: TorneoService = Depends(get_torneo_service)
):
    torneo = await torneo_service.obtener(torneo_id)
    if not torneo:
        raise HTTPException(status_code=404, detail="Torneo no encontrado")
    if current_user.role != RoleEnum.ADMIN and torneo.organizer_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tienes permiso para generar el fixture de este torneo"
        )
    try:
        return await service.generar_fixture(torneo_id)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc))
