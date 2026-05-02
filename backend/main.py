import asyncio
import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import signals, workitems, health
from app.services import mongo_service, postgres_service, redis_service

app = FastAPI(title="Incident Management System", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health.router, tags=["Health"])
app.include_router(signals.router, prefix="/api", tags=["Signals"])
app.include_router(workitems.router, prefix="/api", tags=["WorkItems"])

async def metrics_printer():
    while True:
        await asyncio.sleep(5)
        count = await redis_service.get_and_reset_signal_counter()
        print(f"📊 Throughput: {count / 5:.1f} signals/sec (last 5s: {count} signals)")

@app.on_event("startup")
async def startup():
    await mongo_service.connect()
    await postgres_service.connect()
    await redis_service.connect()
    asyncio.create_task(metrics_printer())
    print("🚀 IMS Backend started!")

@app.on_event("shutdown")
async def shutdown():
    await mongo_service.disconnect()
    await postgres_service.disconnect()
    await redis_service.disconnect()

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)