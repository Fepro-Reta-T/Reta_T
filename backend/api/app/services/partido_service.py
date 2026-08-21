from uuid import UUID
from typing import Optional, List
from sqlalchemy import select
from app.repositories.partido_repository import PartidoRepository
from app.repositories.torneo_repository import TorneoRepository
from app.repositories.inscripcion_repository import InscripcionRepository
from app.schemas.partido import PartidoCreate, PartidoUpdate
from app.models.game import Partido
from app.models.geo import Cancha
from app.models.user import User
from app.utils.fixture_generator import generate_round_robin

class PartidoService:
    def __init__(
        self,
        repo: PartidoRepository,
        torneo_repo: Optional[TorneoRepository] = None,
        inscripcion_repo: Optional[InscripcionRepository] = None
    ):
        self.repo = repo
        self.torneo_repo = torneo_repo or TorneoRepository(repo.db)
        self.inscripcion_repo = inscripcion_repo or InscripcionRepository(repo.db)

    async def crear(self, datos: PartidoCreate) -> Partido:
        # 1. Validar que el torneo exista
        torneo = await self.torneo_repo.obtener(datos.torneo_id)
        if not torneo:
            raise ValueError(f"El torneo con ID '{datos.torneo_id}' no existe.")

        # 2. Validar que ambos equipos estén inscritos en el torneo
        equipos_inscritos = await self.inscripcion_repo.listar_equipos_inscritos(datos.torneo_id)
        ids_inscritos = {e.id for e in equipos_inscritos}

        if datos.equipo_local_id not in ids_inscritos:
            raise ValueError("El equipo local no está inscrito en este torneo.")
        if datos.equipo_visitante_id not in ids_inscritos:
            raise ValueError("El equipo visitante no está inscrito en este torneo.")

        # 3. Validar cancha si se proporciona
        if datos.cancha_id:
            res = await self.repo.db.execute(select(Cancha).where(Cancha.id == datos.cancha_id))
            if not res.scalar_one_or_none():
                raise ValueError("La cancha especificada no existe.")

        # 4. Validar encargado si se proporciona
        if datos.match_manager_id:
            res = await self.repo.db.execute(select(User).where(User.id == datos.match_manager_id))
            if not res.scalar_one_or_none():
                raise ValueError("El usuario asignado como encargado no existe.")

        return await self.repo.crear(datos)

    async def obtener(self, partido_id: UUID) -> Optional[Partido]:
        return await self.repo.obtener_por_id(partido_id)

    async def listar_por_torneo(self, torneo_id: UUID) -> List[Partido]:
        return await self.repo.listar_por_torneo(torneo_id)

    async def actualizar(self, partido_id: UUID, datos: PartidoUpdate) -> Optional[Partido]:
        return await self.repo.actualizar(partido_id, datos)

    async def eliminar(self, partido_id: UUID) -> bool:
        return await self.repo.eliminar(partido_id)

    async def asignar_encargado(self, partido_id: UUID, match_manager_id: UUID) -> Optional[Partido]:
        res = await self.repo.db.execute(select(User).where(User.id == match_manager_id))
        if not res.scalar_one_or_none():
            raise ValueError("El usuario asignado como encargado no existe.")
        return await self.repo.actualizar(partido_id, PartidoUpdate(match_manager_id=match_manager_id))

    async def generar_fixture(self, torneo_id: UUID) -> List[Partido]:
        torneo = await self.torneo_repo.obtener(torneo_id)
        if not torneo:
            raise ValueError(f"El torneo con ID '{torneo_id}' no existe.")

        equipos = await self.inscripcion_repo.listar_equipos_inscritos(torneo_id)
        if len(equipos) < 2:
            raise ValueError("Se necesitan al menos 2 equipos inscritos para generar un fixture.")

        # Extraer los IDs de los equipos
        equipo_ids = [e.id for e in equipos]

        # Generar jornadas usando el algoritmo Round-Robin (Método del Círculo)
        jornadas = generate_round_robin(equipo_ids)

        partidos_a_crear: List[PartidoCreate] = []
        for numero_jornada, partidos_jornada in enumerate(jornadas, start=1):
            for local_id, visitante_id in partidos_jornada:
                # Omitir descansos (cuando un equipo se empareja con None)
                if local_id is None or visitante_id is None:
                    continue

                partidos_a_crear.append(
                    PartidoCreate(
                        torneo_id=torneo_id,
                        equipo_local_id=local_id,
                        equipo_visitante_id=visitante_id,
                        datos_adicionales={"jornada": numero_jornada}
                    )
                )

        return await self.repo.crear_multiples(partidos_a_crear)
