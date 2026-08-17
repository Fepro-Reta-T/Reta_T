from sqlalchemy import Column, String, ForeignKey, DateTime
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid
from datetime import datetime
from app.core.database import Base

class Participante(Base):
    __tablename__ = "participantes"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    nombre = Column(String, nullable=False)
    telefono = Column(String, nullable=True)
    email = Column(String, nullable=True)
    
    equipo_id = Column(UUID(as_uuid=True), ForeignKey("equipos.id"))
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)

    equipo = relationship("Equipo", back_populates="participantes")

class Partido(Base):
    __tablename__ = "partidos"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    torneo_id = Column(UUID(as_uuid=True), ForeignKey("torneos.id"))
    equipo_local_id = Column(UUID(as_uuid=True), ForeignKey("equipos.id"))
    equipo_visitante_id = Column(UUID(as_uuid=True), ForeignKey("equipos.id"))
    cancha_id = Column(UUID(as_uuid=True), ForeignKey("canchas.id"))
    match_manager_id = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    fecha = Column(DateTime, default=datetime.utcnow)