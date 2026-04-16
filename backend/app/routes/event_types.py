"""Full CRUD API for Event Types — backed by Neon PostgreSQL."""

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import Optional
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from datetime import datetime, timezone

from app.database import get_db
from app.models import EventType

router = APIRouter(tags=["Event Types"])


# ── Pydantic schemas ──

class EventTypeCreate(BaseModel):
    name: str
    duration: int = 30
    description: Optional[str] = None


class EventTypeUpdate(BaseModel):
    name: Optional[str] = None
    enabled: Optional[bool] = None
    duration: Optional[int] = None
    description: Optional[str] = None


# ── Routes ──

@router.get("/event-types")
async def list_event_types(db: AsyncSession = Depends(get_db)):
    """List all event types, ordered by creation date."""
    result = await db.execute(
        select(EventType).order_by(EventType.created_at.asc())
    )
    events = result.scalars().all()
    return {"eventTypes": [e.to_dict() for e in events]}


@router.get("/event-types/{event_id}")
async def get_event_type(event_id: str, db: AsyncSession = Depends(get_db)):
    """Get a single event type by ID."""
    event = await db.get(EventType, event_id)
    if not event:
        raise HTTPException(status_code=404, detail="Event type not found")
    return {"eventType": event.to_dict()}


@router.post("/event-types", status_code=201)
async def create_event_type(body: EventTypeCreate, db: AsyncSession = Depends(get_db)):
    """Create a new event type."""
    slug = f"/kushagra-kataria-o6ramp/{body.name.strip().lower().replace(' ', '-')}"

    # Ensure unique slug
    result = await db.execute(select(EventType).where(EventType.slug == slug))
    existing = result.scalar_one_or_none()
    if existing:
        slug = f"{slug}-{int(datetime.now(timezone.utc).timestamp())}"

    event = EventType(
        name=body.name.strip(),
        slug=slug,
        duration=body.duration,
        description=body.description,
        enabled=True,
    )
    db.add(event)
    await db.commit()
    await db.refresh(event)
    return {"eventType": event.to_dict()}


@router.put("/event-types/{event_id}")
async def update_event_type(
    event_id: str, body: EventTypeUpdate, db: AsyncSession = Depends(get_db)
):
    """Update an existing event type (partial update)."""
    event = await db.get(EventType, event_id)
    if not event:
        raise HTTPException(status_code=404, detail="Event type not found")

    if body.name is not None:
        event.name = body.name.strip()
        event.slug = f"/kushagra-kataria-o6ramp/{body.name.strip().lower().replace(' ', '-')}"
    if body.enabled is not None:
        event.enabled = body.enabled
    if body.duration is not None:
        event.duration = body.duration
    if body.description is not None:
        event.description = body.description

    event.updated_at = datetime.now(timezone.utc)
    await db.commit()
    await db.refresh(event)
    return {"eventType": event.to_dict()}


@router.delete("/event-types/{event_id}")
async def delete_event_type(event_id: str, db: AsyncSession = Depends(get_db)):
    """Delete an event type by ID."""
    event = await db.get(EventType, event_id)
    if not event:
        raise HTTPException(status_code=404, detail="Event type not found")

    await db.delete(event)
    await db.commit()
    return {"deleted": True}


@router.post("/event-types/{event_id}/duplicate", status_code=201)
async def duplicate_event_type(event_id: str, db: AsyncSession = Depends(get_db)):
    """Duplicate an existing event type."""
    source = await db.get(EventType, event_id)
    if not source:
        raise HTTPException(status_code=404, detail="Event type not found")

    new_slug = f"{source.slug}-copy-{int(datetime.now(timezone.utc).timestamp())}"

    copy = EventType(
        name=f"{source.name} (copy)",
        slug=new_slug,
        duration=source.duration,
        description=source.description,
        enabled=source.enabled,
    )
    db.add(copy)
    await db.commit()
    await db.refresh(copy)
    return {"eventType": copy.to_dict()}
