"""Async database engine & session factory for Neon PostgreSQL."""

import os
import re
import ssl
import socket
import subprocess
from urllib.parse import urlparse, urlunparse

import asyncpg
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from app.models import Base, EventType


def _parse_neon_url(raw_url: str):
    """Parse the Neon DATABASE_URL into individual components."""
    parsed = urlparse(raw_url)
    return {
        "user": parsed.username,
        "password": parsed.password,
        "host": parsed.hostname,
        "port": parsed.port or 5432,
        "database": parsed.path.lstrip("/"),
    }


def _resolve_via_google_dns(hostname: str) -> str | None:
    """Use nslookup with Google DNS (8.8.8.8) to resolve a hostname."""
    try:
        result = subprocess.run(
            ["nslookup", hostname, "8.8.8.8"],
            capture_output=True, text=True, timeout=10,
        )
        ipv4_addrs = re.findall(r'\b(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})\b', result.stdout)
        for addr in ipv4_addrs:
            if addr != "8.8.8.8":
                return addr
    except Exception as e:
        print(f"[DB] nslookup failed: {e}")
    return None


# ── Parse the DATABASE_URL ──
_raw_url = os.getenv("DATABASE_URL", "")
_db_config = _parse_neon_url(_raw_url)
_original_hostname = _db_config["host"]

# Check if DNS works, fall back to IP if needed
_neon_endpoint_id = None
try:
    socket.getaddrinfo(_db_config["host"], _db_config["port"])
    print(f"[DB] DNS OK for {_db_config['host']}")
except socket.gaierror:
    print(f"[DB] Local DNS can't resolve {_db_config['host']}, trying Google DNS...")
    ip = _resolve_via_google_dns(_db_config["host"])
    if ip:
        print(f"[DB] Resolved {_db_config['host']} -> {ip}")
        # Extract endpoint ID from hostname (e.g. "ep-fragrant-union-anqtaftw" from "ep-fragrant-union-anqtaftw-pooler.c-6...")
        _neon_endpoint_id = _original_hostname.split(".")[0].replace("-pooler", "")
        _db_config["host"] = ip
        print(f"[DB] Neon endpoint ID: {_neon_endpoint_id}")
    else:
        print(f"[DB] FAILED to resolve {_db_config['host']} via any DNS!")

print(f"[DB] Connecting as {_db_config['user']}@{_db_config['host']}:{_db_config['port']}/{_db_config['database']}")

# SSL context for Neon
_ssl_ctx = ssl.create_default_context()
_ssl_ctx.check_hostname = False
_ssl_ctx.verify_mode = ssl.CERT_NONE


# ── Use a custom async creator to bypass SQLAlchemy URL parsing issues ──
async def _async_creator():
    """Create an asyncpg connection directly with proper Neon params."""
    connect_kwargs = {
        "host": _db_config["host"],
        "port": _db_config["port"],
        "user": _db_config["user"],
        "password": _db_config["password"],
        "database": _db_config["database"],
        "ssl": _ssl_ctx,
    }
    if _neon_endpoint_id:
        connect_kwargs["server_settings"] = {
            "options": f"endpoint={_neon_endpoint_id}",
        }
    return await asyncpg.connect(**connect_kwargs)


engine = create_async_engine(
    "postgresql+asyncpg://",
    async_creator=_async_creator,
    echo=False,
    pool_pre_ping=True,
)
async_session = async_sessionmaker(engine, class_=AsyncSession, expire_on_commit=False)


async def init_db():
    """Create all tables if they don't exist, then seed default data."""
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
        await _ensure_event_types_schema(conn)
    print("[DB] Tables created / verified")
    await seed_db()


async def _ensure_event_types_schema(conn):
    """Patch older event_types schema versions in-place without a migration tool."""
    existing_columns_result = await conn.execute(
        text(
            """
            SELECT column_name
            FROM information_schema.columns
            WHERE table_schema = 'public' AND table_name = 'event_types'
            """
        )
    )
    existing_columns = {row[0] for row in existing_columns_result}

    if "description" not in existing_columns:
        await conn.execute(text("ALTER TABLE event_types ADD COLUMN description TEXT"))
        print("[DB] Added missing column: event_types.description")

    if "updated_at" not in existing_columns:
        await conn.execute(
            text(
                "ALTER TABLE event_types ADD COLUMN updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL"
            )
        )
        print("[DB] Added missing column: event_types.updated_at")


async def close_db():
    await engine.dispose()


async def get_db():
    """FastAPI dependency that yields an async database session."""
    async with async_session() as session:
        try:
            yield session
        finally:
            await session.close()


# ── Seed data ──

SEED_EVENT_TYPES = [
    {"name": "30 min meeting", "slug": "/kushagra-kataria-o6ramp/30min", "duration": 30, "enabled": True},
    {"name": "Secret meeting", "slug": "/kushagra-kataria-o6ramp/secret", "duration": 15, "enabled": False},
    {"name": "15 min meeting", "slug": "/kushagra-kataria-o6ramp/15min", "duration": 15, "enabled": True},
]


async def seed_db():
    """Seed event_types table if it's empty."""
    from sqlalchemy import select, func

    async with async_session() as session:
        result = await session.execute(select(func.count()).select_from(EventType))
        count = result.scalar()
        if count == 0:
            for et_data in SEED_EVENT_TYPES:
                session.add(EventType(**et_data))
            await session.commit()
            print("[DB] Seeded event_types with default data")
        else:
            print(f"[DB] event_types already has {count} rows -- skipping seed")
