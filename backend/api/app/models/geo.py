from sqlalchemy import Column, String, Float, Integer, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
import uuid
from app.core.database import Base

class Municipio(Base):
    __tablename__ = "municipios"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    nombre = Column(String, nullable=False, index=True)
    estado = Column(String, nullable=False)
    clave_inegi = Column(String, unique=True, nullable=True)

class Cancha(Base):
    __tablename__ = "canchas"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    nombre = Column(String, nullable=False)
    direccion = Column(String, nullable=False)
    
    latitud = Column(Float, nullable=False)
    longitud = Column(Float, nullable=False)
    capacidad = Column(Integer, nullable=True)
    
    # Opcional según el Sprint 2
    municipio_id = Column(UUID(as_uuid=True), ForeignKey("municipios.id"), nullable=True)