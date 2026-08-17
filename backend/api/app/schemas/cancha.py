from pydantic import BaseModel
from uuid import UUID
from typing import Optional

class CanchaBase(BaseModel):
    nombre: str
    direccion: str
    latitud: float
    longitud: float
    capacidad: Optional[int] = None
    municipio_id: Optional[UUID] = None

class CanchaCreate(CanchaBase):
    pass

class CanchaResponse(CanchaBase):
    id: UUID
    
    class Config:
        from_attributes = True