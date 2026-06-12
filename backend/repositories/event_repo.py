from datetime import date, time
from decimal import Decimal

from sqlalchemy import func
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import joinedload

from backend.entities.base import SessionLocal
from backend.entities.event_entity import EventEntity, EventRegistrationEntity
from backend.entities.user_entity import UserEntity

VALID_EVENT_STATUS = {'pendiente', 'aprobado', 'rechazado'}


def create_event(
    creator_id: int,
    titulo: str,
    fecha: date,
    hora: time,
    localizacion: str,
    precio: Decimal | None,
    plazas_totales: int,
    imagen_url: str | None,
    descripcion: str
) -> EventEntity:
    with SessionLocal() as db:
        event = EventEntity(
            creador_id=creator_id,
            titulo=titulo.strip(),
            fecha=fecha,
            hora=hora,
            localizacion=localizacion.strip(),
            precio=precio,
            plazas_totales=plazas_totales,
            imagen_url=imagen_url.strip() if imagen_url else None,
            descripcion=descripcion.strip(),
            estado='pendiente'
        )
        db.add(event)
        db.commit()
        db.refresh(event)
        event = db.query(EventEntity).options(joinedload(EventEntity.creator)).filter(EventEntity.id == event.id).first()
        return event


def list_events(estado: str = 'aprobado', search: str | None = None, fecha: date | None = None, lugar: str | None = None) -> list[EventEntity]:
    with SessionLocal() as db:
        query = db.query(EventEntity).options(joinedload(EventEntity.creator))
        if estado != 'todos':
            query = query.filter(EventEntity.estado == estado)
        if search:
            pattern = f'%{search.strip()}%'
            query = query.filter(EventEntity.titulo.ilike(pattern))
        if fecha:
            query = query.filter(EventEntity.fecha == fecha)
        if lugar and lugar != 'todos':
            query = query.filter(EventEntity.localizacion.ilike(f'%{lugar}%'))
        return query.order_by(EventEntity.fecha.asc(), EventEntity.hora.asc()).all()


def get_event(event_id: int) -> EventEntity | None:
    with SessionLocal() as db:
        return db.query(EventEntity).options(joinedload(EventEntity.creator)).filter(EventEntity.id == event_id).first()



def registered_event_ids(user_id: int, event_ids: list[int]) -> set[int]:
    if not event_ids:
        return set()
    with SessionLocal() as db:
        rows = (
            db.query(EventRegistrationEntity.event_id)
            .filter(EventRegistrationEntity.user_id == user_id)
            .filter(EventRegistrationEntity.event_id.in_(event_ids))
            .all()
        )
        return {row[0] for row in rows}


def is_user_registered(event_id: int, user_id: int) -> bool:
    with SessionLocal() as db:
        return db.query(EventRegistrationEntity).filter(
            EventRegistrationEntity.event_id == event_id,
            EventRegistrationEntity.user_id == user_id
        ).first() is not None

def update_event_status(event_id: int, estado: str) -> EventEntity:
    if estado not in VALID_EVENT_STATUS:
        raise ValueError('Estado de evento no válido')
    with SessionLocal() as db:
        event = db.query(EventEntity).filter(EventEntity.id == event_id).first()
        if not event:
            raise LookupError('Evento no encontrado')
        event.estado = estado
        db.commit()
        db.refresh(event)
        return db.query(EventEntity).options(joinedload(EventEntity.creator)).filter(EventEntity.id == event_id).first()


def register_user_to_event(event_id: int, user_id: int) -> EventEntity:
    with SessionLocal() as db:
        event = db.query(EventEntity).filter(EventEntity.id == event_id).with_for_update().first()
        if not event:
            raise LookupError('Evento no encontrado')
        if event.estado != 'aprobado':
            raise ValueError('El evento todavía no está disponible')
        if event.plazas_ocupadas >= event.plazas_totales:
            raise ValueError('No quedan plazas disponibles')
        registration = EventRegistrationEntity(event_id=event_id, user_id=user_id)
        db.add(registration)
        try:
            event.plazas_ocupadas += 1
            db.commit()
        except IntegrityError as exc:
            db.rollback()
            raise ValueError('Ya estás apuntado a este evento') from exc
        db.refresh(event)
        return db.query(EventEntity).options(joinedload(EventEntity.creator)).filter(EventEntity.id == event_id).first()



def unregister_user_from_event(event_id: int, user_id: int) -> EventEntity:
    with SessionLocal() as db:
        event = db.query(EventEntity).filter(EventEntity.id == event_id).with_for_update().first()
        if not event:
            raise LookupError('Evento no encontrado')
        registration = db.query(EventRegistrationEntity).filter(
            EventRegistrationEntity.event_id == event_id,
            EventRegistrationEntity.user_id == user_id
        ).first()
        if not registration:
            raise ValueError('No estás apuntado a este evento')
        db.delete(registration)
        event.plazas_ocupadas = max((event.plazas_ocupadas or 0) - 1, 0)
        db.commit()
        db.refresh(event)
        return db.query(EventEntity).options(joinedload(EventEntity.creator)).filter(EventEntity.id == event_id).first()

def count_by_status(estado: str) -> int:
    with SessionLocal() as db:
        return db.query(EventEntity).filter(EventEntity.estado == estado).count()


def dashboard_summary() -> dict:
    with SessionLocal() as db:
        pending_events = db.query(EventEntity).options(joinedload(EventEntity.creator)).filter(EventEntity.estado == 'pendiente').order_by(EventEntity.created_at.desc()).all()
        total_users = db.query(UserEntity).count()
        by_status = dict(db.query(EventEntity.estado, func.count(EventEntity.id)).group_by(EventEntity.estado).all())
        return {
            'pending_events': pending_events,
            'users_count': total_users,
            'events_pending_count': by_status.get('pendiente', 0),
            'events_approved_count': by_status.get('aprobado', 0),
            'events_rejected_count': by_status.get('rechazado', 0)
        }
