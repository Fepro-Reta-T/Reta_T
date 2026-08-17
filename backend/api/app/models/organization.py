from sqlalchemy import Column, String, ForeignKey, Table
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid
from app.core.database import Base

# Tabla pivote
inscripcion_table = Table(
    "inscripciones",
    Base.metadata,
    Column("torneo_id", UUID(as_uuid=True), ForeignKey("torneos.id")),
    Column("equipo_id", UUID(as_uuid=True), ForeignKey("equipos.id"))
)

class Equipo(Base):
    __tablename__ = "equipos"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    nombre = Column(String, nullable=False, index=True)
    color = Column(String, nullable=True)
    logo_url = Column(String, nullable=True)

    torneos = relationship("Tournament", secondary=inscripcion_table, back_populates="equipos")
    participantes = relationship("Participante", back_populates="equipo")

class Tournament(Base):
    __tablename__ = "torneos"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    nombre = Column(String, nullable=False)
    categoria = Column(String, nullable=False)
    
    sport_id = Column(UUID(as_uuid=True), ForeignKey("sports.id"))
    organizer_id = Column(UUID(as_uuid=True), ForeignKey("users.id")) 

    sport = relationship("Sport", back_populates="tournaments")
    equipos = relationship("Equipo", secondary=inscripcion_table, back_populates="torneos")