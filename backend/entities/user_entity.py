from datetime import datetime

from sqlalchemy import Column, DateTime, Integer, String
from sqlalchemy.orm import relationship

from backend.entities.base import Base

# Entidad User (atributos de la BD)
class UserEntity(Base):
    __tablename__ = 'users'

    id = Column(Integer, primary_key=True, autoincrement=True)
    nombre = Column(String(100), nullable=False)
    email = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    role = Column(String(20), nullable=False, default='fan')
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)

    events = relationship('EventEntity', back_populates='creator', cascade='all, delete-orphan')
    sessions = relationship('SessionEntity', back_populates='user', cascade='all, delete-orphan')
    registrations = relationship('EventRegistrationEntity', back_populates='user', cascade='all, delete-orphan')
    products = relationship('ProductEntity', back_populates='seller', cascade='all, delete-orphan')
