from fastapi import APIRouter, Request, HTTPException
from app.models.signal import Signal
from app.core.debouncer import debouncer
from app.core.rate_limiter import rate_limiter
from app.core.alert_strategy import get_alert_strategy
from app.services import mongo_service, postgres_service, redis_service
import uuid

router = APIRouter()

@router.post("/signals")
async def ingest_signal(signal: Signal, request: Request):
    client_ip = request.client.host

    if not rate_limiter.is_allowed(client_ip):
        raise HTTPException(status_code=429, detail="Rate limit exceeded")

    strategy = get_alert_strategy(signal.component_id)
    severity = strategy.get_severity(signal.component_id)

    signal_id = str(uuid.uuid4())
    signal_data = {
        "_id": signal_id,
        "component_id": signal.component_id,
        "severity": severity,
        "message": signal.message,
        "timestamp": signal.timestamp.isoformat(),
        "workitem_id": None
    }
    await mongo_service.insert_signal(signal_data)
    await redis_service.increment_signal_counter()

    workitem_id, is_new = await debouncer.process(
        signal.component_id, signal_id, signal.timestamp
    )

    if is_new:
        wi = {
            "id": workitem_id,
            "component_id": signal.component_id,
            "severity": severity,
            "status": "OPEN",
            "signal_ids": [signal_id]
        }
        await postgres_service.create_workitem(wi)
        await redis_service.set_workitem_cache(workitem_id, wi)
    else:
        await postgres_service.add_signal_to_workitem(workitem_id, signal_id)
        await redis_service.delete_workitem_cache(workitem_id)

    return {
        "signal_id": signal_id,
        "workitem_id": workitem_id,
        "is_new_workitem": is_new,
        "severity": severity,
        "alert": strategy.get_message(signal.component_id)
    }