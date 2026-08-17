from uuid import UUID
from typing import List, Optional
from app.repositories.cancha_repository import CanchaRepository
from app.schemas.cancha import CanchaCreate, CanchaUpdate
from app.models.geo import Cancha


class CanchaService:
    def __init__(self, repo: CanchaRepository):
        self.repo = repo

    async def crear_cancha(self, datos: CanchaCreate, propietario_id: UUID) -> Cancha:
        return await self.repo.crear(datos, propietario_id)

    async def listar_canchas(self) -> List[Cancha]:
        return await self.repo.listar()

    async def obtener_cancha(self, cancha_id: UUID) -> Optional[Cancha]:
        return await self.repo.obtener_por_id(cancha_id)

    async def actualizar_cancha(self, cancha_id: UUID, datos: CanchaUpdate) -> Optional[Cancha]:
        return await self.repo.actualizar(cancha_id, datos)

    async def eliminar_cancha(self, cancha_id: UUID) -> bool:
        return await self.repo.eliminar(cancha_id)