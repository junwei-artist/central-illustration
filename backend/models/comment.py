from sqlalchemy import Column, Integer, String, DateTime, Text, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from db.session import Base
import uuid
from datetime import datetime


class Comment(Base):
    __tablename__ = "comment"
    
    id = Column(Integer, primary_key=True, index=True)
    content = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Foreign keys
    demo_id = Column(Integer, ForeignKey("demonstration.id"), nullable=False)
    user_id = Column(UUID(as_uuid=True), ForeignKey("app_user.id"), nullable=False)
    
    # Relationships
    demo = relationship("Demonstration", back_populates="comments")
    author = relationship("User", back_populates="comments")

