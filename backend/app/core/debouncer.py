import asyncio
from datetime import datetime
from collections import defaultdict

class Debouncer:
    def __init__(self, window_seconds: int = 10):
        self.window_seconds = window_seconds
        self.component_signals = defaultdict(list)
        self.component_workitem = {}
        self.lock = asyncio.Lock()

    async def process(self, component_id: str, signal_id: str, timestamp: datetime):
        async with self.lock:
            now = datetime.utcnow().timestamp()
            window_start = now - self.window_seconds

            self.component_signals[component_id] = [
                (sid, ts) for sid, ts in self.component_signals[component_id]
                if ts > window_start
            ]

            self.component_signals[component_id].append((signal_id, now))

            if component_id in self.component_workitem:
                wi_id, wi_ts = self.component_workitem[component_id]
                if wi_ts > window_start:
                    return wi_id, False

            self.component_workitem[component_id] = (signal_id, now)
            return signal_id, True

debouncer = Debouncer()