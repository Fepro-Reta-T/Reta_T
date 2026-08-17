from pydantic import BaseModel, Field, ConfigDict
from uuid import UUID
from datetime import datetime
from typing import Optional

class CanchaBase(BaseModel):
    nombre: str = Field(..., min_length=3, max_length=120)
    direccion: str = Field(..., min_length=5, max_length=200)
    latitud: float = Field(..., ge=-90, le=90)
    longitud: float = Field(..., ge=-180, le=180)
    capacidad: Optional[int] = Field(None, ge=1)
    municipio_id: Optional[UUID] = None

class CanchaCreate(CanchaBase):
    pass
    
class CanchaUpdate(BaseModel):
    nombre: Optional[str] = Field(None, min_length=3, max_length=120)
    direccion: Optional[str] = Field(None, min_length=5, max_length=200)
    latitud: Optional[float] = Field(None, ge=-90, le=90)
    longitud: Optional[float] = Field(None, ge=-180, le=180)
    capacidad: Optional[int] = Field(None, ge=1)
    municipio_id: Optional[UUID] = None
    
class CanchaResponse(CanchaBase):
    id: UUID
    propietario_id: UUID
    created_at: datetime
    updated_at: datetime
    
    model_config = ConfigDict(from_attributes=True)