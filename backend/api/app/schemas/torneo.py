from enum import Enum
from pydantic import BaseModel, ConfigDict, Field
from uuid import UUID
from datetime import datetime
from typing import Optional

class CategoriaTorneoEnum(str, Enum):
    FEMENIL = "femenil"
    VARONIL = "varonil"
    MIXTO = "mixto"

class TorneoBase(BaseModel):
    nombre: str = Field(..., min_length=3, max_length=100)
    categoria: CategoriaTorneoEnum
    sport_id: UUID

class TorneoCreate(TorneoBase):
    pass

class TorneoUpdate(BaseModel):
    nombre: Optional[str] = Field(None, min_length=3, max_length=100)
    categoria: Optional[CategoriaTorneoEnum] = None
    sport_id: Optional[UUID] = None

class TorneoResponse(TorneoBase):
    id: UUID
    organizer_id: UUID
    
    class Config:
        from_attributes = True