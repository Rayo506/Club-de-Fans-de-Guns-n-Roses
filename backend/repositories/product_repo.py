from decimal import Decimal

from sqlalchemy.orm import joinedload

from backend.entities.base import SessionLocal
from backend.entities.product_entity import ProductEntity


VALID_CATEGORIES = {'ropa', 'accesorios', 'instrumentos', 'musica', 'merch'}
VALID_MODERATION_STATES = {'pendiente', 'aprobado', 'rechazado'}


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
            estado_validacion='pendiente',
            imagen_url=imagen_url.strip() if imagen_url else None,
            descripcion=descripcion.strip()
        )
        db.add(product)
        db.commit()
        db.refresh(product)
        return db.query(ProductEntity).options(joinedload(ProductEntity.seller)).filter(ProductEntity.id == product.id).first()


def _apply_filters(query, search: str | None = None, categoria: str | None = None):
    if search:
        pattern = f'%{search.strip()}%'
        query = query.filter(ProductEntity.nombre.ilike(pattern))
    if categoria and categoria != 'todos':
        query = query.filter(ProductEntity.categoria == categoria.strip().lower())
    return query


def list_products(
    search: str | None = None,
    categoria: str | None = None,
    estado_validacion: str | None = 'aprobado'
) -> list[ProductEntity]:
    with SessionLocal() as db:
        query = db.query(ProductEntity).options(joinedload(ProductEntity.seller))
        query = _apply_filters(query, search=search, categoria=categoria)
        if estado_validacion:
            query = query.filter(ProductEntity.estado_validacion == estado_validacion)
        return query.order_by(ProductEntity.created_at.desc()).all()


def get_product(product_id: int) -> ProductEntity | None:
    with SessionLocal() as db:
        return db.query(ProductEntity).options(joinedload(ProductEntity.seller)).filter(ProductEntity.id == product_id).first()


def update_product_status(product_id: int, estado_validacion: str) -> ProductEntity:
    normalized = (estado_validacion or '').strip().lower()
    if normalized not in VALID_MODERATION_STATES:
        raise ValueError('El estado del producto no es válido')

    with SessionLocal() as db:
        product = db.query(ProductEntity).filter(ProductEntity.id == product_id).first()
        if not product:
            raise LookupError('Producto no encontrado')
        product.estado_validacion = normalized
        db.commit()
        db.refresh(product)
        return db.query(ProductEntity).options(joinedload(ProductEntity.seller)).filter(ProductEntity.id == product_id).first()


def dashboard_summary() -> dict:
    with SessionLocal() as db:
        pending_products = (
            db.query(ProductEntity)
            .options(joinedload(ProductEntity.seller))
            .filter(ProductEntity.estado_validacion == 'pendiente')
            .order_by(ProductEntity.created_at.desc())
            .limit(10)
            .all()
        )
        return {
            'products_pending_count': db.query(ProductEntity).filter(ProductEntity.estado_validacion == 'pendiente').count(),
            'products_approved_count': db.query(ProductEntity).filter(ProductEntity.estado_validacion == 'aprobado').count(),
            'products_rejected_count': db.query(ProductEntity).filter(ProductEntity.estado_validacion == 'rechazado').count(),
            'pending_products': pending_products
        }
