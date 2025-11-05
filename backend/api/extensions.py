from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Dict, Optional
from pydantic import BaseModel
import os
import shutil
import json
import subprocess

from db.session import get_db
from models.demonstration import Demonstration
from api.auth import get_current_admin

router = APIRouter(prefix="/extensions", tags=["extensions"])


class ExtensionInfo(BaseModel):
    name: str
    description: str
    path: str
    icon: Optional[str] = None
class CreateFromExtensionRequest(BaseModel):
    title: str
    description: str
    folder_name: str



@router.get("/list", response_model=List[ExtensionInfo])
def list_extensions():
    """List all available template extensions"""
    extensions_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'extensions')
    
    if not os.path.exists(extensions_dir):
        return []
    
    extensions = []
    for item in os.listdir(extensions_dir):
        item_path = os.path.join(extensions_dir, item)
        if os.path.isdir(item_path):
            # Check for template.json or use default info
            template_json = os.path.join(item_path, 'template.json')
            if os.path.exists(template_json):
                try:
                    with open(template_json, 'r') as f:
                        template_data = json.load(f)
                        extensions.append(ExtensionInfo(
                            name=template_data.get('name', item),
                            description=template_data.get('description', ''),
                            path=item,
                            icon=template_data.get('icon')
                        ))
                except:
                    extensions.append(ExtensionInfo(
                        name=item,
                        description='Template extension',
                        path=item
                    ))
            else:
                extensions.append(ExtensionInfo(
                    name=item,
                    description='Template extension',
                    path=item
                ))
    
    return extensions


@router.get("/{extension_name}/info", response_model=Dict)
def get_extension_info(extension_name: str):
    """Get information about a specific extension"""
    extensions_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'extensions')
    extension_path = os.path.join(extensions_dir, extension_name)
    
    if not os.path.exists(extension_path):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Extension not found"
        )
    
    template_json = os.path.join(extension_path, 'template.json')
    info = {
        'name': extension_name,
        'path': extension_path,
        'has_template_json': os.path.exists(template_json)
    }
    
    if os.path.exists(template_json):
        try:
            with open(template_json, 'r') as f:
                info['template_data'] = json.load(f)
        except:
            pass
    
    # List content files structure
    public_dir = os.path.join(extension_path, 'public', 'content')
    if os.path.exists(public_dir):
        info['content_structure'] = get_directory_structure(public_dir)
    
    return info


def get_directory_structure(root_dir: str, current_path: str = '') -> Dict:
    """Recursively get directory structure"""
    structure = {}
    full_path = os.path.join(root_dir, current_path) if current_path else root_dir
    
    if not os.path.exists(full_path):
        return structure
    
    for item in os.listdir(full_path):
        item_path = os.path.join(full_path, item)
        relative_path = os.path.join(current_path, item).replace('\\', '/')
        
        if os.path.isdir(item_path):
            structure[relative_path] = {
                'type': 'directory',
                'children': get_directory_structure(root_dir, relative_path)
            }
        else:
            structure[relative_path] = {
                'type': 'file',
                'size': os.path.getsize(item_path)
            }
    
    return structure


@router.post("/create-from-extension")
def create_project_from_extension(
    extension_name: str,
    data: CreateFromExtensionRequest,
    current_user = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Create a new project from an extension template"""
    # Check if folder_name already exists
    existing = db.query(Demonstration).filter(Demonstration.folder_name == data.folder_name).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Folder name already exists"
        )
    
    # Get paths
    extensions_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'extensions')
    extension_path = os.path.join(extensions_dir, extension_name)
    projects_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), '..', 'projects')
    project_path = os.path.join(projects_dir, data.folder_name)
    
    if not os.path.exists(extension_path):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Extension not found"
        )
    
    if os.path.exists(project_path):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Destination directory already exists"
        )
    
    try:
        # Copy the extension directory
        shutil.copytree(extension_path, project_path, ignore=shutil.ignore_patterns('node_modules', '.next', '*.log', '__pycache__', '.git'))
        
        # Write marker file for extension provenance
        try:
            marker = {
                'extension_name': extension_name
            }
            marker_path = os.path.join(project_path, '.extension.json')
            with open(marker_path, 'w', encoding='utf-8') as f:
                json.dump(marker, f)
        except Exception:
            pass
        
        # Update package.json if needed
        package_json_path = os.path.join(project_path, 'package.json')
        if os.path.exists(package_json_path):
            with open(package_json_path, 'r') as f:
                package_json = json.load(f)
            
            # Update scripts to remove hardcoded ports
            if 'scripts' in package_json:
                for key in package_json['scripts']:
                    for port in ['3001', '3002', '3003', '3004']:
                        package_json['scripts'][key] = package_json['scripts'][key].replace(f' -p {port}', '')
                        package_json['scripts'][key] = package_json['scripts'][key].replace(f' --port {port}', '')
            
            with open(package_json_path, 'w') as f:
                json.dump(package_json, f, indent=2)
        
        # Install dependencies (non-blocking)
        try:
            subprocess.Popen(
                ['npm', 'install'],
                cwd=project_path,
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE
            )
        except:
            pass  # Don't fail if npm install fails
        
        # Create the demo record in the database
        new_demo = Demonstration(
            title=data.title,
            description=data.description,
            folder_name=data.folder_name,
            is_visible=True,
            created_by=current_user.id
        )
        db.add(new_demo)
        db.commit()
        db.refresh(new_demo)
        
        return {
            'status': 'success',
            'demo_id': new_demo.id,
            'folder_name': data.folder_name,
            'message': f'Project created from extension successfully'
        }
        
    except Exception as e:
        # Clean up on error
        if os.path.exists(project_path):
            shutil.rmtree(project_path, ignore_errors=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create project from extension: {str(e)}"
        )


@router.get("/project-extension/{demo_id}", response_model=Dict)
def get_project_extension(
    demo_id: int,
    db: Session = Depends(get_db)
):
    """Return the extension name a demo was created from (if available)"""
    demo = db.query(Demonstration).filter(Demonstration.id == demo_id).first()
    if not demo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )
    import os
    project_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), '..', 'projects', demo.folder_name)
    marker_path = os.path.join(project_path, '.extension.json')
    result: Dict[str, Optional[str]] = { 'extension_name': None }
    try:
        if os.path.exists(marker_path):
            with open(marker_path, 'r', encoding='utf-8') as f:
                data = json.load(f)
                result['extension_name'] = data.get('extension_name')
        else:
            # Fallback: if template.json exists at project root, try to infer name
            template_json = os.path.join(project_path, 'template.json')
            if os.path.exists(template_json):
                with open(template_json, 'r', encoding='utf-8') as f:
                    tpl = json.load(f)
                    # Prefer the extension folder name if present, otherwise name
                    result['extension_name'] = tpl.get('name')
    except Exception:
        pass
    return result

@router.get("/{extension_name}/content/{filepath:path}")
def get_extension_content_file(extension_name: str, filepath: str):
    """Get content from extension template"""
    extensions_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'extensions')
    extension_path = os.path.join(extensions_dir, extension_name, 'public', filepath)
    
    if not os.path.exists(extension_path):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="File not found"
        )
    
    try:
        with open(extension_path, 'r', encoding='utf-8') as f:
            content = f.read()
        return {'content': content}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to read file: {str(e)}"
        )

