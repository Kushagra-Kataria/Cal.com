from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from app.database import db

router = APIRouter(tags=["Event Types"])


class EventTypeCreate(BaseModel):
    name: str
    duration: int = 30


class EventTypeUpdate(BaseModel):
    name: Optional[str] = None
    enabled: Optional[bool] = None
    duration: Optional[int] = None


@router.get("/event-types")
async def list_event_types():
    events = await db.eventtype.find_many(order={"createdAt": "asc"})
    return {"eventTypes": events}


@router.post("/event-types", status_code=201)
async def create_event_type(body: EventTypeCreate):
    slug = f"/kushagra-kataria-o6ramp/{body.name.strip().lower().replace(' ', '-')}"

    # Ensure unique slug
    existing = await db.eventtype.find_first(where={"slug": slug})
    if existing:
        slug = f"{slug}-{len(slug)}"

    event = await db.eventtype.create(
        data={"name": body.name.strip(), "slug": slug, "duration": body.duration, "enabled": True}
    )
    return {"eventType": event}


@router.put("/event-types/{event_id}")
async def update_event_type(event_id: str, body: EventTypeUpdate):
    existing = await db.eventtype.find_unique(where={"id": event_id})
    if not existing:
        raise HTTPException(status_code=404, detail="Event type not found")

    update_data = {}
    if body.name is not None:
        update_data["name"] = body.name.strip()
        update_data["slug"] = f"/kushagra-kataria-o6ramp/{body.name.strip().lower().replace(' ', '-')}"
    if body.enabled is not None:
        update_data["enabled"] = body.enabled
    if body.duration is not None:
        update_data["duration"] = body.duration

    event = await db.eventtype.update(where={"id": event_id}, data=update_data)
    return {"eventType": event}


@router.delete("/event-types/{event_id}")
async def delete_event_type(event_id: str):
    existing = await db.eventtype.find_unique(where={"id": event_id})
    if not existing:
        raise HTTPException(status_code=404, detail="Event type not found")

    await db.eventtype.delete(where={"id": event_id})
    return {"deleted": True}


@router.post("/event-types/{event_id}/duplicate", status_code=201)
async def duplicate_event_type(event_id: str):
    source = await db.eventtype.find_unique(where={"id": event_id})
    if not source:
        raise HTTPException(status_code=404, detail="Event type not found")

    new_slug = f"{source.slug}-copy"
    copy = await db.eventtype.create(
        data={
            "name": f"{source.name} (copy)",
            "slug": new_slug,
            "duration": source.duration,
            "enabled": source.enabled,
        }
    )
    return {"eventType": copy}
