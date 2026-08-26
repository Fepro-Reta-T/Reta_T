from . import auth, cancha, health, sport, municipio
from . import equipo as equipo_router
from . import torneo as torneo_router
from . import partido as partido_router  # Agregado si es que ya existía

__all__ = [
    "auth",
    "cancha",
    "health",
    "sport",
    "municipio",
    "equipo_router",
    "torneo_router",
    "partido_router",
]