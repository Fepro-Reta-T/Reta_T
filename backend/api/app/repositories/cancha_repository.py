# backend/api/app/repositories/cancha_repository.py
from uuid import UUID
from typing import Optional, List
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.geo import Cancha
from app.schemas.cancha import CanchaCreate, CanchaUpdate


class CanchaRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def crear(self, datos: CanchaCreate, propietario_id: UUID) -> Cancha:
        cancha = Cancha(**datos.model_dump(), propietario_id=propietario_id)
        self.db.add(cancha)
        await self.db.commit()
        await self.db.refresh(cancha)
        return cancha

    async def listar(self) -> List[Cancha]:
        resultado = await self.db.execute(select(Cancha))
        return list(resultado.scalars().all())

    async def obtener_por_id(self, cancha_id: UUID) -> Optional[Cancha]:
        resultado = await self.db.execute(
            select(Cancha).where(Cancha.id == cancha_id)
        )
        return resultado.scalar_one_or_none()

    async def actualizar(self, cancha_id: UUID, datos: CanchaUpdate) -> Optional[Cancha]:
        cancha = await self.obtener_por_id(cancha_id)
        if not cancha:
            return None
        update_data = datos.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(cancha, key, value)
        await self.db.commit()
        await self.db.refresh(cancha)
        return cancha

    async def eliminar(self, cancha_id: UUID) -> bool:
        cancha = await self.obtener_por_id(cancha_id)
        if not cancha:
            return False
        await self.db.delete(cancha)
        await self.db.commit()
        return True