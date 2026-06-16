from flask import Flask, jsonify
from flask_cors import CORS
from sqlalchemy import text
from backend.config import DEFAULT_MOD_EMAIL, DEFAULT_MOD_NAME, DEFAULT_MOD_PASSWORD, FRONTEND_ORIGIN
from backend.entities.base import Base, engine
from backend.routes.auth_routes import auth_bp
from backend.routes.event_routes import event_bp
from backend.routes.mod_routes import mod_bp
from backend.routes.product_routes import product_bp
from backend.routes.user_routes import user_bp

# Construir con la aplicación Flask
def create_app(create_tables: bool = True) -> Flask:
    app = Flask(__name__)

    # Configuración CORS (permitir peticiones seguras con credenciales)
    CORS(
        app,
        resources={r'/api/*': {'origins': FRONTEND_ORIGIN}},
        methods=['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
        supports_credentials=True
    )

    # Registro de los Blueprints asignados a la API
    app.register_blueprint(auth_bp, url_prefix='/api')
    app.register_blueprint(user_bp, url_prefix='/api')
    app.register_blueprint(event_bp, url_prefix='/api')
    app.register_blueprint(mod_bp, url_prefix='/api')
    app.register_blueprint(product_bp, url_prefix='/api')

    # Verificar si el servidor backend responde correctamente
    @app.route('/api/health', methods=['GET'])
    def health():
        return jsonify({'status': 'ok'})

    # Interceptar fallos inesperados del servidor
    @app.errorhandler(500)
    def internal_error(_):
        return jsonify({'error': 'Error interno del servidor'}), 500

    if create_tables:
        initialize_database()

    return app

# Generar la estructura física de la BD
def initialize_database() -> None:
    import backend.entities.user_entity
    import backend.entities.session_entity
    import backend.entities.event_entity
    import backend.entities.product_entity
    from backend.repositories.user_repo import ensure_default_moderator

    Base.metadata.create_all(bind=engine)
    run_light_migrations()
    ensure_default_moderator(DEFAULT_MOD_NAME, DEFAULT_MOD_EMAIL, DEFAULT_MOD_PASSWORD)

# Inyectar alteraciones directas de SQL en las tablas existentes
def run_light_migrations() -> None:
    with engine.begin() as connection:
        connection.execute(text("ALTER TABLE products ADD COLUMN IF NOT EXISTS estado_validacion VARCHAR(20) NOT NULL DEFAULT 'aprobado'"))
        connection.execute(text("ALTER TABLE products ALTER COLUMN estado_validacion SET DEFAULT 'pendiente'"))
        connection.execute(text("CREATE INDEX IF NOT EXISTS idx_products_estado_validacion ON products(estado_validacion)"))
        connection.execute(text("""
            DO $$
            BEGIN
                IF NOT EXISTS (
                    SELECT 1
                    FROM pg_constraint
                    WHERE conname = 'chk_products_estado_validacion'
                ) THEN
                    ALTER TABLE products
                    ADD CONSTRAINT chk_products_estado_validacion
                    CHECK (estado_validacion IN ('pendiente', 'aprobado', 'rechazado'));
                END IF;
            END $$;
        """))

# Inicialización global de la aplicación
app = create_app(create_tables=True)

# Inicializar el servidor web local de desarrollo en el puerto 5000
if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
