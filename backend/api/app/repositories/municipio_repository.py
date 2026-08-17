from typing import List, Optional
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from app.models.geo import Municipio
from app.schemas.municipio import MunicipioCreate


class MunicipioRepository:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def listar(self) -> List[Municipio]:
        resultado = await self.db.execute(select(Municipio).order_by(Municipio.nombre))
        return list(resultado.scalars().all())

    async def obtener_por_nombre(self, nombre: str) -> Optional[Municipio]:
        resultado = await self.db.execute(
            select(Municipio).where(Municipio.nombre == nombre)
        )
        return resultado.scalar_one_or_none()

    async def crear(self, datos: MunicipioCreate) -> Municipio:
        nuevo = Municipio(
            nombre=datos.nombre,
            estado=datos.estado,
            clave_inegi=datos.clave_inegi
        )
        self.db.add(nuevo)
        await self.db.commit()
        await self.db.refresh(nuevo)
        return nuevo
