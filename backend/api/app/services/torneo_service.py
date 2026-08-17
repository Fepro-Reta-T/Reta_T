from uuid import UUID
from typing import List, Optional
from app.repositories.torneo_repository import TorneoRepository
from app.repositories.inscripcion_repository import InscripcionRepository
from app.schemas.torneo import TorneoCreate, TorneoUpdate
from app.models.organization import Tournament, Equipo


class TorneoService:
    def __init__(self, repo: TorneoRepository, inscripcion_repo: Optional[InscripcionRepository] = None):
        self.repo = repo
        self.inscripcion_repo = inscripcion_repo or InscripcionRepository(repo.db)

    async def crear(self, datos: TorneoCreate, organizer_id: UUID) -> Tournament:
        return await self.repo.crear(datos, organizer_id)

    async def listar(self) -> List[Tournament]:
        return await self.repo.listar()

    async def obtener(self, torneo_id: UUID) -> Optional[Tournament]:
        return await self.repo.obtener(torneo_id)

    async def actualizar(self, torneo_id: UUID, datos: TorneoUpdate) -> Optional[Tournament]:
        return await self.repo.actualizar(torneo_id, datos)

    async def eliminar(self, torneo_id: UUID) -> bool:
        return await self.repo.eliminar(torneo_id)

    # ✅ AGREGADOS: Métodos de inscripción
    async def inscribir_equipo(self, torneo_id: UUID, equipo_id: UUID) -> bool:
        return await self.inscripcion_repo.inscribir(torneo_id, equipo_id)

    async def retirar_equipo(self, torneo_id: UUID, equipo_id: UUID) -> bool:
        return await self.inscripcion_repo.retirar(torneo_id, equipo_id)

    async def listar_equipos_inscritos(self, torneo_id: UUID) -> List[Equipo]:
        return await self.inscripcion_repo.listar_equipos_inscritos(torneo_id)