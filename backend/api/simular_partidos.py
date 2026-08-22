import asyncio
import sys
import os
import random
from uuid import UUID
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker

from app.core.config import settings
from app.models.organization import Tournament, Equipo
from app.models.game import Partido


async def get_working_session():
    """Prueba conectarse a la base de datos principal o intenta fallbacks locales para desarrollo."""
    urls_to_try = [
        "postgresql+asyncpg://reta_t:1234@localhost:5433/reta_t",
        settings.database_url,
        "postgresql+asyncpg://reta_t:1234@localhost:5432/reta_t",
        "sqlite+aiosqlite:///dev.db",
    ]

    last_err = None
    for url in urls_to_try:
        try:
            engine = create_async_engine(url, echo=False)
            session_factory = async_sessionmaker(bind=engine, expire_on_commit=False)
            async with session_factory() as session:
                await session.execute(select(1))
                host_str = url.split('@')[-1] if '@' in url else url
                print(f"[+] Conectado a la base de datos: {host_str}")
                return engine, session_factory
        except Exception as e:
            last_err = e
            continue

    raise ConnectionError(f"No se pudo conectar a la base de datos: {last_err}")


async def simular_partidos(torneo_id_str: str = None):
    try:
        engine, session_factory = await get_working_session()
    except Exception as e:
        print(f"[!] Error de conexion: {e}")
        return

    async with session_factory() as session:
        # 1. Obtener el torneo objetivo
        if torneo_id_str:
            try:
                torneo_id = UUID(torneo_id_str)
                stmt = select(Tournament).where(Tournament.id == torneo_id).options(selectinload(Tournament.partidos))
                res = await session.execute(stmt)
                torneo = res.scalar_one_or_none()
            except ValueError:
                print(f"[!] ID de torneo invalido: '{torneo_id_str}'")
                await engine.dispose()
                return
        else:
            # Obtener el torneo más reciente
            stmt = select(Tournament).order_by(Tournament.created_at.desc() if hasattr(Tournament, "created_at") else Tournament.id).options(selectinload(Tournament.partidos))
            res = await session.execute(stmt)
            torneos = res.scalars().all()
            torneo = torneos[0] if torneos else None

        if not torneo:
            print("[!] No se encontro ningun torneo en la base de datos.")
            await engine.dispose()
            return

        print(f"[*] Torneo encontrado: {torneo.nombre} (ID: {torneo.id})")

        # 2. Buscar partidos del torneo
        stmt_partidos = select(Partido).where(Partido.torneo_id == torneo.id)
        res_p = await session.execute(stmt_partidos)
        partidos = res_p.scalars().all()

        if not partidos:
            print("[!] El torneo aun no tiene partidos generados. Haz clic en 'Generar Fixture Automatico' en la web primero.")
            await engine.dispose()
            return

        # Cargamos mapas de nombres de equipos
        stmt_equipos = select(Equipo)
        res_eq = await session.execute(stmt_equipos)
        equipos = {e.id: e.nombre for e in res_eq.scalars().all()}

        print(f"[*] Simulando marcadores para {len(partidos)} partidos...\n")

        partidos_actualizados = 0
        for p in partidos:
            datos_previos = dict(p.datos_adicionales) if p.datos_adicionales else {}
            
            # Generar marcadores aleatorios realistas
            goles_local = random.randint(0, 4)
            goles_visitante = random.randint(0, 4)

            # Evitar empates en fases de eliminación directa
            fase = datos_previos.get("fase", "")
            if fase in ("Final", "Semifinal", "Cuartos de final", "8vos de final", "16vos de final"):
                if goles_local == goles_visitante:
                    goles_local += 1

            datos_previos.update({
                "marcador_local": goles_local,
                "marcador_visitante": goles_visitante,
                "estado": "FINALIZADO"
            })
            p.datos_adicionales = datos_previos
            session.add(p)
            partidos_actualizados += 1

            loc_nombre = equipos.get(p.equipo_local_id, "Local")
            vis_nombre = equipos.get(p.equipo_visitante_id, "Visitante")
            jornada_info = f"Jornada {datos_previos.get('jornada')}" if "jornada" in datos_previos else datos_previos.get("fase", "Partido")
            grupo_info = f" ({datos_previos.get('grupo')})" if "grupo" in datos_previos else ""

            print(f"  [{jornada_info}{grupo_info}] {loc_nombre} {goles_local} - {goles_visitante} {vis_nombre}")

        await session.commit()
        print(f"\n[+] Simulacion completada con exito. Se actualizaron {partidos_actualizados} partidos.")
        print("[i] Refresca tu pagina web para ver los marcadores y tabla de posiciones actualizados.")

    await engine.dispose()

if __name__ == "__main__":
    target_id = sys.argv[1] if len(sys.argv) > 1 else None
    asyncio.run(simular_partidos(target_id))
