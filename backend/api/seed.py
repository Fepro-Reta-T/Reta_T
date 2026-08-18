import asyncio
from sqlalchemy import select
from app.core.database import AsyncSessionLocal
from app.models.sport import Sport

DEPORTES = [
    {
        "nombre": "Fútbol 7",
        "is_active": True,
        "datos_adicionales": {
            "default_team_size": 7,
            "scoring_type": "goals",
            "icon": "Futbol 7.jpg"
        }
    },
    {
        "nombre": "Fútbol 11",
        "is_active": True,
        "datos_adicionales": {
            "default_team_size": 11,
            "scoring_type": "goals",
            "icon": "Futbol.jpg"
        }
    },
    {
        "nombre": "Futsal",
        "is_active": True,
        "datos_adicionales": {
            "default_team_size": 5,
            "scoring_type": "goals",
            "icon": "Futbol.jpg"
        }
    },
    {
        "nombre": "Basketball",
        "is_active": True,
        "datos_adicionales": {
            "default_team_size": 5,
            "scoring_type": "points",
            "icon": "Basket.jpg"
        }
    },
    {
        "nombre": "Voleibol",
        "is_active": True,
        "datos_adicionales": {
            "default_team_size": 6,
            "scoring_type": "sets",
            "icon": "Volley.jpg"
        }
    }
]

async def main():
    async with AsyncSessionLocal() as session:
        print("🌱 Verificando deportes en la base de datos...")
        count_added = 0
        for data in DEPORTES:
            stmt = select(Sport).where(Sport.nombre == data["nombre"])
            result = await session.execute(stmt)
            existing = result.scalar_one_or_none()
            if not existing:
                sport = Sport(**data)
                session.add(sport)
                count_added += 1
                print(f"  + Agregando deporte: {data['nombre']}")
            else:
                print(f"  . Deporte ya existe: {data['nombre']}")
        
        if count_added > 0:
            await session.commit()
            print(f"✅ Se agregaron {count_added} deportes exitosamente.")
        else:
            print("✨ Todos los deportes ya estaban registrados.")

if __name__ == "__main__":
    asyncio.run(main())
