import secrets
from datetime import datetime, timedelta

from backend.config import SESSION_MAX_AGE
from backend.entities.base import SessionLocal
from backend.entities.session_entity import SessionEntity
from backend.entities.user_entity import UserEntity
from backend.models.user import User


def _to_model(entity: UserEntity | None) -> User | None:
    if not entity:
        return None
    return User(id=entity.id, nombre=entity.nombre, email=entity.email, role=entity.role)


def create_session(user_id: int) -> str:
    token = secrets.token_urlsafe(48)
    expires_at = datetime.utcnow() + timedelta(seconds=SESSION_MAX_AGE)
    with SessionLocal() as db:
        session_entity = SessionEntity(session_id=token, user_id=user_id, expires_at=expires_at)
        db.add(session_entity)
        db.commit()
    return token


def validate_session(token: str | None) -> User | None:
    if not token:
        return None
    with SessionLocal() as db:
        session_entity = db.query(SessionEntity).filter(SessionEntity.session_id == token).first()
        if not session_entity:
            return None
        if session_entity.expires_at and session_entity.expires_at < datetime.utcnow():
            db.delete(session_entity)
            db.commit()
            return None
        user_entity = db.query(UserEntity).filter(UserEntity.id == session_entity.user_id).first()
        return _to_model(user_entity)


def delete_session(token: str | None) -> None:
    if not token:
        return
    with SessionLocal() as db:
        session_entity = db.query(SessionEntity).filter(SessionEntity.session_id == token).first()
        if session_entity:
            db.delete(session_entity)
            db.commit()
