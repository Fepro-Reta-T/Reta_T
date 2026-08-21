# backend/api/app/schemas/participante.py
from pydantic import BaseModel, ConfigDict, Field
from uuid import UUID
from typing import Optional


class ParticipanteBase(BaseModel):
    nombre: str = Field(..., min_length=2, max_length=100)
    telefono: Optional[str] = Field(None, max_length=20)
    email: Optional[str] = Field(None, max_length=255)
    datos_adicionales: Optional[dict] = None


class ParticipanteCreate(ParticipanteBase):
    user_id: Optional[UUID] = None


class ParticipanteUpdate(BaseModel):
    nombre: Optional[str] = Field(None, min_length=2, max_length=100)
    telefono: Optional[str] = Field(None, max_length=20)
    email: Optional[str] = Field(None, max_length=255)
    datos_adicionales: Optional[dict] = None
    user_id: Optional[UUID] = None


class ParticipanteResponse(ParticipanteBase):
    id: UUID
    equipo_id: UUID
    user_id: Optional[UUID] = None

    model_config = ConfigDict(from_attributes=True)
