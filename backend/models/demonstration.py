from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from db.session import Base
import uuid
from datetime import datetime


class Demonstration(Base):
    __tablename__ = "demonstration"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False, index=True)
    description = Column(Text)
    folder_name = Column(String, unique=True, nullable=False)
    url = Column(String)
    is_visible = Column(Boolean, default=True, index=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Foreign keys
    created_by = Column(UUID(as_uuid=True), ForeignKey("app_user.id"))
    
    # Relationships
    creator = relationship("User", back_populates="created_demos")
    comments = relationship("Comment", back_populates="demo", cascade="all, delete-orphan")

