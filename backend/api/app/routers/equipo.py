# backend/api/app/routers/equipo.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from uuid import UUID
from typing import List
from app.core.database import get_db
from app.core.deps import get_current_user
from app.models.user import User, RoleEnum
from app.schemas.equipo import EquipoCreate, EquipoUpdate, EquipoResponse, EquipoTransferirRequest
from app.repositories.user import get_user_by_email
from app.schemas.participante import ParticipanteCreate, ParticipanteUpdate, ParticipanteResponse
from app.services.equipo_service import EquipoService
from app.repositories.equipo_repository import EquipoRepository

router = APIRouter(prefix="/equipos", tags=["Equipos"])

def get_equipo_service(db: AsyncSession = Depends(get_db)) -> EquipoService:
    return EquipoService(EquipoRepository(db))

@router.post("/", response_model=EquipoResponse, status_code=status.HTTP_201_CREATED)
async def crear_equipo(
    datos: EquipoCreate,
    current_user: User = Depends(get_current_user),
    service: EquipoService = Depends(get_equipo_service)
):
    try:
        return await service.crear(datos, creator_id=current_user.id)
    except ValueError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc))

@router.get("/", response_model=List[EquipoResponse])
async def listar_equipos(
    service: EquipoService = Depends(get_equipo_service)
):
    return await service.listar()

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
    current_user: User = Depends(get_current_user),
    service: EquipoService = Depends(get_equipo_service)
):
    equipo = await service.obtener(equipo_id)
    if not equipo:
        raise HTTPException(status_code=404, detail="Equipo no encontrado")
    if current_user.role != RoleEnum.ADMIN and equipo.creator_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tienes permiso para modificar este equipo"
        )
    return await service.actualizar(equipo_id, datos)

@router.delete("/{equipo_id}", status_code=status.HTTP_204_NO_CONTENT)
async def eliminar_equipo(
    equipo_id: UUID,
    current_user: User = Depends(get_current_user),
    service: EquipoService = Depends(get_equipo_service)
):
    equipo = await service.obtener(equipo_id)
    if not equipo:
        raise HTTPException(status_code=404, detail="Equipo no encontrado")
    if current_user.role != RoleEnum.ADMIN and equipo.creator_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tienes permiso para eliminar este equipo"
        )
    await service.eliminar(equipo_id)

@router.patch("/{equipo_id}/transferir", response_model=EquipoResponse)
async def transferir_equipo(
    equipo_id: UUID,
    datos: EquipoTransferirRequest,
    current_user: User = Depends(get_current_user),
    service: EquipoService = Depends(get_equipo_service),
    db: AsyncSession = Depends(get_db)
):
    equipo = await service.obtener(equipo_id)
    if not equipo:
        raise HTTPException(status_code=404, detail="Equipo no encontrado")
    if current_user.role != RoleEnum.ADMIN and equipo.creator_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tienes permiso para transferir este equipo"
        )
    
    nuevo_dueño = await get_user_by_email(db, datos.email)
    if not nuevo_dueño:
        raise HTTPException(status_code=404, detail=f"No se encontró un usuario con el correo {datos.email}")
        
    equipo_transferido = await service.transferir(equipo_id, nuevo_dueño.id)
    return equipo_transferido


# Endpoints de gestión de jugadores (Participantes)
@router.post("/{equipo_id}/jugadores", response_model=ParticipanteResponse, status_code=status.HTTP_201_CREATED)
async def agregar_jugador(
    equipo_id: UUID,
    datos: ParticipanteCreate,
    current_user: User = Depends(get_current_user),
    service: EquipoService = Depends(get_equipo_service)
):
    equipo = await service.obtener(equipo_id)
    if not equipo:
        raise HTTPException(status_code=404, detail="Equipo no encontrado")
    if current_user.role != RoleEnum.ADMIN and equipo.creator_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tienes permiso para agregar jugadores a este equipo"
        )
    return await service.agregar_participante(equipo_id, datos)

@router.get("/{equipo_id}/jugadores", response_model=List[ParticipanteResponse])
async def listar_jugadores(
    equipo_id: UUID,
    service: EquipoService = Depends(get_equipo_service)
):
    equipo = await service.obtener(equipo_id)
    if not equipo:
        raise HTTPException(status_code=404, detail="Equipo no encontrado")
    return await service.listar_participantes(equipo_id)

@router.put("/{equipo_id}/jugadores/{jugador_id}", response_model=ParticipanteResponse)
async def actualizar_jugador(
    equipo_id: UUID,
    jugador_id: UUID,
    datos: ParticipanteUpdate,
    current_user: User = Depends(get_current_user),
    service: EquipoService = Depends(get_equipo_service)
):
    equipo = await service.obtener(equipo_id)
    if not equipo:
        raise HTTPException(status_code=404, detail="Equipo no encontrado")
    if current_user.role != RoleEnum.ADMIN and equipo.creator_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tienes permiso para modificar jugadores de este equipo"
        )
    jugador = await service.actualizar_participante(jugador_id, datos)
    if not jugador or jugador.equipo_id != equipo_id:
        raise HTTPException(status_code=404, detail="Jugador no encontrado en este equipo")
    return jugador

@router.delete("/{equipo_id}/jugadores/{jugador_id}", status_code=status.HTTP_204_NO_CONTENT)
async def eliminar_jugador(
    equipo_id: UUID,
    jugador_id: UUID,
    current_user: User = Depends(get_current_user),
    service: EquipoService = Depends(get_equipo_service)
):
    equipo = await service.obtener(equipo_id)
    if not equipo:
        raise HTTPException(status_code=404, detail="Equipo no encontrado")
    if current_user.role != RoleEnum.ADMIN and equipo.creator_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tienes permiso para eliminar jugadores de este equipo"
        )
    jugador = await service.obtener_participante(jugador_id)
    if not jugador or jugador.equipo_id != equipo_id:
        raise HTTPException(status_code=404, detail="Jugador no encontrado en este equipo")
    await service.eliminar_participante(jugador_id)