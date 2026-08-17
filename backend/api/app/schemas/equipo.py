# backend/api/app/schemas/equipo.py
from pydantic import BaseModel, ConfigDict, Field
from uuid import UUID
from datetime import datetime
from typing import Optional

class EquipoBase(BaseModel):
    nombre: str = Field(..., min_length=3, max_length=100)
    color: Optional[str] = Field(None, max_length=20)
    logo_url: Optional[str] = Field(None, max_length=255)

class EquipoCreate(EquipoBase):
    pass

class EquipoUpdate(BaseModel):
    nombre: Optional[str] = Field(None, min_length=3, max_length=100)
    color: Optional[str] = Field(None, max_length=20)
    logo_url: Optional[str] = Field(None, max_length=255)

class EquipoResponse(EquipoBase):
    id: UUID
    
    class Config:
        from_attributes = True