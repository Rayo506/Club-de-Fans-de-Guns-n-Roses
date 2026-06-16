from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

from backend.config import SQLALCHEMY_DATABASE_URI

# Punto de entrada central de SQLAlchemy (comunicación directa)
engine = create_engine(SQLALCHEMY_DATABASE_URI, pool_pre_ping=True, echo=False)
# Crear las Sesiones (en cada "select")
SessionLocal = sessionmaker(bind=engine, autocommit=False, autoflush=False, expire_on_commit=False)
# Clase que heredan todas las entidades
Base = declarative_base()
