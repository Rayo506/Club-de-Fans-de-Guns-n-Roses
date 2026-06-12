from decimal import Decimal

from sqlalchemy.orm import joinedload

from backend.entities.base import SessionLocal
from backend.entities.product_entity import ProductEntity


VALID_CATEGORIES = {'ropa', 'accesorios', 'instrumentos', 'musica', 'merch'}


def create_product(
    vendedor_id: int,
    nombre: str,
    precio: Decimal,
    categoria: str,
    estado: str,
    imagen_url: str | None,
    descripcion: str
) -> ProductEntity:
    with SessionLocal() as db:
        product = ProductEntity(
            vendedor_id=vendedor_id,
            nombre=nombre.strip(),
            precio=precio,
            categoria=categoria.strip().lower(),
            estado=estado.strip(),
            imagen_url=imagen_url.strip() if imagen_url else None,
            descripcion=descripcion.strip()
        )
        db.add(product)
        db.commit()
        db.refresh(product)
        return db.query(ProductEntity).options(joinedload(ProductEntity.seller)).filter(ProductEntity.id == product.id).first()


def list_products(search: str | None = None, categoria: str | None = None) -> list[ProductEntity]:
    with SessionLocal() as db:
        query = db.query(ProductEntity).options(joinedload(ProductEntity.seller))
        if search:
            pattern = f'%{search.strip()}%'
            query = query.filter(ProductEntity.nombre.ilike(pattern))
        if categoria and categoria != 'todos':
            query = query.filter(ProductEntity.categoria == categoria.strip().lower())
        return query.order_by(ProductEntity.created_at.desc()).all()


def get_product(product_id: int) -> ProductEntity | None:
    with SessionLocal() as db:
        return db.query(ProductEntity).options(joinedload(ProductEntity.seller)).filter(ProductEntity.id == product_id).first()
