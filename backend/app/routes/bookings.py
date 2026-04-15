from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional
from app.database import db

router = APIRouter(tags=["Bookings"])


class BookingCreate(BaseModel):
    event_type_id: str
    attendee_name: str
    attendee_email: str
    date: str
    time: str


@router.get("/bookings")
async def list_bookings(tab: Optional[str] = "upcoming"):
    status_map = {
        "upcoming": "upcoming",
        "unconfirmed": "unconfirmed",
        "recurring": "recurring",
        "past": "completed",
        "cancelled": "cancelled",
    }

    status_filter = status_map.get(tab.lower(), "upcoming") if tab else "upcoming"

    bookings = await db.booking.find_many(
        where={"status": status_filter},
        include={"eventType": True},
        order={"createdAt": "desc"},
    )

    result = []
    for b in bookings:
        result.append({
            "id": b.id,
            "title": b.eventType.name if b.eventType else "Unknown",
            "attendee": b.attendeeName,
            "email": b.attendeeEmail,
            "date": b.date,
            "time": b.time,
            "status": b.status,
            "tab": tab,
            "createdAt": b.createdAt.isoformat() if b.createdAt else None,
        })

    return {"bookings": result}


@router.post("/bookings", status_code=201)
async def create_booking(body: BookingCreate):
    booking = await db.booking.create(
        data={
            "eventTypeId": body.event_type_id,
            "attendeeName": body.attendee_name,
            "attendeeEmail": body.attendee_email,
            "date": body.date,
            "time": body.time,
            "status": "upcoming",
        }
    )
    return {"booking": booking}
