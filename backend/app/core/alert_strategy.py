from abc import ABC, abstractmethod

class AlertStrategy(ABC):
    @abstractmethod
    def get_severity(self, component_id: str) -> str:
        pass

    @abstractmethod
    def get_message(self, component_id: str) -> str:
        pass

class RDBMSAlertStrategy(AlertStrategy):
    def get_severity(self, component_id: str) -> str:
        return "P0"

    def get_message(self, component_id: str) -> str:
        return f"CRITICAL: Database failure detected on {component_id}. Immediate action required!"

class CacheAlertStrategy(AlertStrategy):
    def get_severity(self, component_id: str) -> str:
        return "P2"

    def get_message(self, component_id: str) -> str:
        return f"WARNING: Cache failure on {component_id}. Performance degraded."

class APIAlertStrategy(AlertStrategy):
    def get_severity(self, component_id: str) -> str:
        return "P1"

    def get_message(self, component_id: str) -> str:
        return f"HIGH: API failure on {component_id}. Users impacted."

class QueueAlertStrategy(AlertStrategy):
    def get_severity(self, component_id: str) -> str:
        return "P2"

    def get_message(self, component_id: str) -> str:
        return f"WARNING: Async queue failure on {component_id}. Processing delayed."

class DefaultAlertStrategy(AlertStrategy):
    def get_severity(self, component_id: str) -> str:
        return "P3"

    def get_message(self, component_id: str) -> str:
        return f"INFO: Anomaly detected on {component_id}."

def get_alert_strategy(component_id: str) -> AlertStrategy:
    cid = component_id.upper()
    if "DB" in cid or "RDBMS" in cid or "POSTGRES" in cid:
        return RDBMSAlertStrategy()
    elif "CACHE" in cid or "REDIS" in cid:
        return CacheAlertStrategy()
    elif "API" in cid or "MCP" in cid:
        return APIAlertStrategy()
    elif "QUEUE" in cid or "KAFKA" in cid:
        return QueueAlertStrategy()
    return DefaultAlertStrategy()