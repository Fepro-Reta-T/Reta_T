from pydantic import BaseModel, ConfigDict, Field
from uuid import UUID
from datetime import datetime
from typing import Optional

class TorneoBase(BaseModel):
    nombre: str = Field(..., min_length=3, max_length=100)
    categoria: str = Field(..., min_length=3, max_length=50)
    sport_id: UUID

class TorneoCreate(TorneoBase):
    pass

class TorneoUpdate(BaseModel):
    nombre: Optional[str] = Field(None, min_length=3, max_length=100)
    categoria: Optional[str] = Field(None, min_length=3, max_length=50)
    sport_id: Optional[UUID] = None

class TorneoResponse(TorneoBase):
    id: UUID
    organizer_id: UUID
    
    class Config:
        from_attributes = True