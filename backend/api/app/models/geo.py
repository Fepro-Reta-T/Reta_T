from sqlalchemy import Column, String, Float, Integer, ForeignKey, DateTime
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid
from datetime import datetime
from app.core.database import Base

class Municipio(Base):
    __tablename__ = "municipios"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    nombre = Column(String, nullable=False, index=True)
    estado = Column(String, nullable=False)
    clave_inegi = Column(String, unique=True, nullable=True)

    canchas= relationship("Cancha", back_populates="municipio")


class Cancha(Base):
    __tablename__ = "canchas"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    nombre = Column(String(120), nullable=False)
    direccion = Column(String(255), nullable=False)
    latitud = Column(Float, nullable=False)
    longitud = Column(Float, nullable=False)
    capacidad = Column(Integer, nullable=True)
    municipio_id = Column(UUID(as_uuid=True), ForeignKey("municipios.id"), nullable=True)
    propietario_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    municipio = relationship("Municipio", back_populates="canchas")
    propietario = relationship("User", back_populates="canchas")
    partidos = relationship("Partido", back_populates="cancha")