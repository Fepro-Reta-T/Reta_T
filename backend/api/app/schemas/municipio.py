from pydantic import BaseModel, Field
from uuid import UUID
from typing import Optional


class MunicipioBase(BaseModel):
    nombre: str = Field(..., min_length=2, max_length=200)
    estado: str = Field(..., min_length=2, max_length=100)
    clave_inegi: Optional[str] = None


class MunicipioCreate(MunicipioBase):
    pass


class MunicipioResponse(MunicipioBase):
    id: UUID

    class Config:
        from_attributes = True
