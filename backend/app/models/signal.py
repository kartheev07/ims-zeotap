from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class Signal(BaseModel):
    component_id: str
    severity: str
    message: str
    timestamp: Optional[datetime] = None

    def __init__(self, **data):
        if 'timestamp' not in data or data['timestamp'] is None:
            data['timestamp'] = datetime.utcnow()
        super().__init__(**data)