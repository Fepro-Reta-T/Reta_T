# backend/api/app/repositories/organization/torneo_repository.py
from uuid import UUID
from typing import Optional, List
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.organization import Tournament, Equipo
from app.schemas.torneo import TorneoCreate, TorneoUpdate


class TorneoRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def crear(self, datos: TorneoCreate, organizer_id: UUID) -> Tournament:
        torneo = Tournament(**datos.model_dump(), organizer_id=organizer_id)
        self.db.add(torneo)
        await self.db.commit()
        await self.db.refresh(torneo)
        return torneo

    async def listar(self) -> List[Tournament]:
        resultado = await self.db.execute(
            select(Tournament).options(
                selectinload(Tournament.sport),
                selectinload(Tournament.equipos)
            )
        )
        return list(resultado.scalars().all())

    async def obtener(self, torneo_id: UUID) -> Optional[Tournament]:
        resultado = await self.db.execute(
            select(Tournament)
            .where(Tournament.id == torneo_id)
            .options(
                selectinload(Tournament.sport),
                selectinload(Tournament.equipos)
            )
        )
        return resultado.scalar_one_or_none()

    async def actualizar(self, torneo_id: UUID, datos: TorneoUpdate) -> Optional[Tournament]:
        torneo = await self.obtener(torneo_id)
        if not torneo:
            return None
        update_data = datos.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(torneo, key, value)
        await self.db.commit()
        await self.db.refresh(torneo)
        return torneo

    async def eliminar(self, torneo_id: UUID) -> bool:
        torneo = await self.obtener(torneo_id)
        if not torneo:
            return False
        await self.db.delete(torneo)
        await self.db.commit()
        return True