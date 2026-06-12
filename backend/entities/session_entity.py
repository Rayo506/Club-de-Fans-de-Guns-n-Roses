from datetime import datetime

from sqlalchemy import Column, DateTime, ForeignKey, Integer, String
from sqlalchemy.orm import relationship

from backend.entities.base import Base


class SessionEntity(Base):
    __tablename__ = 'sessions'

    session_id = Column(String(128), primary_key=True, nullable=False)
    user_id = Column(Integer, ForeignKey('users.id', ondelete='CASCADE'), nullable=False, index=True)
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    expires_at = Column(DateTime, nullable=True)

    user = relationship('UserEntity', back_populates='sessions')
