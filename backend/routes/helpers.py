from decimal import Decimal

from flask import jsonify, request

from backend.config import SESSION_COOKIE_NAME
from backend.repositories import session_repo


def json_error(message: str, status_code: int):
    return jsonify({'error': message}), status_code


def current_user():
    token = request.cookies.get(SESSION_COOKIE_NAME)
    return session_repo.validate_session(token)


def require_user():
    user = current_user()
    if not user:
        return None, json_error('No autenticado', 401)
    return user, None


def require_moderator():
    user, error = require_user()
    if error:
        return None, error
    if user.role not in ('moderador', 'admin'):
        return None, json_error('No tienes permiso para acceder a esta zona', 403)
    return user, None


def decimal_to_float(value):
    if value is None:
        return None
    if isinstance(value, Decimal):
        return float(value)
    return value


def event_to_dict(event):
    return {
        'id': event.id,
        'titulo': event.titulo,
        'creador': event.creator.nombre if event.creator else 'Usuario',
        'creador_email': event.creator.email if event.creator else None,
        'fecha': event.fecha.isoformat() if event.fecha else None,
        'hora': event.hora.strftime('%H:%M') if event.hora else None,
        'localizacion': event.localizacion,
        'precio': decimal_to_float(event.precio),
        'plazas_totales': event.plazas_totales,
        'plazas_ocupadas': event.plazas_ocupadas,
        'plazas_disponibles': max(event.plazas_totales - event.plazas_ocupadas, 0),
        'imagen_url': event.imagen_url,
        'descripcion': event.descripcion,
        'estado': event.estado,
        'created_at': event.created_at.isoformat() if event.created_at else None,
        'updated_at': event.updated_at.isoformat() if event.updated_at else None
    }


def user_to_dict(user):
    return {
        'id': user.id,
        'nombre': user.nombre,
        'email': user.email,
        'role': user.role
    }
