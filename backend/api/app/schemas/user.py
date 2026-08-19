from datetime import date
import uuid

from pydantic import BaseModel, ConfigDict, EmailStr

from app.models.user import RoleEnum, SexoEnum


class UserCreate(BaseModel):
    email: EmailStr
    telefono: str | None = None
    password: str
    full_name: str
    sexo: SexoEnum | None = None
    fecha_nacimiento: date | None = None
    role: RoleEnum = RoleEnum.PLAYER


class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    email: EmailStr
    telefono: str | None
    full_name: str
    sexo: SexoEnum | None = None
    fecha_nacimiento: date | None = None
    role: RoleEnum
    is_active: bool
    datos_adicionales: dict | None = None

class UserOnboardingUpdate(BaseModel):
    role: RoleEnum | None = None
    datos_adicionales: dict | None = None

