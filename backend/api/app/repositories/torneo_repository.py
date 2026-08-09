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

    async def inscribir_equipo(self, torneo_id: UUID, equipo_id: UUID) -> bool:
        torneo = await self.obtener(torneo_id)
        if not torneo:
            return False
        
        result = await self.db.execute(
            select(Equipo).where(Equipo.id == equipo_id)
        )
        equipo = result.scalar_one_or_none()
        if not equipo:
            return False
        
        if equipo in torneo.equipos:
            return False
        
        torneo.equipos.append(equipo)
        await self.db.commit()
        return True

    async def retirar_equipo(self, torneo_id: UUID, equipo_id: UUID) -> bool:
        torneo = await self.obtener(torneo_id)
        if not torneo:
            return False
        
        equipo = next((e for e in torneo.equipos if str(e.id) == str(equipo_id)), None)
        if not equipo:
            return False
        
        torneo.equipos.remove(equipo)
        await self.db.commit()
        return True

    async def listar_equipos_inscritos(self, torneo_id: UUID) -> List[Equipo]:
        torneo = await self.obtener(torneo_id)
        if not torneo:
            return []
        return torneo.equipos