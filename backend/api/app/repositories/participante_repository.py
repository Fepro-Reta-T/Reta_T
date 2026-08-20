# backend/api/app/repositories/participante_repository.py
from uuid import UUID
from typing import Optional, List
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.game import Participante
from app.schemas.participante import ParticipanteCreate, ParticipanteUpdate


class ParticipanteRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def crear(self, equipo_id: UUID, datos: ParticipanteCreate) -> Participante:
        participante = Participante(
            **datos.model_dump(),
            equipo_id=equipo_id
        )
        self.db.add(participante)
        await self.db.commit()
        await self.db.refresh(participante)
        return participante

    async def listar_por_equipo(self, equipo_id: UUID) -> List[Participante]:
        resultado = await self.db.execute(
            select(Participante).where(Participante.equipo_id == equipo_id)
        )
        return list(resultado.scalars().all())

    async def obtener_por_id(self, participante_id: UUID) -> Optional[Participante]:
        resultado = await self.db.execute(
            select(Participante).where(Participante.id == participante_id)
        )
        return resultado.scalar_one_or_none()

    async def actualizar(self, participante_id: UUID, datos: ParticipanteUpdate) -> Optional[Participante]:
        participante = await self.obtener_por_id(participante_id)
        if not participante:
            return None
        update_data = datos.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(participante, key, value)
        await self.db.commit()
        await self.db.refresh(participante)
        return participante

    async def eliminar(self, participante_id: UUID) -> bool:
        participante = await self.obtener_por_id(participante_id)
        if not participante:
            return False
        await self.db.delete(participante)
        await self.db.commit()
        return True
