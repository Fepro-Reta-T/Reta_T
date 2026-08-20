from uuid import UUID
from typing import Optional, List
from sqlalchemy import select
from app.repositories.equipo_repository import EquipoRepository
from app.repositories.participante_repository import ParticipanteRepository
from app.schemas.equipo import EquipoCreate, EquipoUpdate
from app.schemas.participante import ParticipanteCreate, ParticipanteUpdate
from app.models.organization import Equipo
from app.models.game import Participante
from app.models.sport import Sport


class EquipoService:
    def __init__(
        self,
        repo: EquipoRepository,
        participante_repo: Optional[ParticipanteRepository] = None
    ):
        self.repo = repo
        self.participante_repo = participante_repo or ParticipanteRepository(repo.db)

    async def crear(self, datos: EquipoCreate, creator_id: Optional[UUID] = None) -> Equipo:
        # Validar que el sport_id referenciado en datos_adicionales exista en BD
        sport_id = (datos.datos_adicionales or {}).get("sport_id")
        if sport_id:
            result = await self.repo.db.execute(
                select(Sport).where(Sport.id == sport_id)
            )
            if not result.scalar_one_or_none():
                raise ValueError(f"El deporte con ID '{sport_id}' no existe.")
        return await self.repo.crear(datos, creator_id=creator_id)

    async def listar(self) -> List[Equipo]:
        return await self.repo.listar()

    async def obtener(self, equipo_id: UUID) -> Optional[Equipo]:
        return await self.repo.obtener_por_id(equipo_id)

    async def actualizar(self, equipo_id: UUID, datos: EquipoUpdate) -> Optional[Equipo]:
        return await self.repo.actualizar(equipo_id, datos)

    async def eliminar(self, equipo_id: UUID) -> bool:
        return await self.repo.eliminar(equipo_id)

    # Métodos de gestión de jugadores (Participantes)
    async def agregar_participante(self, equipo_id: UUID, datos: ParticipanteCreate) -> Participante:
        return await self.participante_repo.crear(equipo_id, datos)

    async def listar_participantes(self, equipo_id: UUID) -> List[Participante]:
        return await self.participante_repo.listar_por_equipo(equipo_id)

    async def obtener_participante(self, participante_id: UUID) -> Optional[Participante]:
        return await self.participante_repo.obtener_por_id(participante_id)

    async def actualizar_participante(
        self,
        participante_id: UUID,
        datos: ParticipanteUpdate
    ) -> Optional[Participante]:
        return await self.participante_repo.actualizar(participante_id, datos)

    async def eliminar_participante(self, participante_id: UUID) -> bool:
        return await self.participante_repo.eliminar(participante_id)