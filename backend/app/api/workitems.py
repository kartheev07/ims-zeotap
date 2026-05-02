from fastapi import APIRouter, HTTPException
from app.models.workitem import RCA
from app.core.state_machine import transition, can_close
from app.services import postgres_service, redis_service, mongo_service
from datetime import datetime

router = APIRouter()

@router.get("/workitems")
async def get_all_workitems():
    cached = await redis_service.get_dashboard_state()
    if cached:
        return cached

    workitems = await postgres_service.get_all_workitems()
    result = []
    for wi in workitems:
        wi["signal_ids"] = wi.get("signal_ids") or []
        wi["rca"] = wi.get("rca") or None
        result.append(wi)

    await redis_service.set_dashboard_state(result)
    return result

@router.get("/workitems/{workitem_id}")
async def get_workitem(workitem_id: str):
    cached = await redis_service.get_workitem_cache(workitem_id)
    if cached:
        signals = await mongo_service.get_signals_by_workitem(workitem_id)
        cached["signals"] = signals
        return cached

    wi = await postgres_service.get_workitem(workitem_id)
    if not wi:
        raise HTTPException(status_code=404, detail="Work item not found")

    signals = await mongo_service.get_signals_by_workitem(workitem_id)
    wi["signals"] = signals
    return wi

@router.patch("/workitems/{workitem_id}/transition")
async def transition_workitem(workitem_id: str):
    wi = await postgres_service.get_workitem(workitem_id)
    if not wi:
        raise HTTPException(status_code=404, detail="Work item not found")

    new_status = transition(wi["status"])

    if new_status == "CLOSED" and not wi.get("rca"):
        raise HTTPException(
            status_code=400,
            detail="Cannot close without a completed RCA. Please submit RCA first."
        )

    await postgres_service.update_workitem_status(workitem_id, new_status)
    await redis_service.delete_workitem_cache(workitem_id)
    await redis_service.delete_workitem_cache("dashboard:active")

    return {"workitem_id": workitem_id, "new_status": new_status}

@router.post("/workitems/{workitem_id}/rca")
async def submit_rca(workitem_id: str, rca: RCA):
    wi = await postgres_service.get_workitem(workitem_id)
    if not wi:
        raise HTTPException(status_code=404, detail="Work item not found")

    delta = rca.end_time - rca.start_time
    mttr = round(delta.total_seconds() / 60, 2)

    rca_data = {
        "start_time": rca.start_time.isoformat(),
        "end_time": rca.end_time.isoformat(),
        "root_cause_category": rca.root_cause_category,
        "fix_applied": rca.fix_applied,
        "prevention_steps": rca.prevention_steps,
        "mttr_minutes": mttr
    }

    await postgres_service.update_workitem_rca(workitem_id, rca_data, "RESOLVED")
    await redis_service.delete_workitem_cache(workitem_id)

    return {
        "workitem_id": workitem_id,
        "status": "RESOLVED",
        "mttr_minutes": mttr,
        "message": "RCA submitted. You can now close this work item."
    }