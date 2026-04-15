from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from prisma import Json
from app.database import db

router = APIRouter(tags=["Availability"])


class ScheduleCreate(BaseModel):
    name: str
    timezone: str = "Europe/London"
    schedule: dict = {}


@router.get("/availability")
async def list_schedules():
    schedules = await db.availabilityschedule.find_many(order={"createdAt": "asc"})
    return {"schedules": schedules}


@router.post("/availability", status_code=201)
async def create_schedule(body: ScheduleCreate):
    schedule = await db.availabilityschedule.create(
        data={
            "name": body.name,
            "timezone": body.timezone,
            "isDefault": False,
            "schedule": Json(body.schedule),
        }
    )
    return {"schedule": schedule}


@router.delete("/availability/{schedule_id}")
async def delete_schedule(schedule_id: str):
    existing = await db.availabilityschedule.find_unique(where={"id": schedule_id})
    if not existing:
        raise HTTPException(status_code=404, detail="Schedule not found")

    await db.availabilityschedule.delete(where={"id": schedule_id})
    return {"deleted": True}
