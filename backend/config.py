import os

# Credenciales de conexión por defecto hacia la base de datos PostgreSQL
DB_USER = os.getenv('DB_USER', 'gnr_user')
DB_PASSWORD = os.getenv('DB_PASSWORD', 'gnr_password')
DB_HOST = os.getenv('DB_HOST', 'localhost')
DB_PORT = os.getenv('DB_PORT', '5432')
DB_NAME = os.getenv('DB_NAME', 'gnr_fans_db')

# Estructurar la URI (SQLAlchemy)
SQLALCHEMY_DATABASE_URI = os.getenv(
    'DATABASE_URL',
    f'postgresql+psycopg2://{DB_USER}:{DB_PASSWORD}@{DB_HOST}:{DB_PORT}/{DB_NAME}'
)
SQLALCHEMY_TRACK_MODIFICATIONS = False

# Directivas de seguridad del frontend, el nombre de la cookie y el tiempo de vida máximo de la sesión
FRONTEND_ORIGIN = os.getenv('FRONTEND_ORIGIN', 'http://localhost:3000')
SESSION_COOKIE_NAME = os.getenv('SESSION_COOKIE_NAME', 'gnr_session')
SESSION_MAX_AGE = int(os.getenv('SESSION_MAX_AGE', '86400'))

# Credenciales iniciales de la cuenta de moderación automática que se creará por defecto
DEFAULT_MOD_NAME = os.getenv('DEFAULT_MOD_NAME', 'Moderador')
DEFAULT_MOD_EMAIL = os.getenv('DEFAULT_MOD_EMAIL', 'moderador@gnr.local')
DEFAULT_MOD_PASSWORD = os.getenv('DEFAULT_MOD_PASSWORD', 'moderador123')