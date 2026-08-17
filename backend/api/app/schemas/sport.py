from pydantic import BaseModel
from uuid import UUID

class SportResponse(BaseModel):
    id: UUID
    nombre: str
    is_active: bool

    class Config:
        from_attributes = True