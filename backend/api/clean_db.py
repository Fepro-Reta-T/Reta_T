import asyncio
from sqlalchemy import text, select
from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker
from app.core.config import settings

async def get_working_session():
    urls_to_try = [
        "postgresql+asyncpg://reta_t:1234@localhost:5433/reta_t",
        settings.database_url,
        "postgresql+asyncpg://reta_t:1234@localhost:5432/reta_t",
        "sqlite+aiosqlite:///dev.db",
    ]

    for url in urls_to_try:
        try:
            engine = create_async_engine(url, echo=False)
            session_factory = async_sessionmaker(bind=engine, expire_on_commit=False)
            async with session_factory() as session:
                await session.execute(select(1))
                print(f"[+] Conectado a: {url.split('@')[-1] if '@' in url else url}")
                return engine, session_factory
        except Exception:
            continue

    raise ConnectionError("No se pudo conectar a la base de datos.")


async def clean_database():
    try:
        engine, session_factory = await get_working_session()
    except Exception as e:
        print(f"[!] Error de conexión: {e}")
        return

    async with session_factory() as session:
        print("[*] Iniciando limpieza de datos de prueba...")
        
        # Eliminar registros respetando llaves foráneas
        tables_to_truncate = [
            "match_events",
            "partidos",
            "participantes",
            "solicitudes_inscripcion",
            "inscripciones",
            "equipos",
            "torneos"
        ]

        dialect_name = engine.dialect.name
        
        for table in tables_to_truncate:
            try:
                if dialect_name == "postgresql":
                    await session.execute(text(f"TRUNCATE TABLE {table} CASCADE;"))
                else:
                    await session.execute(text(f"DELETE FROM {table};"))
                print(f"  - Tabla '{table}' limpiada.")
            except Exception as e:
                print(f"  ! Error limpiando '{table}': {e}")

        await session.commit()
        print("\n[+] ¡Base de datos limpiada exitosamente!")
        print("[i] Se conservaron las cuentas de usuario y la lista de deportes.")

    await engine.dispose()

if __name__ == "__main__":
    asyncio.run(clean_database())
