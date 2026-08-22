# backend/api/app/repositories/organization/equipo_repository.py
from uuid import UUID
from typing import Optional, List
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.organization import Equipo
from app.schemas.equipo import EquipoCreate, EquipoUpdate


class EquipoRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def crear(self, datos: EquipoCreate, creator_id: Optional[UUID] = None) -> Equipo:
        equipo = Equipo(**datos.model_dump(), creator_id=creator_id)
        self.db.add(equipo)
        await self.db.commit()
        await self.db.refresh(equipo)
        return equipo

    async def listar(self) -> List[Equipo]:
        resultado = await self.db.execute(select(Equipo))
        return list(resultado.scalars().all())

    async def obtener_por_id(self, equipo_id: UUID) -> Optional[Equipo]:
        resultado = await self.db.execute(
            select(Equipo).where(Equipo.id == equipo_id)
        )
        return resultado.scalar_one_or_none()

    async def actualizar(self, equipo_id: UUID, datos: EquipoUpdate) -> Optional[Equipo]:
        equipo = await self.obtener_por_id(equipo_id)
        if not equipo:
            return None
        update_data = datos.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(equipo, key, value)
        await self.db.commit()
        await self.db.refresh(equipo)
        return equipo

    async def eliminar(self, equipo_id: UUID) -> bool:
        equipo = await self.obtener_por_id(equipo_id)
        if not equipo:
            return False
        await self.db.delete(equipo)
        await self.db.commit()
        return True

    async def transferir(self, equipo_id: UUID, nuevo_creator_id: UUID) -> Optional[Equipo]:
        equipo = await self.obtener_por_id(equipo_id)
        if not equipo:
            return None
        equipo.creator_id = nuevo_creator_id
        await self.db.commit()
        await self.db.refresh(equipo)
        return equipo