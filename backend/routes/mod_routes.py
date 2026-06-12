from flask import Blueprint, jsonify, request

from backend.repositories import event_repo
from backend.routes.helpers import event_to_dict, json_error, require_moderator, user_to_dict


mod_bp = Blueprint('moderation', __name__)


@mod_bp.route('/mod/dashboard', methods=['GET'])
def dashboard():
    user, error = require_moderator()
    if error:
        return error
    summary = event_repo.dashboard_summary()
    return jsonify({
        'moderator': user_to_dict(user),
        'counts': {
            'productos_pendientes': 0,
            'eventos_pendientes': summary['events_pending_count'],
            'reportes_pendientes': 0,
            'usuarios_registrados': summary['users_count'],
            'eventos_aprobados': summary['events_approved_count'],
            'eventos_rechazados': summary['events_rejected_count']
        },
        'pending_events': [event_to_dict(event) for event in summary['pending_events']],
        'pending_products': [],
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
