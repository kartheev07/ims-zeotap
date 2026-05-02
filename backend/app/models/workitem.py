from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class RCA(BaseModel):
    start_time: datetime
    end_time: datetime
    root_cause_category: str
    fix_applied: str
    prevention_steps: str
    mttr_minutes: Optional[float] = None

class WorkItem(BaseModel):
    id: Optional[str] = None
    component_id: str
    severity: str
    status: str = "OPEN"
    signal_ids: List[str] = []
    rca: Optional[RCA] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None