from decimal import Decimal, InvalidOperation

from flask import Blueprint, jsonify, request

from backend.repositories import product_repo
from backend.routes.helpers import json_error, product_to_dict, require_user


product_bp = Blueprint('products', __name__)


def _parse_product_payload(data: dict):
    nombre = (data.get('nombre') or '').strip()
    categoria = (data.get('categoria') or '').strip().lower()
    estado = (data.get('estado') or '').strip()
    imagen_url = (data.get('imagen_url') or '').strip()
    descripcion = (data.get('descripcion') or '').strip()
    precio_raw = data.get('precio')

    if len(nombre) < 3:
        return None, 'El nombre debe tener al menos 3 caracteres'
    if categoria not in product_repo.VALID_CATEGORIES:
        return None, 'La categoría del producto no es válida'
    if len(estado) < 2:
        return None, 'El estado del producto es obligatorio'
    if len(descripcion) < 10:
        return None, 'La descripción debe tener al menos 10 caracteres'

    try:
        precio = Decimal(str(precio_raw if precio_raw not in (None, '') else 0))
    except InvalidOperation:
        return None, 'El precio debe ser un número válido'
    if precio < 0:
        return None, 'El precio no puede ser negativo'

    return {
        'nombre': nombre,
        'precio': precio,
        'categoria': categoria,
        'estado': estado,
        'imagen_url': imagen_url or None,
        'descripcion': descripcion
    }, None


@product_bp.route('/products', methods=['GET'])
def list_products():
    search = request.args.get('search')
    categoria = request.args.get('categoria')
    products = product_repo.list_products(search=search, categoria=categoria)
    return jsonify({'products': [product_to_dict(product) for product in products]})


@product_bp.route('/products/<int:product_id>', methods=['GET'])
def get_product(product_id: int):
    product = product_repo.get_product(product_id)
    if not product:
        return json_error('Producto no encontrado', 404)
    return jsonify({'product': product_to_dict(product)})


@product_bp.route('/products', methods=['POST'])
def create_product():
    user, error = require_user()
    if error:
        return error
    data = request.get_json(silent=True) or {}
    payload, validation_error = _parse_product_payload(data)
    if validation_error:
        return json_error(validation_error, 400)
    product = product_repo.create_product(vendedor_id=user.id, **payload)
    return jsonify({
        'message': 'Producto publicado correctamente',
        'product': product_to_dict(product)
    }), 201
