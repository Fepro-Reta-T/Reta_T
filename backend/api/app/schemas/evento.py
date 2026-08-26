from pydantic import BaseModel, ConfigDict
from uuid import UUID
from datetime import datetime
from typing import Optional

class MatchEventCreate(BaseModel):
    partido_id: UUID
    event_type_id: UUID
    participante_id: Optional[UUID] = None
    client_timestamp: datetime  # Event Sourcing: La hora real del teléfono
    meta_data: Optional[dict] = None  # Aquí van los datos extra (ej. el nombre del jugador)

class MatchEventResponse(MatchEventCreate):
    id: UUID
    model_config = ConfigDict(from_attributes=True)