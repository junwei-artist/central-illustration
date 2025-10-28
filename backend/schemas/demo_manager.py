from pydantic import BaseModel

class DemoControlRequest(BaseModel):
    action: str  # "start" or "stop"

class DemoStatusResponse(BaseModel):
    status: str  # "running", "not_running", "starting", "stopping"
    port: int | None = None
    pid: int | None = None

