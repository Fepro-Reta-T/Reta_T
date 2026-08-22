from uuid import UUID
from typing import Optional, List
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload
from app.models.game import Partido
from app.schemas.partido import PartidoCreate, PartidoUpdate

class PartidoRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def crear(self, datos: PartidoCreate) -> Partido:
        partido = Partido(**datos.model_dump())
        self.db.add(partido)
        await self.db.commit()
        await self.db.refresh(partido)
        return partido

    async def crear_multiples(self, partidos_data: List[PartidoCreate]) -> List[Partido]:
        partidos = [Partido(**p.model_dump()) for p in partidos_data]
        self.db.add_all(partidos)
        await self.db.commit()
        for p in partidos:
            await self.db.refresh(p)
        return partidos

    async def obtener_por_id(self, partido_id: UUID) -> Optional[Partido]:
        result = await self.db.execute(
            select(Partido)
            .where(Partido.id == partido_id)
            .options(
                selectinload(Partido.torneo),
                selectinload(Partido.equipo_local),
                selectinload(Partido.equipo_visitante),
                selectinload(Partido.cancha),
                selectinload(Partido.match_manager)
            )
        )
        return result.scalar_one_or_none()

    async def listar_por_torneo(self, torneo_id: UUID) -> List[Partido]:
        result = await self.db.execute(
            select(Partido)
            .where(Partido.torneo_id == torneo_id)
            .options(
                selectinload(Partido.equipo_local),
                selectinload(Partido.equipo_visitante),
                selectinload(Partido.cancha)
            )
        )
        return list(result.scalars().all())

    async def actualizar(self, partido_id: UUID, datos: PartidoUpdate) -> Optional[Partido]:
        partido = await self.obtener_por_id(partido_id)
        if not partido:
            return None
        update_data = datos.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(partido, key, value)
        await self.db.commit()
        await self.db.refresh(partido)
        return partido

    async def eliminar(self, partido_id: UUID) -> bool:
        partido = await self.obtener_por_id(partido_id)
        if not partido:
            return False
        await self.db.delete(partido)
        await self.db.commit()
        return True
