from pydantic import BaseModel
from uuid import UUID

class InscripcionCreate(BaseModel):
    torneo_id: UUID
    equipo_id: UUID

class InscripcionResponse(InscripcionCreate):
    pass