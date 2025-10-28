from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class CommentBase(BaseModel):
    content: str


class CommentCreate(CommentBase):
    demo_id: int


class CommentResponse(CommentBase):
    id: int
    demo_id: int
    created_at: datetime
    author_username: Optional[str] = None
    
    class Config:
        from_attributes = True

