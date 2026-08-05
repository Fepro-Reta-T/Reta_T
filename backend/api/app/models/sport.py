from sqlalchemy import Column, String, Boolean, ForeignKey, DateTime, JSON
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid
from datetime import datetime
from app.core.database import Base
from sqlalchemy.dialects.postgresql import JSONB

class Sport(Base):
    __tablename__ = "sports"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    nombre = Column(String, nullable=False, index=True)
    is_active = Column(Boolean, default=True)

    event_types = relationship("EventType", back_populates="sport")
    tournaments = relationship("Tournament", back_populates="sport")

class EventType(Base):
    __tablename__ = "event_types"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    sport_id = Column(UUID(as_uuid=True), ForeignKey("sports.id"))
    nombre = Column(String, nullable=False)
    # CAMBIO AQUÍ: metadata -> meta_data
    meta_data_schema = Column(JSON, nullable=True)

    sport = relationship("Sport", back_populates="event_types")
    match_events = relationship("MatchEvent", back_populates="event_type")

class MatchEvent(Base):
    __tablename__ = "match_events"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    partido_id = Column(UUID(as_uuid=True), ForeignKey("partidos.id"), nullable=False)
    event_type_id = Column(UUID(as_uuid=True), ForeignKey("event_types.id"), nullable=False)
    participante_id = Column(UUID(as_uuid=True), ForeignKey("participantes.id"), nullable=True)
    
    # Event Sourcing
    client_timestamp = Column(DateTime, default=datetime.utcnow, nullable=False)
    
    # CAMBIO IMPORTANTE: Cambiamos JSON por JSONB para poder usar el índice GIN
    meta_data = Column(JSONB, nullable=True)

    event_type = relationship("EventType", back_populates="match_events")