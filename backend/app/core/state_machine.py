from abc import ABC, abstractmethod

class WorkItemState(ABC):
    @abstractmethod
    def next_state(self) -> str:
        pass

    @abstractmethod
    def can_close(self) -> bool:
        pass

class OpenState(WorkItemState):
    def next_state(self) -> str:
        return "INVESTIGATING"

    def can_close(self) -> bool:
        return False

class InvestigatingState(WorkItemState):
    def next_state(self) -> str:
        return "RESOLVED"

    def can_close(self) -> bool:
        return False

class ResolvedState(WorkItemState):
    def next_state(self) -> str:
        return "CLOSED"

    def can_close(self) -> bool:
        return True

class ClosedState(WorkItemState):
    def next_state(self) -> str:
        return "CLOSED"

    def can_close(self) -> bool:
        return True

STATE_MAP = {
    "OPEN": OpenState(),
    "INVESTIGATING": InvestigatingState(),
    "RESOLVED": ResolvedState(),
    "CLOSED": ClosedState(),
}

def get_state(status: str) -> WorkItemState:
    return STATE_MAP.get(status, OpenState())

def transition(current_status: str) -> str:
    state = get_state(current_status)
    return state.next_state()

def can_close(current_status: str) -> bool:
    state = get_state(current_status)
    return state.can_close()