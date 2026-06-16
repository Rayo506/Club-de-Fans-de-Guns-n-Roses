from sqlalchemy.exc import IntegrityError
from werkzeug.security import check_password_hash, generate_password_hash
from backend.entities.base import SessionLocal
from backend.entities.user_entity import UserEntity
from backend.models.user import User

# Convertir una entidad de la BD (UserEntity) al modelo de dominio (User)
def _to_model(entity: UserEntity | None) -> User | None:
    if not entity:
        return None
    return User(id=entity.id, nombre=entity.nombre, email=entity.email, role=entity.role)

# Registrar un nuevo usuario en la BD encriptando de forma segura su contraseña
def create_user(nombre: str, email: str, password: str, role: str = 'fan') -> User:
    with SessionLocal() as db:
        user = UserEntity(
            nombre=nombre.strip(),
            email=email.strip().lower(),
            password_hash=generate_password_hash(password),
            role=role
        )
        db.add(user)
        try:
            db.commit()
            db.refresh(user)
        except IntegrityError as exc:
            db.rollback()
            raise ValueError('El email ya está registrado') from exc
        return _to_model(user)

# Buscar un usuario por su email y retornar su estructura como modelo de dominio
def get_user_by_email(email: str) -> User | None:
    with SessionLocal() as db:
        entity = db.query(UserEntity).filter(UserEntity.email == email.strip().lower()).first()
        return _to_model(entity)

# Obtener la entidad completa de base de datos de un usuario por su ID
def get_user_entity_by_id(user_id: int) -> UserEntity | None:
    with SessionLocal() as db:
        return db.query(UserEntity).filter(UserEntity.id == user_id).first()

# Obtener la entidad completa de base de datos de un usuario por su email
def get_user_entity_by_email(email: str) -> UserEntity | None:
    with SessionLocal() as db:
        return db.query(UserEntity).filter(UserEntity.email == email.strip().lower()).first()

# Verificar el correo y contraseña en el login comparando los hashes de seguridad
def validate_credentials(email: str, password: str) -> User | None:
    with SessionLocal() as db:
        entity = db.query(UserEntity).filter(UserEntity.email == email.strip().lower()).first()
        if entity and check_password_hash(entity.password_hash, password):
            return _to_model(entity)
        return None

# Contar la cantidad total de usuarios que se encuentran registrados en la BD
def count_users() -> int:
    with SessionLocal() as db:
        return db.query(UserEntity).count()

# Comprobar si existe usuario con el rol moderador (arranque del sistema)
def ensure_default_moderator(nombre: str, email: str, password: str) -> None:
    with SessionLocal() as db:
        normalized_email = email.strip().lower()
        existing = db.query(UserEntity).filter(UserEntity.email == normalized_email).first()
        if existing:
            if existing.role not in ('moderador', 'admin'):
                existing.role = 'moderador'
                db.commit()
            return
        moderator = UserEntity(
            nombre=nombre.strip(),
            email=normalized_email,
            password_hash=generate_password_hash(password),
            role='moderador'
        )
        db.add(moderator)
        db.commit()