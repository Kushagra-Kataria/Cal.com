from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from dotenv import load_dotenv

load_dotenv()

from app.database import connect_db, disconnect_db, seed_db
from app.routes import event_types, bookings, availability, apps


@asynccontextmanager
async def lifespan(application: FastAPI):
    await connect_db()
    await seed_db()
    yield
    await disconnect_db()


app = FastAPI(title="Cal.com Clone API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(event_types.router, prefix="/api")
app.include_router(bookings.router, prefix="/api")
app.include_router(availability.router, prefix="/api")
app.include_router(apps.router, prefix="/api")


@app.get("/api/health")
async def health():
    return {"status": "ok"}
