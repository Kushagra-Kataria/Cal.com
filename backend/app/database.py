from prisma import Prisma
from prisma import Json

db = Prisma()


async def connect_db():
    await db.connect()


async def disconnect_db():
    await db.disconnect()


SEED_EVENT_TYPES = [
    {"name": "30 min meeting", "slug": "/kushagra-kataria-o6ramp/30min", "duration": 30, "enabled": True},
    {"name": "Secret meeting", "slug": "/kushagra-kataria-o6ramp/secret", "duration": 15, "enabled": False},
    {"name": "15 min meeting", "slug": "/kushagra-kataria-o6ramp/15min", "duration": 15, "enabled": True},
]

SEED_AVAILABILITY = {
    "name": "Working hours",
    "timezone": "Europe/London",
    "is_default": True,
    "schedule": {
        "Monday": {"from": "09:00", "to": "17:00"},
        "Tuesday": {"from": "09:00", "to": "17:00"},
        "Wednesday": {"from": "09:00", "to": "17:00"},
        "Thursday": {"from": "09:00", "to": "17:00"},
        "Friday": {"from": "09:00", "to": "17:00"},
    },
}

SEED_APPS = [
    {"name": "Google Calendar", "description": "Sync your Google Calendar", "icon": "📅", "installed": True},
    {"name": "Zoom", "description": "Video conferencing", "icon": "📹", "installed": True},
    {"name": "Google Meet", "description": "Video conferencing", "icon": "🎥", "installed": False},
    {"name": "Stripe", "description": "Collect payments", "icon": "💳", "installed": False},
    {"name": "Zapier", "description": "Automation workflows", "icon": "⚡", "installed": False},
    {"name": "Hubspot", "description": "CRM integration", "icon": "🔶", "installed": False},
]

SEED_BOOKINGS = [
    {
        "attendee_name": "John Doe",
        "attendee_email": "john@example.com",
        "date": "2025-04-10",
        "time": "10:00 AM – 10:30 AM",
        "status": "completed",
    },
    {
        "attendee_name": "Jane Smith",
        "attendee_email": "jane@example.com",
        "date": "2025-04-08",
        "time": "2:00 PM – 2:15 PM",
        "status": "completed",
    },
    {
        "attendee_name": "Bob Wilson",
        "attendee_email": "bob@example.com",
        "date": "2025-04-05",
        "time": "9:00 AM – 9:30 AM",
        "status": "cancelled",
    },
]


async def seed_db():
    """Seed the database with default data if tables are empty."""

    # Seed event types
    count = await db.eventtype.count()
    if count == 0:
        for et in SEED_EVENT_TYPES:
            await db.eventtype.create(data=et)
        print("[OK] Seeded event_types")

    # Seed availability
    count = await db.availabilityschedule.count()
    if count == 0:
        await db.availabilityschedule.create(
            data={
                "name": SEED_AVAILABILITY["name"],
                "timezone": SEED_AVAILABILITY["timezone"],
                "isDefault": SEED_AVAILABILITY["is_default"],
                "schedule": Json(SEED_AVAILABILITY["schedule"]),
            }
        )
        print("[OK] Seeded availability_schedules")

    # Seed apps
    count = await db.app.count()
    if count == 0:
        for app_data in SEED_APPS:
            await db.app.create(data=app_data)
        print("[OK] Seeded apps")

    # Seed bookings
    count = await db.booking.count()
    if count == 0:
        # Get the first event type to link bookings to
        first_event = await db.eventtype.find_first()
        if first_event:
            for b in SEED_BOOKINGS:
                await db.booking.create(
                    data={
                        "eventTypeId": first_event.id,
                        "attendeeName": b["attendee_name"],
                        "attendeeEmail": b["attendee_email"],
                        "date": b["date"],
                        "time": b["time"],
                        "status": b["status"],
                    }
                )
            print("[OK] Seeded bookings")
