# backend/api/app/repositories/inscripcion_repository.py
from uuid import UUID
from typing import Optional
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from datetime import datetime, timezone
from app.models.organization import Equipo, Tournament, SolicitudInscripcion, inscripcion_table


class InscripcionRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    def _obtener_max_equipos(self, torneo: Tournament) -> Optional[int]:
        """Obtiene el cupo máximo de equipos dando prioridad absoluta a torneo.max_equipos."""
        # 1. Columna directa max_equipos de la base de datos (prioridad 1)
        if torneo.max_equipos is not None and torneo.max_equipos > 0:
            return torneo.max_equipos

        formato = (torneo.datos_adicionales or {}).get("formato", {})
        
        # 2. Si el formato especifica num_equipos (slider del wizard)
        num_eq = formato.get("num_equipos")
        if num_eq is not None:
            try:
                val = int(num_eq)
                if val > 0:
                    return val
            except (ValueError, TypeError):
                pass

        # 3. Si es formato por grupos, el cupo total es num_grupos * equipos_por_grupo
        if formato.get("tipo_formato") == "grupos_eliminacion":
            ng = formato.get("num_grupos", 4)
            eg = formato.get("equipos_por_grupo", 4)
            try:
                return int(ng) * int(eg)
            except (ValueError, TypeError):
                pass
            
        return None

    async def _contar_equipos_inscritos(self, torneo_id: UUID) -> int:
        """Consulta directa en SQL para contar la cantidad real de equipos inscritos sin depender de memoria."""
        stmt = select(func.count()).select_from(inscripcion_table).where(inscripcion_table.c.torneo_id == torneo_id)
        result = await self.db.execute(stmt)
        return result.scalar_one() or 0

    async def inscribir(self, torneo_id: UUID, equipo_id: UUID) -> tuple[bool, str]:
        # Verificar que el torneo existe con sus equipos cargados
        result = await self.db.execute(
            select(Tournament)
            .where(Tournament.id == torneo_id)
            .options(selectinload(Tournament.equipos))
        )
        torneo = result.scalar_one_or_none()
        if not torneo:
            return False, "Torneo no encontrado"
        
        # Verificar que el equipo existe
        result = await self.db.execute(
            select(Equipo).where(Equipo.id == equipo_id)
        )
        equipo = result.scalar_one_or_none()
        if not equipo:
            return False, "Equipo no encontrado"
        
        # Verificar que el deporte coincida (si ambos lo tienen definido)
        equipo_sport = equipo.sport_id or (equipo.datos_adicionales or {}).get("sport_id")
        if equipo_sport and torneo.sport_id:
            if str(equipo_sport) != str(torneo.sport_id):
                return False, "El deporte del equipo no coincide con el del torneo"

        # Verificar que la rama (categoría) coincida (Varonil, Femenil, Mixto)
        if torneo.categoria:
            equipo_categoria = (equipo.datos_adicionales or {}).get("tipo_equipo") or (equipo.datos_adicionales or {}).get("categoria")
            if not equipo_categoria or str(equipo_categoria).lower() != str(torneo.categoria).lower():
                return False, "La categoría del equipo no coincide con el torneo"

        # Verificar límites de inscripción con recuento real en BD
        max_equipos = self._obtener_max_equipos(torneo)
        num_inscritos = await self._contar_equipos_inscritos(torneo_id)
        if max_equipos is not None and num_inscritos >= max_equipos:
            return False, f"El torneo ya alcanzó el cupo máximo de {max_equipos} equipos inscritos."
            
        if torneo.fecha_cierre_inscripcion is not None and datetime.now(timezone.utc) > torneo.fecha_cierre_inscripcion:
            return False, "Las inscripciones ya cerraron"

        # Verificar que no esté ya inscrito
        if equipo in torneo.equipos:
            return False, "El equipo ya está inscrito en este torneo"
        
        torneo.equipos.append(equipo)
        await self.db.commit()
        return True, "Equipo inscrito correctamente"

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
            .options(selectinload(Tournament.equipos), selectinload(Tournament.partidos))
        )
        torneo = result.scalar_one_or_none()
        if not torneo:
            return False
        
        # Bloquear eliminación si el torneo ya tiene fixture generado
        if len(torneo.partidos) > 0:
            return False
        
        equipo = next((e for e in torneo.equipos if str(e.id) == str(equipo_id)), None)
        if not equipo:
            return False
        
        torneo.equipos.remove(equipo)
        await self.db.commit()
        return True

    async def crear_solicitud(self, torneo_id: UUID, equipo_id: UUID) -> tuple[bool, str]:
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
            
        if torneo.fecha_cierre_inscripcion is not None and datetime.now(timezone.utc) > torneo.fecha_cierre_inscripcion:
            return False, "Las inscripciones ya cerraron"

        max_equipos = self._obtener_max_equipos(torneo)
        num_inscritos = await self._contar_equipos_inscritos(torneo_id)
        if max_equipos is not None and num_inscritos >= max_equipos:
            return False, f"El torneo ya alcanzó el cupo máximo de {max_equipos} equipos inscritos."

        if equipo in torneo.equipos:
            return False, "El equipo ya está inscrito"
            
        # Verificar si ya existe solicitud pendiente
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
            # Intentar inscribir (que valida el cupo real SQL de forma atómica)
            success, msg = await self.inscribir(torneo_id, equipo_id)
            if not success:
                return False, msg
            solicitud.estado = "APROBADA"
        else:
            solicitud.estado = "RECHAZADA"
            
        await self.db.commit()
        return True, "Solicitud procesada correctamente"