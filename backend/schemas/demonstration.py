from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class DemonstrationBase(BaseModel):
    title: str
    description: Optional[str] = None
    folder_name: str
    url: Optional[str] = None
    is_visible: bool = True


class DemonstrationCreate(DemonstrationBase):
    pass


class DemonstrationUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    url: Optional[str] = None
    is_visible: Optional[bool] = None


class DemonstrationResponse(DemonstrationBase):
    id: int
    created_at: datetime
    updated_at: datetime
    created_by: Optional[str] = None
    
    class Config:
        from_attributes = True

