import redis.asyncio as aioredis
import json
from app.core.config import settings

redis_client = None

async def connect():
    global redis_client
    redis_client = aioredis.from_url(settings.REDIS_URL, decode_responses=True)
    print("✅ Connected to Redis")

async def disconnect():
    if redis_client:
        await redis_client.close()

async def set_workitem_cache(workitem_id: str, data: dict):
    await redis_client.setex(f"wi:{workitem_id}", 300, json.dumps(data))

async def get_workitem_cache(workitem_id: str):
    data = await redis_client.get(f"wi:{workitem_id}")
    return json.loads(data) if data else None

async def delete_workitem_cache(workitem_id: str):
    await redis_client.delete(f"wi:{workitem_id}")

async def set_dashboard_state(data: list):
    await redis_client.setex("dashboard:active", 30, json.dumps(data))

async def get_dashboard_state():
    data = await redis_client.get("dashboard:active")
    return json.loads(data) if data else None

async def increment_signal_counter():
    await redis_client.incr("metrics:signal_count")

async def get_and_reset_signal_counter() -> int:
    count = await redis_client.getdel("metrics:signal_count")
    return int(count) if count else 0