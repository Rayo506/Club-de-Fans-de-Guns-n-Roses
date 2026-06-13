from flask import Blueprint, jsonify, request

from backend.repositories import event_repo, product_repo
from backend.routes.helpers import event_to_dict, json_error, product_to_dict, require_moderator, user_to_dict


mod_bp = Blueprint('moderation', __name__)


@mod_bp.route('/mod/dashboard', methods=['GET'])
def dashboard():
    user, error = require_moderator()
    if error:
        return error
    event_summary = event_repo.dashboard_summary()
    product_summary = product_repo.dashboard_summary()
    return jsonify({
        'moderator': user_to_dict(user),
        'counts': {
            'productos_pendientes': product_summary['products_pending_count'],
            'eventos_pendientes': event_summary['events_pending_count'],
            'reportes_pendientes': 0,
            'usuarios_registrados': event_summary['users_count'],
            'eventos_aprobados': event_summary['events_approved_count'],
            'eventos_rechazados': event_summary['events_rejected_count'],
            'productos_aprobados': product_summary['products_approved_count'],
            'productos_rechazados': product_summary['products_rejected_count']
        },
        'pending_events': [event_to_dict(event) for event in event_summary['pending_events']],
        'pending_products': [product_to_dict(product) for product in product_summary['pending_products']],
        'reports': []
    })


@mod_bp.route('/mod/events', methods=['GET'])
def list_events_for_moderation():
    _, error = require_moderator()
    if error:
        return error
    estado = request.args.get('estado', 'pendiente')
    events = event_repo.list_events(estado=estado)
    return jsonify({'events': [event_to_dict(event) for event in events]})


@mod_bp.route('/mod/events/<int:event_id>', methods=['PATCH'])
def update_event_status(event_id: int):
    _, error = require_moderator()
    if error:
        return error
    data = request.get_json(silent=True) or {}
    estado = (data.get('estado') or '').strip().lower()
    try:
        event = event_repo.update_event_status(event_id, estado)
    except LookupError as exc:
        return json_error(str(exc), 404)
    except ValueError as exc:
        return json_error(str(exc), 400)
    return jsonify({'message': 'Estado actualizado', 'event': event_to_dict(event)})


@mod_bp.route('/mod/products', methods=['GET'])
def list_products_for_moderation():
    _, error = require_moderator()
    if error:
        return error
    estado = request.args.get('estado', 'pendiente')
    products = product_repo.list_products(estado_validacion=estado)
    return jsonify({'products': [product_to_dict(product) for product in products]})


@mod_bp.route('/mod/products/<int:product_id>', methods=['PATCH'])
def update_product_status(product_id: int):
    _, error = require_moderator()
    if error:
        return error
    data = request.get_json(silent=True) or {}
    estado = (data.get('estado_validacion') or data.get('estado') or '').strip().lower()
    try:
        product = product_repo.update_product_status(product_id, estado)
    except LookupError as exc:
        return json_error(str(exc), 404)
    except ValueError as exc:
        return json_error(str(exc), 400)
    return jsonify({'message': 'Estado actualizado', 'product': product_to_dict(product)})
