# backend/api/app/repositories/inscripcion_repository.py
from uuid import UUID
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.organization import Equipo, Tournament
from app.schemas.inscripcion import InscripcionCreate


class InscripcionRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def inscribir(self, torneo_id: UUID, equipo_id: UUID) -> bool:
        # Verificar que el torneo existe
        result = await self.db.execute(
            select(Tournament).where(Tournament.id == torneo_id)
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
        )
        torneo = result.scalar_one_or_none()
        if not torneo:
            return []
        return torneo.equipos

    async def retirar(self, torneo_id: UUID, equipo_id: UUID) -> bool:
        result = await self.db.execute(
            select(Tournament).where(Tournament.id == torneo_id)
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