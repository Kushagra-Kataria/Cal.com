from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional
from app.database import db

router = APIRouter(tags=["Apps"])


class AppUpdate(BaseModel):
    installed: bool


@router.get("/apps")
async def list_apps():
    apps = await db.app.find_many(order={"name": "asc"})
    return {"apps": apps}


@router.put("/apps/{app_id}")
async def toggle_app(app_id: str, body: AppUpdate):
    existing = await db.app.find_unique(where={"id": app_id})
    if not existing:
        raise HTTPException(status_code=404, detail="App not found")

    app = await db.app.update(where={"id": app_id}, data={"installed": body.installed})
    return {"app": app}
