from datetime import datetime

from sqlalchemy import Column, Date, DateTime, ForeignKey, Integer, Numeric, String, Text, Time, UniqueConstraint
from sqlalchemy.orm import relationship

from backend.entities.base import Base

# Entidad Evento (atributos de la BD)
class EventEntity(Base):
    __tablename__ = 'events'

    id = Column(Integer, primary_key=True, autoincrement=True)
    titulo = Column(String(160), nullable=False)
    creador_id = Column(Integer, ForeignKey('users.id', ondelete='CASCADE'), nullable=False, index=True)
    fecha = Column(Date, nullable=False)
    hora = Column(Time, nullable=False)
    localizacion = Column(String(160), nullable=False)
    precio = Column(Numeric(10, 2), nullable=True)
    plazas_totales = Column(Integer, nullable=False)
    plazas_ocupadas = Column(Integer, nullable=False, default=0)
    imagen_url = Column(String(500), nullable=True)
    descripcion = Column(Text, nullable=False)
    estado = Column(String(20), nullable=False, default='pendiente', index=True)
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    updated_at = Column(DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)

    creator = relationship('UserEntity', back_populates='events')
    registrations = relationship('EventRegistrationEntity', back_populates='event', cascade='all, delete-orphan')

# Entidad Evento al Registrarlo (atributos de la BD)
class EventRegistrationEntity(Base):
    __tablename__ = 'event_registrations'
    __table_args__ = (UniqueConstraint('event_id', 'user_id', name='uq_event_user_registration'),)

    id = Column(Integer, primary_key=True, autoincrement=True)
    event_id = Column(Integer, ForeignKey('events.id', ondelete='CASCADE'), nullable=False, index=True)
    user_id = Column(Integer, ForeignKey('users.id', ondelete='CASCADE'), nullable=False, index=True)
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)

    event = relationship('EventEntity', back_populates='registrations')
    user = relationship('UserEntity', back_populates='registrations')
