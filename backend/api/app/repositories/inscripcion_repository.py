# backend/api/app/repositories/inscripcion_repository.py
from uuid import UUID
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from datetime import datetime, timezone
from app.models.organization import Equipo, Tournament, SolicitudInscripcion
from app.schemas.inscripcion import InscripcionCreate


class InscripcionRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def inscribir(self, torneo_id: UUID, equipo_id: UUID) -> bool:
        # Verificar que el torneo existe con sus equipos cargados
        result = await self.db.execute(
            select(Tournament)
            .where(Tournament.id == torneo_id)
            .options(selectinload(Tournament.equipos))
        )
        torneo = result.scalar_one_or_none()
        if not torneo:
            return False
        
        # Verificar que el equipo existe
        result = await self.db.execute(
            select(Equipo).where(Equipo.id == equipo_id)
        )
        equipo = result.scalar_one_or_none()
        if not equipo:
            return False
        
        # Verificar que el deporte coincida (si ambos lo tienen definido)
        equipo_sport = equipo.sport_id or (equipo.datos_adicionales or {}).get("sport_id")
        if equipo_sport and torneo.sport_id:
            if str(equipo_sport) != str(torneo.sport_id):
                return False

        # Verificar que la rama (categoría) coincida (Varonil, Femenil, Mixto)
        if torneo.categoria:
            equipo_categoria = (equipo.datos_adicionales or {}).get("tipo_equipo") or (equipo.datos_adicionales or {}).get("categoria")
            if not equipo_categoria or str(equipo_categoria).lower() != str(torneo.categoria).lower():
                return False

        # Verificar límites de inscripción
        if torneo.max_equipos is not None and len(torneo.equipos) >= torneo.max_equipos:
            return False
            
        if torneo.fecha_cierre_inscripcion is not None and datetime.now(timezone.utc) > torneo.fecha_cierre_inscripcion:
            return False

        # Verificar que no esté ya inscrito
        if equipo in torneo.equipos:
            return False
        
        torneo.equipos.append(equipo)
        await self.db.commit()
        return True

    async def listar_equipos_inscritos(self, torneo_id: UUID) -> list[Equipo]:
        result = await self.db.execute(
            select(Tournament)
            .where(Tournament.id == torneo_id)
            .options(selectinload(Tournament.equipos))
        )
        torneo = result.scalar_one_or_none()
        if not torneo:
            return []
        return torneo.equipos

    async def retirar(self, torneo_id: UUID, equipo_id: UUID) -> bool:
        result = await self.db.execute(
            select(Tournament)
            .where(Tournament.id == torneo_id)
            .options(selectinload(Tournament.equipos))
        )
        torneo = result.scalar_one_or_none()
        if not torneo:
            return False
        
        equipo = next((e for e in torneo.equipos if str(e.id) == str(equipo_id)), None)
        if not equipo:
            return False
        
        torneo.equipos.remove(equipo)
        await self.db.commit()
        return True

    async def crear_solicitud(self, torneo_id: UUID, equipo_id: UUID) -> tuple[bool, str]:
        # Validar reglas de negocio usando la misma lógica que inscribir
        result = await self.db.execute(
            select(Tournament).where(Tournament.id == torneo_id).options(selectinload(Tournament.equipos))
        )
        torneo = result.scalar_one_or_none()
        if not torneo:
            return False, "Torneo no encontrado"
            
        result = await self.db.execute(select(Equipo).where(Equipo.id == equipo_id))
        equipo = result.scalar_one_or_none()
        if not equipo:
            return False, "Equipo no encontrado"
            
        equipo_sport = equipo.sport_id or (equipo.datos_adicionales or {}).get("sport_id")
        if equipo_sport and torneo.sport_id and str(equipo_sport) != str(torneo.sport_id):
            return False, "El deporte del equipo no coincide con el del torneo"
            
        if torneo.categoria:
            equipo_categoria = (equipo.datos_adicionales or {}).get("tipo_equipo") or (equipo.datos_adicionales or {}).get("categoria")
            if not equipo_categoria or str(equipo_categoria).lower() != str(torneo.categoria).lower():
                return False, "La categoría del equipo no coincide con el torneo"
                
        if torneo.max_equipos is not None and len(torneo.equipos) >= torneo.max_equipos:
            return False, "Cupo máximo de equipos alcanzado"
            
        if torneo.fecha_cierre_inscripcion is not None and datetime.now(timezone.utc) > torneo.fecha_cierre_inscripcion:
            return False, "Las inscripciones ya cerraron"
            
        if equipo in torneo.equipos:
            return False, "El equipo ya está inscrito"
            
        # Verificar si ya existe solicitud
        result = await self.db.execute(
            select(SolicitudInscripcion)
            .where(SolicitudInscripcion.torneo_id == torneo_id)
            .where(SolicitudInscripcion.equipo_id == equipo_id)
            .where(SolicitudInscripcion.estado == "PENDIENTE")
        )
        if result.scalar_one_or_none():
            return False, "Ya existe una solicitud pendiente para este equipo"

        nueva_solicitud = SolicitudInscripcion(torneo_id=torneo_id, equipo_id=equipo_id, estado="PENDIENTE")
        self.db.add(nueva_solicitud)
        await self.db.commit()
        await self.db.refresh(nueva_solicitud)
        return True, "Solicitud enviada correctamente"

    async def listar_solicitudes(self, torneo_id: UUID) -> list[SolicitudInscripcion]:
        result = await self.db.execute(
            select(SolicitudInscripcion)
            .where(SolicitudInscripcion.torneo_id == torneo_id)
            .where(SolicitudInscripcion.estado == "PENDIENTE")
            .options(selectinload(SolicitudInscripcion.equipo))
        )
        return list(result.scalars().all())

    async def procesar_solicitud(self, torneo_id: UUID, equipo_id: UUID, accion: str) -> tuple[bool, str]:
        if accion not in ["ACEPTAR", "RECHAZAR"]:
            return False, "Acción inválida"
            
        result = await self.db.execute(
            select(SolicitudInscripcion)
            .where(SolicitudInscripcion.torneo_id == torneo_id)
            .where(SolicitudInscripcion.equipo_id == equipo_id)
            .where(SolicitudInscripcion.estado == "PENDIENTE")
        )
        solicitud = result.scalar_one_or_none()
        if not solicitud:
            return False, "No se encontró una solicitud pendiente para este equipo"
            
        if accion == "ACEPTAR":
            # Intentar inscribir
            success = await self.inscribir(torneo_id, equipo_id)
            if not success:
                return False, "No se pudo inscribir (el cupo puede haberse llenado o hubo otro error)"
            solicitud.estado = "APROBADA"
        else:
            solicitud.estado = "RECHAZADA"
            
        await self.db.commit()
        return True, "Solicitud procesada correctamente"