from sqlalchemy.exc import IntegrityError
from werkzeug.security import check_password_hash, generate_password_hash

from backend.entities.base import SessionLocal
from backend.entities.user_entity import UserEntity
from backend.models.user import User


def _to_model(entity: UserEntity | None) -> User | None:
    if not entity:
        return None
    return User(id=entity.id, nombre=entity.nombre, email=entity.email, role=entity.role)


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


def get_user_by_email(email: str) -> User | None:
    with SessionLocal() as db:
        entity = db.query(UserEntity).filter(UserEntity.email == email.strip().lower()).first()
        return _to_model(entity)


def get_user_entity_by_id(user_id: int) -> UserEntity | None:
    with SessionLocal() as db:
        return db.query(UserEntity).filter(UserEntity.id == user_id).first()


def get_user_entity_by_email(email: str) -> UserEntity | None:
    with SessionLocal() as db:
        return db.query(UserEntity).filter(UserEntity.email == email.strip().lower()).first()


def validate_credentials(email: str, password: str) -> User | None:
    with SessionLocal() as db:
        entity = db.query(UserEntity).filter(UserEntity.email == email.strip().lower()).first()
        if entity and check_password_hash(entity.password_hash, password):
            return _to_model(entity)
        return None


def count_users() -> int:
    with SessionLocal() as db:
        return db.query(UserEntity).count()


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
