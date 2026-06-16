import re
from flask import Blueprint, jsonify, make_response, request
from backend.config import SESSION_COOKIE_NAME, SESSION_MAX_AGE
from backend.repositories import session_repo, user_repo
from backend.routes.helpers import json_error, user_to_dict

# Ruta de autenticación
auth_bp = Blueprint('auth', __name__)
# Validar que el formato de un email sea correcto
EMAIL_RE = re.compile(r'^[^@\s]+@[^@\s]+\.[^@\s]+$')

# Comprobar si la petición HTTP actual ya cuenta con una sesión de usuario activa
def _has_active_session() -> bool:
    token = request.cookies.get(SESSION_COOKIE_NAME)
    return bool(session_repo.validate_session(token))

# Validar la longitud y el formato de los datos recibidos en el registro
def _validate_register_payload(data: dict):
    nombre = (data.get('nombre') or '').strip()
    email = (data.get('email') or '').strip().lower()
    password = data.get('password') or ''

    if len(nombre) < 2:
        return None, 'El nombre debe tener al menos 2 caracteres'
    if not EMAIL_RE.match(email):
        return None, 'El email no tiene un formato válido'
    if len(password) < 8:
        return None, 'La contraseña debe tener al menos 8 caracteres'
    return {'nombre': nombre, 'email': email, 'password': password}, None

# Procesar el registro de nuevas cuentas de usuario (comprovacion del formato)
@auth_bp.route('/auth/register', methods=['POST'])
def register():
    if _has_active_session():
        return json_error('Ya hay una sesión iniciada. Cierra sesión antes de registrar otra cuenta', 409)
    data = request.get_json(silent=True) or {}
    payload, error = _validate_register_payload(data)
    if error:
        return json_error(error, 400)
    try:
        user = user_repo.create_user(
            nombre=payload['nombre'],
            email=payload['email'],
            password=payload['password'],
            role='fan'
        )
    except ValueError as exc:
        return json_error(str(exc), 409)
    return jsonify({'message': 'Usuario registrado correctamente', 'user': user_to_dict(user)}), 201

# Autenticar las credenciales del usuario 
@auth_bp.route('/auth/login', methods=['POST'])
def login():
    if _has_active_session():
        return json_error('Ya hay una sesión iniciada. Cierra sesión antes de entrar con otra cuenta', 409)
    data = request.get_json(silent=True) or {}
    email = (data.get('email') or '').strip().lower()
    password = data.get('password') or ''

    if not email or not password:
        return json_error('Email y contraseña requeridos', 400)

    user = user_repo.validate_credentials(email, password)
    if not user:
        return json_error('Credenciales incorrectas', 401)

    token = session_repo.create_session(user.id)
    response = make_response(jsonify({'message': 'Login correcto', 'user': user_to_dict(user)}))
    response.set_cookie(
        key=SESSION_COOKIE_NAME,
        value=token,
        max_age=SESSION_MAX_AGE,
        path='/api',
        httponly=True,
        samesite='Lax'
    )
    return response

# Eliminar la sesión
@auth_bp.route('/auth/logout', methods=['POST'])
def logout():
    token = request.cookies.get(SESSION_COOKIE_NAME)
    session_repo.delete_session(token)
    response = make_response(jsonify({'message': 'Sesión cerrada'}))
    response.delete_cookie(key=SESSION_COOKIE_NAME, path='/api')
    return response