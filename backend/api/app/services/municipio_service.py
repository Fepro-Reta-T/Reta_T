from typing import List, Optional
from app.repositories.municipio_repository import MunicipioRepository
from app.schemas.municipio import MunicipioCreate
from app.models.geo import Municipio


class MunicipioService:
    def __init__(self, repo: MunicipioRepository):
        self.repo = repo

    async def listar(self) -> List[Municipio]:
        return await self.repo.listar()

    async def obtener_por_nombre(self, nombre: str) -> Optional[Municipio]:
        return await self.repo.obtener_por_nombre(nombre)

    async def crear(self, datos: MunicipioCreate) -> Municipio:
        return await self.repo.crear(datos)
