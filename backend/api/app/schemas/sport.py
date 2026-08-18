from pydantic import BaseModel, ConfigDict
from uuid import UUID

class SportResponse(BaseModel):
    id: UUID
    nombre: str
    is_active: bool

    model_config = ConfigDict(from_attributes=True)