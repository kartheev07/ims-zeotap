from motor.motor_asyncio import AsyncIOMotorClient
from app.core.config import settings

client = None
db = None

async def connect():
    global client, db
    client = AsyncIOMotorClient(settings.MONGO_URL)
    db = client["ims_db"]
    print("✅ Connected to MongoDB")

async def disconnect():
    if client:
        client.close()

async def insert_signal(signal_data: dict) -> str:
    result = await db.signals.insert_one(signal_data)
    return str(result.inserted_id)

async def get_signals_by_component(component_id: str):
    cursor = db.signals.find({"component_id": component_id})
    signals = []
    async for doc in cursor:
        doc["_id"] = str(doc["_id"])
        signals.append(doc)
    return signals

async def get_signals_by_workitem(workitem_id: str):
    cursor = db.signals.find({"workitem_id": workitem_id})
    signals = []
    async for doc in cursor:
        doc["_id"] = str(doc["_id"])
        signals.append(doc)
    return signals