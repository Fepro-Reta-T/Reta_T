# backend/api/app/models/organization.py
from sqlalchemy import Column, String, ForeignKey, Table, JSON, Integer, DateTime
from sqlalchemy.sql import func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid
from datetime import datetime
from app.core.database import Base

# Tabla pivote
inscripcion_table = Table(
    "inscripciones",
    Base.metadata,
    Column("torneo_id", UUID(as_uuid=True), ForeignKey("torneos.id"), primary_key=True),
    Column("equipo_id", UUID(as_uuid=True), ForeignKey("equipos.id"), primary_key=True)
)


class Equipo(Base):
    __tablename__ = "equipos"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    nombre = Column(String, nullable=False, index=True)
    color = Column(String, nullable=True)
    logo_url = Column(String, nullable=True)
    sport_id = Column(UUID(as_uuid=True), ForeignKey("sports.id"), nullable=True)
    datos_adicionales = Column(JSON, nullable=True)
    creator_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)

    sport = relationship("Sport", backref="equipos")
    creator = relationship("User", backref="equipos_creados")
    torneos = relationship("Tournament", secondary=inscripcion_table, back_populates="equipos")
    participantes = relationship("Participante", back_populates="equipo", cascade="all, delete-orphan")
    partidos_locales = relationship("Partido", foreign_keys="Partido.equipo_local_id", back_populates="equipo_local")
    partidos_visitantes = relationship("Partido", foreign_keys="Partido.equipo_visitante_id", back_populates="equipo_visitante")


class Tournament(Base):
    __tablename__ = "torneos"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    nombre = Column(String, nullable=False)
    categoria = Column(String, nullable=False)
    
    sport_id = Column(UUID(as_uuid=True), ForeignKey("sports.id"))
    organizer_id = Column(UUID(as_uuid=True), ForeignKey("users.id")) 
    max_equipos = Column(Integer, nullable=True)
    fecha_cierre_inscripcion = Column(DateTime(timezone=True), nullable=True)
    datos_adicionales = Column(JSON, nullable=True)

    sport = relationship("Sport", back_populates="tournaments")
    equipos = relationship("Equipo", secondary=inscripcion_table, back_populates="torneos")
    partidos = relationship("Partido", back_populates="torneo")
    solicitudes = relationship("SolicitudInscripcion", back_populates="torneo", cascade="all, delete-orphan")


class SolicitudInscripcion(Base):
    __tablename__ = "solicitudes_inscripcion"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    torneo_id = Column(UUID(as_uuid=True), ForeignKey("torneos.id"), nullable=False, index=True)
    equipo_id = Column(UUID(as_uuid=True), ForeignKey("equipos.id"), nullable=False, index=True)
    estado = Column(String, nullable=False, default="PENDIENTE") # PENDIENTE, APROBADA, RECHAZADA
    fecha_solicitud = Column(DateTime(timezone=True), server_default=func.now())

    torneo = relationship("Tournament", back_populates="solicitudes")
    equipo = relationship("Equipo")