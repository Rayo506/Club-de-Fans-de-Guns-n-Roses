from datetime import datetime
from decimal import Decimal, InvalidOperation
from flask import Blueprint, jsonify, request
from backend.repositories import event_repo
from backend.routes.helpers import current_user, event_to_dict, json_error, require_user

# Rutas de la cartelera de eventos
event_bp = Blueprint('events', __name__)

# Limpiar, validar formatos de fecha/hora y verificar las plazas de un evento recibido
def _parse_event_payload(data: dict):
    titulo = (data.get('titulo') or '').strip()
    fecha_raw = (data.get('fecha') or '').strip()
    hora_raw = (data.get('hora') or '').strip()
    localizacion = (data.get('localizacion') or '').strip()
    descripcion = (data.get('descripcion') or '').strip()
    imagen_url = (data.get('imagen_url') or '').strip()
    precio_raw = data.get('precio')
    plazas_raw = data.get('plazas_totales')

    if len(titulo) < 3:
        return None, 'El título debe tener al menos 3 caracteres'
    if not fecha_raw:
        return None, 'La fecha es obligatoria'
    if not hora_raw:
        return None, 'La hora es obligatoria'
    if len(localizacion) < 2:
        return None, 'La localización es obligatoria'
    if len(descripcion) < 10:
        return None, 'La descripción debe tener al menos 10 caracteres'

    try:
        fecha = datetime.strptime(fecha_raw, '%Y-%m-%d').date()
    except ValueError:
        return None, 'La fecha debe usar el formato YYYY-MM-DD'

    try:
        hora = datetime.strptime(hora_raw, '%H:%M').time()
    except ValueError:
        return None, 'La hora debe usar el formato HH:MM'

    try:
        plazas_totales = int(plazas_raw)
    except (TypeError, ValueError):
        return None, 'Las plazas totales deben ser un número entero'
    if plazas_totales <= 0:
        return None, 'Las plazas totales deben ser mayores que cero'

    precio = None
    if precio_raw not in (None, ''):
        try:
            precio = Decimal(str(precio_raw))
        except InvalidOperation:
            return None, 'El precio debe ser un número válido'
        if precio < 0:
            return None, 'El precio no puede ser negativo'

    return {
        'titulo': titulo,
        'fecha': fecha,
        'hora': hora,
        'localizacion': localizacion,
        'precio': precio,
        'plazas_totales': plazas_totales,
        'imagen_url': imagen_url or None,
        'descripcion': descripcion
    }, None

# Listar y filtrar públicamente los eventos aprobados (indicando si está inscrito)
@event_bp.route('/events', methods=['GET'])
def list_public_events():
    search = request.args.get('search')
    lugar = request.args.get('lugar')
    fecha_raw = request.args.get('fecha')
    fecha = None
    if fecha_raw:
        try:
            fecha = datetime.strptime(fecha_raw, '%Y-%m-%d').date()
        except ValueError:
            return json_error('La fecha debe usar el formato YYYY-MM-DD', 400)
    events = event_repo.list_events(estado='aprobado', search=search, fecha=fecha, lugar=lugar)
    user = current_user()
    registered = set()
    if user:
        registered = event_repo.registered_event_ids(user.id, [event.id for event in events])
    return jsonify({'events': [event_to_dict(event, event.id in registered) for event in events]})

# Obtener la información detallada de un evento (pendiente)
@event_bp.route('/events/<int:event_id>', methods=['GET'])
def get_public_event(event_id: int):
    event = event_repo.get_event(event_id)
    if not event:
        return json_error('Evento no encontrado', 404)
    user = current_user()
    if event.estado != 'aprobado':
        if not user or user.role not in ('moderador', 'admin'):
            return json_error('Evento no disponible', 404)
    registrado = event_repo.is_user_registered(event.id, user.id) if user else False
    return jsonify({'event': event_to_dict(event, registrado)})

# Crear y proponer un nuevo evento en el sistema dejándolo a la espera de ser aprobado
@event_bp.route('/events', methods=['POST'])
def create_event():
    user, error = require_user()
    if error:
        return error
    data = request.get_json(silent=True) or {}
    payload, validation_error = _parse_event_payload(data)
    if validation_error:
        return json_error(validation_error, 400)
    event = event_repo.create_event(creator_id=user.id, **payload)
    return jsonify({
        'message': 'Evento enviado. Queda pendiente de validación por moderación',
        'event': event_to_dict(event)
    }), 201

# Inscribir usuario autenticado en un evento
@event_bp.route('/events/<int:event_id>/registrations', methods=['POST'])
def join_event(event_id: int):
    user, error = require_user()
    if error:
        return error
    try:
        event = event_repo.register_user_to_event(event_id, user.id)
    except LookupError as exc:
        return json_error(str(exc), 404)
    except ValueError as exc:
        return json_error(str(exc), 409)
    return jsonify({'message': 'Te has apuntado al evento', 'event': event_to_dict(event, True)})

# Cancelar inscripción usuario autenticado en un evento
@event_bp.route('/events/<int:event_id>/registrations', methods=['DELETE'])
def leave_event(event_id: int):
    user, error = require_user()
    if error:
        return error
    try:
        event = event_repo.unregister_user_from_event(event_id, user.id)
    except LookupError as exc:
        return json_error(str(exc), 404)
    except ValueError as exc:
        return json_error(str(exc), 409)
    return jsonify({'message': 'Te has desapuntado del evento', 'event': event_to_dict(event, False)})