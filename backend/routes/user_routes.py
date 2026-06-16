from flask import Blueprint, jsonify
from backend.routes.helpers import require_user, user_to_dict

# Rutas de gestión de usuarios 
user_bp = Blueprint('users', __name__)

# Obtener el perfil detallado del usuario actual
@user_bp.route('/users/me', methods=['GET'])
def me():
    user, error = require_user()
    if error:
        return error
    return jsonify({'user': user_to_dict(user)})