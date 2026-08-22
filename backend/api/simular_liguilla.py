import asyncio
import sys
import os
import random
from uuid import UUID
from sqlalchemy import select
from sqlalchemy.orm import selectinload
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker

# Import from backend
sys.path.append(os.path.join(os.path.dirname(__file__), "..", "..", "backend", "api"))
from app.core.config import settings
from app.models.organization import Tournament, Equipo
from app.models.game import Partido

async def get_working_session():
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
                return engine, session_factory
        except Exception as e:
            last_err = e
            continue
    raise ConnectionError(f"No se pudo conectar a la base de datos: {last_err}")

async def simular_liguilla():
    engine, session_factory = await get_working_session()
    async with session_factory() as session:
        # 1. Obtener torneo más reciente
        stmt = select(Tournament).order_by(Tournament.created_at.desc() if hasattr(Tournament, "created_at") else Tournament.id.desc()).options(selectinload(Tournament.partidos))
        res = await session.execute(stmt)
        torneo = res.scalars().first()
        
        if not torneo:
            print("No hay torneos")
            return

        print(f"Torneo: {torneo.nombre}")
        
        # 2. Obtener partidos y calcular tabla para sacar el Top 4
        partidos = torneo.partidos
        stats = {}
        for p in partidos:
            if not p.datos_adicionales or p.datos_adicionales.get("estado") != "FINALIZADO" or p.datos_adicionales.get("fase") != "fase_regular":
                continue
            
            loc = p.equipo_local_id
            vis = p.equipo_visitante_id
            gl = p.datos_adicionales.get("marcador_local", 0)
            gv = p.datos_adicionales.get("marcador_visitante", 0)
            
            for t_id in (loc, vis):
                if t_id not in stats:
                    stats[t_id] = {"pts": 0, "dg": 0, "gf": 0}
            
            stats[loc]["gf"] += gl
            stats[vis]["gf"] += gv
            stats[loc]["dg"] += (gl - gv)
            stats[vis]["dg"] += (gv - gl)
            
            if gl > gv:
                stats[loc]["pts"] += 3
            elif gv > gl:
                stats[vis]["pts"] += 3
            else:
                stats[loc]["pts"] += 1
                stats[vis]["pts"] += 1

        # Ordenar tabla
        tabla = sorted(stats.items(), key=lambda x: (x[1]["pts"], x[1]["dg"], x[1]["gf"]), reverse=True)
        if len(tabla) < 4:
            print("No hay suficientes equipos con stats para armar liguilla (Top 4).")
            return
            
        top4_ids = [t[0] for t in tabla[:4]]
        
        # 3. Borrar liguilla anterior si existe
        for p in partidos:
            if p.datos_adicionales and p.datos_adicionales.get("fase") in ("Semis", "Final"):
                await session.delete(p)
        await session.commit()
        
        # 4. Crear Semis (1 vs 4, 2 vs 3)
        print("Creando Semis...")
        def simular_partido_eliminacion(loc, vis, fase):
            gl, gv = random.randint(0, 3), random.randint(0, 3)
            while gl == gv:
                gl += 1 # evitar empate
            p = Partido(
                torneo_id=torneo.id,
                equipo_local_id=loc,
                equipo_visitante_id=vis,
                datos_adicionales={
                    "fase": fase,
                    "estado": "FINALIZADO",
                    "marcador_local": gl,
                    "marcador_visitante": gv
                }
            )
            return p, loc if gl > gv else vis

        semi1, gan_semi1 = simular_partido_eliminacion(top4_ids[0], top4_ids[3], "Semis")
        semi2, gan_semi2 = simular_partido_eliminacion(top4_ids[1], top4_ids[2], "Semis")
        
        session.add(semi1)
        session.add(semi2)
        await session.commit()
        
        # 5. Crear Final
        print("Creando Final...")
        final, gan_final = simular_partido_eliminacion(gan_semi1, gan_semi2, "Final")
        session.add(final)
        await session.commit()
        
        print("Liguilla generada exitosamente. Ganador:", gan_final)

if __name__ == "__main__":
    asyncio.run(simular_liguilla())
