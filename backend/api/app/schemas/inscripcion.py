from pydantic import BaseModel, ConfigDict
from uuid import UUID

class InscripcionCreate(BaseModel):
    equipo_id: UUID

class InscripcionResponse(BaseModel):
    message: str
    torneo_id: UUID
    equipo_id: UUID

    model_config = ConfigDict(from_attributes=True)