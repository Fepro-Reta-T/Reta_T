from uuid import UUID
from typing import Optional, List
from sqlalchemy import select
from app.repositories.equipo_repository import EquipoRepository
from app.schemas.equipo import EquipoCreate, EquipoUpdate
from app.models.organization import Equipo
from app.models.sport import Sport


class EquipoService:
    def __init__(self, repo: EquipoRepository):
        self.repo = repo

    async def crear(self, datos: EquipoCreate) -> Equipo:
        # Validar que el sport_id referenciado en datos_adicionales exista en BD
        sport_id = (datos.datos_adicionales or {}).get("sport_id")
        if sport_id:
            result = await self.repo.db.execute(
                select(Sport).where(Sport.id == sport_id)
            )
            if not result.scalar_one_or_none():
                raise ValueError(f"El deporte con ID '{sport_id}' no existe.")
        return await self.repo.crear(datos)

    async def listar(self) -> List[Equipo]:
        return await self.repo.listar()

    async def obtener(self, equipo_id: UUID) -> Optional[Equipo]:
        return await self.repo.obtener_por_id(equipo_id)

    async def actualizar(self, equipo_id: UUID, datos: EquipoUpdate) -> Optional[Equipo]:
        return await self.repo.actualizar(equipo_id, datos)

    async def eliminar(self, equipo_id: UUID) -> bool:
        return await self.repo.eliminar(equipo_id)