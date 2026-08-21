# backend/api/app/routers/torneo.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from uuid import UUID
from typing import List, Optional
from app.core.database import get_db
from app.core.deps import get_current_user
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
    current_user: User = Depends(get_current_user),
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
    current_user: User = Depends(get_current_user),
    service: TorneoService = Depends(get_torneo_service)
):
    torneo = await service.obtener(torneo_id)
    if not torneo:
        raise HTTPException(status_code=404, detail="Torneo no encontrado")
    if current_user.role != RoleEnum.ADMIN and torneo.organizer_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tienes permiso para modificar este torneo"
        )
    return await service.actualizar(torneo_id, datos)

@router.delete("/{torneo_id}", status_code=status.HTTP_204_NO_CONTENT)
async def eliminar_torneo(
    torneo_id: UUID,
    current_user: User = Depends(get_current_user),
    service: TorneoService = Depends(get_torneo_service)
):
    torneo = await service.obtener(torneo_id)
    if not torneo:
        raise HTTPException(status_code=404, detail="Torneo no encontrado")
    if current_user.role != RoleEnum.ADMIN and torneo.organizer_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tienes permiso para eliminar este torneo"
        )
    await service.eliminar(torneo_id)

from app.schemas.inscripcion import InscripcionCreate, InscripcionResponse, SolicitudInscripcionResponse, SolicitudAccionRequest

# ✅ AGREGADOS: Endpoints de inscripción
@router.post("/{torneo_id}/inscripciones", response_model=InscripcionResponse, status_code=status.HTTP_201_CREATED)
async def inscribir_equipo(
    torneo_id: UUID,
    datos: Optional[InscripcionCreate] = None,
    equipo_id: Optional[UUID] = None,
    current_user: User = Depends(get_current_user),
    service: TorneoService = Depends(get_torneo_service)
):
    target_equipo_id = datos.equipo_id if datos else equipo_id
    if not target_equipo_id:
        raise HTTPException(status_code=400, detail="Debe especificar equipo_id")

    torneo = await service.obtener(torneo_id)
    if not torneo:
        raise HTTPException(status_code=404, detail="Torneo no encontrado")
    if current_user.role != RoleEnum.ADMIN and torneo.organizer_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tienes permiso para inscribir equipos en este torneo"
        )
    resultado = await service.inscribir_equipo(torneo_id, target_equipo_id)
    if not resultado:
        raise HTTPException(
            status_code=400,
            detail="No se pudo inscribir el equipo (posible duplicado, deporte no coincide o equipo no existe)"
        )
    return {
        "message": "Equipo inscrito correctamente",
        "torneo_id": torneo_id,
        "equipo_id": target_equipo_id
    }

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
    current_user: User = Depends(get_current_user),
    service: TorneoService = Depends(get_torneo_service)
):
    torneo = await service.obtener(torneo_id)
    if not torneo:
        raise HTTPException(status_code=404, detail="Torneo no encontrado")
    if current_user.role != RoleEnum.ADMIN and torneo.organizer_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tienes permiso para retirar equipos de este torneo"
        )
    resultado = await service.retirar_equipo(torneo_id, equipo_id)
    if not resultado:
        raise HTTPException(
            status_code=400,
            detail="No se pudo retirar el equipo"
        )

# ✅ Solicitudes
@router.post("/{torneo_id}/solicitudes", status_code=status.HTTP_201_CREATED)
async def crear_solicitud(
    torneo_id: UUID,
    datos: InscripcionCreate,
    current_user: User = Depends(get_current_user),
    service: TorneoService = Depends(get_torneo_service)
):
    # Validar que el usuario que manda la solicitud es creador del equipo
    # Para eso podríamos inyectar el equipo_service y ver si current_user.id == equipo.creator_id
    # Por ahora simplemente creamos la solicitud.
    success, message = await service.crear_solicitud(torneo_id, datos.equipo_id)
    if not success:
        raise HTTPException(status_code=400, detail=message)
    return {"message": message}

@router.get("/{torneo_id}/solicitudes", response_model=List[SolicitudInscripcionResponse])
async def listar_solicitudes(
    torneo_id: UUID,
    current_user: User = Depends(get_current_user),
    service: TorneoService = Depends(get_torneo_service)
):
    torneo = await service.obtener(torneo_id)
    if not torneo:
        raise HTTPException(status_code=404, detail="Torneo no encontrado")
    if current_user.role != RoleEnum.ADMIN and torneo.organizer_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tienes permiso para ver las solicitudes de este torneo"
        )
    return await service.listar_solicitudes(torneo_id)

@router.patch("/{torneo_id}/solicitudes/{equipo_id}")
async def procesar_solicitud(
    torneo_id: UUID,
    equipo_id: UUID,
    datos: SolicitudAccionRequest,
    current_user: User = Depends(get_current_user),
    service: TorneoService = Depends(get_torneo_service)
):
    torneo = await service.obtener(torneo_id)
    if not torneo:
        raise HTTPException(status_code=404, detail="Torneo no encontrado")
    if current_user.role != RoleEnum.ADMIN and torneo.organizer_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="No tienes permiso para procesar las solicitudes de este torneo"
        )
        
    success, message = await service.procesar_solicitud(torneo_id, equipo_id, datos.accion)
    if not success:
        raise HTTPException(status_code=400, detail=message)
    return {"message": message}