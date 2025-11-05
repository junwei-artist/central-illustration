from fastapi import APIRouter, Depends, HTTPException, status
from starlette.requests import Request
from sqlalchemy.orm import Session
from typing import Dict
from pydantic import BaseModel
import shutil
import subprocess

from db.session import get_db
from models.demonstration import Demonstration
from api.auth import get_current_admin
from core.process_manager import process_manager

router = APIRouter(prefix="/demo-manager", tags=["demo-manager"])


class CreateFromTemplate(BaseModel):
    title: str
    description: str
    folder_name: str
    template_id: int
    is_visible: bool = True


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
    
    # If running, add the proxy URL instead of direct port
    if result['status'] == 'running' and result.get('port'):
        # Preserve port in Host header if present
        host_header = request.headers.get('host', 'localhost')
        base_url = f"{request.url.scheme}://{host_header}"
        # Use proxy endpoint instead of direct port
        result['url'] = f"{base_url}/proxy/{demo_id}"
    
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
        # Use proxy endpoint instead of direct port, keeping port from Host
        host_header = request.headers.get('host', 'localhost')
        base_url = f"{request.url.scheme}://{host_header}"
        return {
            'url': f"{base_url}/proxy/{demo_id}",
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


@router.post("/create-from-template", response_model=Dict)
def create_from_template(
    data: CreateFromTemplate,
    current_user = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Create a new demo from a template"""
    # Get the template demo
    template_demo = db.query(Demonstration).filter(Demonstration.id == data.template_id).first()
    if not template_demo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Template demo not found"
        )
    
    # Check if folder_name already exists
    existing = db.query(Demonstration).filter(Demonstration.folder_name == data.folder_name).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Folder name already exists"
        )
    
    # Get project path
    import os
    project_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), '..', 'projects')
    template_dir = os.path.join(project_path, template_demo.folder_name)
    new_dir = os.path.join(project_path, data.folder_name)
    
    if not os.path.exists(template_dir):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Template directory not found"
        )
    
    if os.path.exists(new_dir):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Destination directory already exists"
        )
    
    try:
        # Copy the template directory
        shutil.copytree(template_dir, new_dir, ignore=shutil.ignore_patterns('node_modules', '.next', '*.log'))
        
        # Update package.json to remove hardcoded ports
        package_json_path = os.path.join(new_dir, 'package.json')
        if os.path.exists(package_json_path):
            import json
            with open(package_json_path, 'r') as f:
                package_json = json.load(f)
            
            # Update scripts to not have hardcoded ports
            if 'scripts' in package_json:
                for key in package_json['scripts']:
                    package_json['scripts'][key] = package_json['scripts'][key].replace(' -p 3001', '')
            
            with open(package_json_path, 'w') as f:
                json.dump(package_json, f, indent=2)
        
        # Install dependencies
        subprocess.run(
            ['npm', 'install'],
            cwd=new_dir,
            capture_output=True,
            timeout=120
        )
        
        # Create the demo record in the database
        new_demo = Demonstration(
            title=data.title,
            description=data.description,
            folder_name=data.folder_name,
            is_visible=data.is_visible,
            created_by=current_user.id
        )
        db.add(new_demo)
        db.commit()
        db.refresh(new_demo)
        
        return {
            'status': 'success',
            'demo_id': new_demo.id,
            'folder_name': data.folder_name,
            'message': f'Demo created from template successfully'
        }
        
    except Exception as e:
        # Clean up on error
        if os.path.exists(new_dir):
            shutil.rmtree(new_dir, ignore_errors=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create demo from template: {str(e)}"
        )

