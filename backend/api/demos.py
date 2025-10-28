from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from db.session import get_db
from models.demonstration import Demonstration
from models.user import User
from schemas.demonstration import DemonstrationCreate, DemonstrationUpdate, DemonstrationResponse
from api.auth import get_current_admin, get_current_user

router = APIRouter(prefix="/demos", tags=["demos"])


@router.get("/", response_model=List[DemonstrationResponse])
def list_demos(visible_only: bool = True, db: Session = Depends(get_db)):
    """List all demonstrations (public endpoint, filters by visibility)"""
    query = db.query(Demonstration)
    if visible_only:
        query = query.filter(Demonstration.is_visible == True)
    demos = query.order_by(Demonstration.created_at.desc()).all()
    
    # Convert demos to response format
    result = []
    for demo in demos:
        result.append(DemonstrationResponse(
            id=demo.id,
            title=demo.title,
            description=demo.description,
            folder_name=demo.folder_name,
            url=demo.url,
            is_visible=demo.is_visible,
            created_at=demo.created_at,
            updated_at=demo.updated_at or demo.created_at,
            created_by=str(demo.created_by) if demo.created_by else None
        ))
    return result


@router.get("/{demo_id}", response_model=DemonstrationResponse)
def get_demo(demo_id: int, db: Session = Depends(get_db)):
    """Get a specific demonstration"""
    demo = db.query(Demonstration).filter(Demonstration.id == demo_id).first()
    if not demo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Demonstration not found"
        )
    return DemonstrationResponse(
        id=demo.id,
        title=demo.title,
        description=demo.description,
        folder_name=demo.folder_name,
        url=demo.url,
        is_visible=demo.is_visible,
        created_at=demo.created_at,
        updated_at=demo.updated_at or demo.created_at,
        created_by=str(demo.created_by) if demo.created_by else None
    )


@router.post("/", response_model=DemonstrationResponse, status_code=status.HTTP_201_CREATED)
def create_demo(
    demo: DemonstrationCreate,
    current_user: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Create a new demonstration (admin only)"""
    # Check if folder_name already exists
    existing = db.query(Demonstration).filter(Demonstration.folder_name == demo.folder_name).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Folder name already exists"
        )
    
    db_demo = Demonstration(**demo.dict(), created_by=current_user.id)
    db.add(db_demo)
    db.commit()
    db.refresh(db_demo)
    return db_demo


@router.put("/{demo_id}", response_model=DemonstrationResponse)
def update_demo(
    demo_id: int,
    demo_update: DemonstrationUpdate,
    current_user: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Update a demonstration (admin only)"""
    db_demo = db.query(Demonstration).filter(Demonstration.id == demo_id).first()
    if not db_demo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Demonstration not found"
        )
    
    update_data = demo_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_demo, field, value)
    
    db.commit()
    db.refresh(db_demo)
    return db_demo


@router.delete("/{demo_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_demo(
    demo_id: int,
    current_user: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Delete a demonstration (admin only)"""
    db_demo = db.query(Demonstration).filter(Demonstration.id == demo_id).first()
    if not db_demo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Demonstration not found"
        )
    
    db.delete(db_demo)
    db.commit()

