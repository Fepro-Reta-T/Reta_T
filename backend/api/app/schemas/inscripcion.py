from pydantic import BaseModel, ConfigDict
from uuid import UUID

class InscripcionCreate(BaseModel):
    equipo_id: UUID

class InscripcionResponse(BaseModel):
    message: str
    torneo_id: UUID
    equipo_id: UUID

    model_config = ConfigDict(from_attributes=True)


from datetime import datetime

class SolicitudInscripcionResponse(BaseModel):
    id: UUID
    torneo_id: UUID
    equipo_id: UUID
    estado: str
    fecha_solicitud: datetime

    model_config = ConfigDict(from_attributes=True)


class SolicitudAccionRequest(BaseModel):
    accion: str # "ACEPTAR" o "RECHAZAR"