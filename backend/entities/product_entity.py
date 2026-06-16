from datetime import datetime

from sqlalchemy import Column, DateTime, ForeignKey, Integer, Numeric, String, Text
from sqlalchemy.orm import relationship

from backend.entities.base import Base

# Entidad Producto (atributos de la BD)
class ProductEntity(Base):
    __tablename__ = 'products'

    id = Column(Integer, primary_key=True, autoincrement=True)
    nombre = Column(String(160), nullable=False)
    vendedor_id = Column(Integer, ForeignKey('users.id', ondelete='CASCADE'), nullable=False, index=True)
    precio = Column(Numeric(10, 2), nullable=False, default=0)
    categoria = Column(String(50), nullable=False, index=True)
    estado = Column(String(80), nullable=False)
    estado_validacion = Column(String(20), nullable=False, default='pendiente', index=True)
    imagen_url = Column(String(500), nullable=True)
    descripcion = Column(Text, nullable=False)
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    updated_at = Column(DateTime, nullable=False, default=datetime.utcnow, onupdate=datetime.utcnow)

    seller = relationship('UserEntity', back_populates='products')
