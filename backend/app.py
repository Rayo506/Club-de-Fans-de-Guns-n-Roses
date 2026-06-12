from flask import Flask, jsonify
from flask_cors import CORS

from backend.config import DEFAULT_MOD_EMAIL, DEFAULT_MOD_NAME, DEFAULT_MOD_PASSWORD, FRONTEND_ORIGIN
from backend.entities.base import Base, engine
from backend.routes.auth_routes import auth_bp
from backend.routes.event_routes import event_bp
from backend.routes.mod_routes import mod_bp
from backend.routes.product_routes import product_bp
from backend.routes.user_routes import user_bp


def create_app(create_tables: bool = True) -> Flask:
    app = Flask(__name__)

    CORS(
        app,
        resources={r'/api/*': {'origins': FRONTEND_ORIGIN}},
        methods=['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
        supports_credentials=True
    )

    app.register_blueprint(auth_bp, url_prefix='/api')
    app.register_blueprint(user_bp, url_prefix='/api')
    app.register_blueprint(event_bp, url_prefix='/api')
    app.register_blueprint(mod_bp, url_prefix='/api')
    app.register_blueprint(product_bp, url_prefix='/api')

    @app.route('/api/health', methods=['GET'])
    def health():
        return jsonify({'status': 'ok'})

    @app.errorhandler(500)
    def internal_error(_):
        return jsonify({'error': 'Error interno del servidor'}), 500

    if create_tables:
        initialize_database()

    return app


def initialize_database() -> None:
    import backend.entities.user_entity
    import backend.entities.session_entity
    import backend.entities.event_entity
    import backend.entities.product_entity
    from backend.repositories.user_repo import ensure_default_moderator

    Base.metadata.create_all(bind=engine)
    ensure_default_moderator(DEFAULT_MOD_NAME, DEFAULT_MOD_EMAIL, DEFAULT_MOD_PASSWORD)


app = create_app(create_tables=True)


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
