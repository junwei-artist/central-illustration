from fastapi import APIRouter, Depends, HTTPException, status
from starlette.requests import Request
from sqlalchemy.orm import Session
from typing import Dict

from db.session import get_db
from models.demonstration import Demonstration
from api.auth import get_current_admin
from core.process_manager import process_manager

router = APIRouter(prefix="/demo-manager", tags=["demo-manager"])


@router.post("/start/{demo_id}", response_model=Dict)
def start_demo(
    demo_id: int,
    current_user = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Start a demo project"""
    demo = db.query(Demonstration).filter(Demonstration.id == demo_id).first()
    if not demo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Demonstration not found"
        )
    
    # Get project path (relative to backend)
    import os
    project_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), '..', 'projects')
    
    result = process_manager.start_demo(demo.folder_name, project_path)
    return result


@router.post("/stop/{demo_id}", response_model=Dict)
def stop_demo(
    demo_id: int,
    current_user = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Stop a demo project"""
    demo = db.query(Demonstration).filter(Demonstration.id == demo_id).first()
    if not demo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Demonstration not found"
        )
    
    result = process_manager.stop_demo(demo.folder_name)
    return result


@router.get("/status/{demo_id}", response_model=Dict)
def get_demo_status(
    demo_id: int,
    request: Request,
    db: Session = Depends(get_db)
):
    """Get status of a demo project (public endpoint)"""
    demo = db.query(Demonstration).filter(Demonstration.id == demo_id).first()
    if not demo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Demonstration not found"
        )
    
    result = process_manager.get_demo_status(demo.folder_name)
    
    # If running, add the URL using client's hostname
    if result['status'] == 'running' and result.get('port'):
        client_host = request.headers.get('host', 'localhost').split(':')[0]
        base_url = f"{request.url.scheme}://{client_host}"
        result['url'] = f"{base_url}:{result['port']}"
    
    return result


@router.get("/redirect/{demo_id}")
def redirect_to_demo(demo_id: int, request: Request, db: Session = Depends(get_db)):
    """Get redirect URL for a demo (public endpoint)"""
    
    demo = db.query(Demonstration).filter(Demonstration.id == demo_id).first()
    if not demo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Demonstration not found"
        )
    
    status_info = process_manager.get_demo_status(demo.folder_name)
    
    if status_info['status'] == 'running' and status_info.get('port'):
        # Use the client's hostname instead of localhost
        client_host = request.headers.get('host', 'localhost').split(':')[0]
        base_url = f"{request.url.scheme}://{client_host}"
        return {
            'url': f"{base_url}:{status_info['port']}",
            'status': 'running',
            'port': status_info['port']
        }
    else:
        return {
            'url': None,
            'status': 'not_running'
        }


@router.get("/all")
def list_all_demos():
    """List all demo processes"""
    return process_manager.list_all()

