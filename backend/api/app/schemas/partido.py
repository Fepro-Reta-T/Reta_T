from pydantic import BaseModel, ConfigDict, Field, field_validator
from uuid import UUID
from datetime import datetime
from typing import Optional

class PartidoBase(BaseModel):
    torneo_id: UUID
    equipo_local_id: UUID
    equipo_visitante_id: UUID
    cancha_id: Optional[UUID] = None
    match_manager_id: Optional[UUID] = None
    fecha: Optional[datetime] = None
    datos_adicionales: Optional[dict] = None

    @field_validator("equipo_visitante_id")
    @classmethod
    def validar_equipos_diferentes(cls, v, info):
        if "equipo_local_id" in info.data and v == info.data["equipo_local_id"]:
            raise ValueError("El equipo local y el equipo visitante no pueden ser el mismo.")
        return v

class PartidoCreate(PartidoBase):
    pass

class PartidoUpdate(BaseModel):
    equipo_local_id: Optional[UUID] = None
    equipo_visitante_id: Optional[UUID] = None
    cancha_id: Optional[UUID] = None
    match_manager_id: Optional[UUID] = None
    fecha: Optional[datetime] = None
    datos_adicionales: Optional[dict] = None

class AsignarEncargadoRequest(BaseModel):
    match_manager_id: UUID

class PartidoResponse(PartidoBase):
    id: UUID

    model_config = ConfigDict(from_attributes=True)
