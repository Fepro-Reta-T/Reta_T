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
    max_equipos: Optional[int] = None
    fecha_cierre_inscripcion: Optional[datetime] = None
    datos_adicionales: Optional[dict] = None

class TorneoCreate(TorneoBase):
    pass

class TorneoUpdate(BaseModel):
    nombre: Optional[str] = Field(None, min_length=3, max_length=100)
    categoria: Optional[CategoriaTorneoEnum] = None
    sport_id: Optional[UUID] = None
    max_equipos: Optional[int] = None
    fecha_cierre_inscripcion: Optional[datetime] = None
    datos_adicionales: Optional[dict] = None

class TorneoResponse(TorneoBase):
    id: UUID
    organizer_id: UUID
    datos_adicionales: Optional[dict] = None

    model_config = ConfigDict(from_attributes=True)