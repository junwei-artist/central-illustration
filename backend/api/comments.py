from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from db.session import get_db
from models.comment import Comment
from models.demonstration import Demonstration
from models.user import User
from schemas.comment import CommentCreate, CommentResponse
from api.auth import get_current_user

router = APIRouter(prefix="/comments", tags=["comments"])


@router.get("/{demo_id}", response_model=List[CommentResponse])
def list_comments(demo_id: int, db: Session = Depends(get_db)):
    """List all comments for a demonstration"""
    demo = db.query(Demonstration).filter(Demonstration.id == demo_id).first()
    if not demo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Demonstration not found"
        )
    
    comments = db.query(Comment).filter(Comment.demo_id == demo_id).order_by(Comment.created_at.asc()).all()
    
    # Convert to response format with username
    response = []
    for comment in comments:
        comment_dict = {
            "id": comment.id,
            "content": comment.content,
            "demo_id": comment.demo_id,
            "created_at": comment.created_at,
            "author_username": comment.author.username
        }
        response.append(CommentResponse(**comment_dict))
    
    return response


@router.post("/", response_model=CommentResponse, status_code=status.HTTP_201_CREATED)
def create_comment(
    comment: CommentCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new comment"""
    # Verify the demo exists
    demo = db.query(Demonstration).filter(Demonstration.id == comment.demo_id).first()
    if not demo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Demonstration not found"
        )
    
    db_comment = Comment(
        content=comment.content,
        demo_id=comment.demo_id,
        user_id=current_user.id
    )
    db.add(db_comment)
    db.commit()
    db.refresh(db_comment)
    
    return {
        "id": db_comment.id,
        "content": db_comment.content,
        "demo_id": db_comment.demo_id,
        "created_at": db_comment.created_at,
        "author_username": db_comment.author.username
    }

