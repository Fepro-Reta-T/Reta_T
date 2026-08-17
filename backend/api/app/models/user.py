import enum
import uuid
from datetime import datetime

from sqlalchemy import Boolean, Column, DateTime, Enum as SAEnum, String, Uuid, func, JSON
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base


class RoleEnum(str, enum.Enum):
    """
    Roles del sistema. Definidos una sola vez acá (AGENTS.md §4) — el equivalente en
    TypeScript vive en packages/types y debe mantenerse idéntico a este.

    Fusión de la decisión inicial + MVP_RetaT.pdf (ver AGENTS.md §4 para el detalle de permisos).
    """

    ADMIN = "admin"
    ORGANIZER = "organizer"
    MATCH_MANAGER = "match_manager"  # "Encargado de partido" en el PDF
    PLAYER = "player"
    VIEWER = "viewer"  # "Visualizador (municipio)" en el PDF


class User(Base):
    __tablename__ = "users"

    id: Mapped[uuid.UUID] = mapped_column(Uuid, primary_key=True, default=uuid.uuid4)
    email: Mapped[str] = mapped_column(String(255), unique=True, index=True, nullable=False)
    telefono: Mapped[str | None] = mapped_column(String(20), unique=True, index=True, nullable=True)
    hashed_password: Mapped[str] = mapped_column(String(255), nullable=False)
    full_name: Mapped[str] = mapped_column(String(255), nullable=False)
    role: Mapped[RoleEnum] = mapped_column(
        SAEnum(
            RoleEnum,
            name="role_enum",
            native_enum=True,
            values_callable=lambda enum_cls: [member.value for member in enum_cls],
        ),
        nullable=False,
        default=RoleEnum.PLAYER,
    )
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now()
    )
    datos_adicionales = Column(JSON, nullable=True)
    canchas = relationship("Cancha", back_populates="propietario", cascade="all, delete-orphan")
    partidos_gestionados = relationship("Partido", back_populates="match_manager")