from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.routers import auth, cancha, health, equipo, torneo, sport, municipio

app = FastAPI(title="Reta_T API", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"]
)

app.include_router(health.router)
app.include_router(auth.router)
app.include_router(cancha.router)
app.include_router(equipo.router)
app.include_router(torneo.router)
app.include_router(sport.router)
app.include_router(municipio.router) 
