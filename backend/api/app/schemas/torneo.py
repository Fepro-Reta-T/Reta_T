from pydantic import BaseModel
from uuid import UUID
from typing import Optional

class TorneoBase(BaseModel):
    nombre: str
    categoria: str
    sport_id: UUID
    organizer_id: UUID

class TorneoCreate(TorneoBase):
    pass

class TorneoResponse(TorneoBase):
    id: UUID
    
    class Config:
        from_attributes = True