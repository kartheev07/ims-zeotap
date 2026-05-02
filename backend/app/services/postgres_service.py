import asyncpg
import json
from datetime import datetime
from app.core.config import settings

pool = None

async def connect():
    global pool
    pool = await asyncpg.create_pool(settings.POSTGRES_URL)
    await _create_tables()
    print("✅ Connected to PostgreSQL")

async def disconnect():
    if pool:
        await pool.close()

async def _create_tables():
    async with pool.acquire() as conn:
        await conn.execute("""
            CREATE TABLE IF NOT EXISTS workitems (
                id TEXT PRIMARY KEY,
                component_id TEXT NOT NULL,
                severity TEXT NOT NULL,
                status TEXT NOT NULL DEFAULT 'OPEN',
                signal_ids JSONB DEFAULT '[]',
                rca JSONB,
                created_at TIMESTAMP DEFAULT NOW(),
                updated_at TIMESTAMP DEFAULT NOW()
            )
        """)

async def create_workitem(workitem: dict) -> dict:
    async with pool.acquire() as conn:
        row = await conn.fetchrow("""
            INSERT INTO workitems (id, component_id, severity, status, signal_ids, created_at, updated_at)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING *
        """,
            workitem["id"],
            workitem["component_id"],
            workitem["severity"],
            workitem["status"],
            json.dumps(workitem.get("signal_ids", [])),
            datetime.utcnow(),
            datetime.utcnow()
        )
        return dict(row)

async def get_workitem(workitem_id: str):
    async with pool.acquire() as conn:
        row = await conn.fetchrow(
            "SELECT * FROM workitems WHERE id = $1", workitem_id
        )
        if not row:
            return None
        d = dict(row)
        d['signal_ids'] = json.loads(d['signal_ids']) if d['signal_ids'] else []
        d['rca'] = json.loads(d['rca']) if d['rca'] else None
        d['created_at'] = d['created_at'].isoformat() if d['created_at'] else None
        d['updated_at'] = d['updated_at'].isoformat() if d['updated_at'] else None
        return d

async def get_all_workitems():
    async with pool.acquire() as conn:
        rows = await conn.fetch(
            "SELECT * FROM workitems ORDER BY created_at DESC"
        )
        result = []
        for r in rows:
            d = dict(r)
            d['signal_ids'] = json.loads(d['signal_ids']) if d['signal_ids'] else []
            d['rca'] = json.loads(d['rca']) if d['rca'] else None
            d['created_at'] = d['created_at'].isoformat() if d['created_at'] else None
            d['updated_at'] = d['updated_at'].isoformat() if d['updated_at'] else None
            result.append(d)
        return result

async def update_workitem_status(workitem_id: str, status: str):
    async with pool.acquire() as conn:
        await conn.execute("""
            UPDATE workitems SET status = $1, updated_at = $2 WHERE id = $3
        """, status, datetime.utcnow(), workitem_id)

async def update_workitem_rca(workitem_id: str, rca: dict, status: str):
    async with pool.acquire() as conn:
        await conn.execute("""
            UPDATE workitems SET rca = $1, status = $2, updated_at = $3 WHERE id = $4
        """, json.dumps(rca), status, datetime.utcnow(), workitem_id)

async def add_signal_to_workitem(workitem_id: str, signal_id: str):
    async with pool.acquire() as conn:
        await conn.execute("""
            UPDATE workitems
            SET signal_ids = signal_ids || $1::jsonb, updated_at = $2
            WHERE id = $3
        """, json.dumps([signal_id]), datetime.utcnow(), workitem_id)