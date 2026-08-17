from pydantic import BaseModel
from uuid import UUID
from typing import Optional

class EquipoBase(BaseModel):
    nombre: str
    color: Optional[str] = None
    logo_url: Optional[str] = None

class EquipoCreate(EquipoBase):
    pass

class EquipoResponse(EquipoBase):
    id: UUID
    
    class Config:
        from_attributes = True