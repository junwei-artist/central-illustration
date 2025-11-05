from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import Dict, Optional, List, Any
from pydantic import BaseModel
import os
import json

from db.session import get_db
from models.demonstration import Demonstration
from api.auth import get_current_admin

router = APIRouter(prefix="/content-editor", tags=["content-editor"])


class PageContentUpdate(BaseModel):
    page_index: int
    content_type: str  # 'title' or 'points' or 'detail'
    content: str


class AddPageRequest(BaseModel):
    base_page_index: int  # 0 for page-1 style, 1 for page-2 style
    page_data: dict


class LayoutItem(BaseModel):
    id: str
    type: str  # 'text' | 'image' | 'svg'
    content: Optional[str] = None  # for text, svg markup, or image src
    x: float
    y: float
    width: float
    height: float
    style: Optional[Dict[str, Any]] = None


class LayoutUpdate(BaseModel):
    items: List[LayoutItem]


class PublishRequest(BaseModel):
    page_index: Optional[int] = None  # None means publish all


@router.get("/{demo_id}/pages")
def get_project_pages(demo_id: int, db: Session = Depends(get_db)):
    """Get list of pages in a project"""
    demo = db.query(Demonstration).filter(Demonstration.id == demo_id).first()
    if not demo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )
    
    # Get project path
    project_path = os.path.join(
        os.path.dirname(os.path.dirname(__file__)),
        '..',
        'projects',
        demo.folder_name
    )
    
    if not os.path.exists(project_path):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project directory not found"
        )
    
    # Check for page structure
    content_dir = os.path.join(project_path, 'public', 'content')
    pages = []
    
    if os.path.exists(content_dir):
        for item in sorted(os.listdir(content_dir)):
            page_dir = os.path.join(content_dir, item)
            if os.path.isdir(page_dir) and item.startswith('page-'):
                page_num = item.replace('page-', '')
                try:
                    page_index = int(page_num)
                    page_info = {
                        'page_index': page_index,
                        'page_number': page_index,
                        'title_content': '',
                        'points_content': '',
                        'has_detail': False
                    }
                    
                    # Check for title.md
                    title_file = os.path.join(page_dir, 'title.md')
                    if os.path.exists(title_file):
                        with open(title_file, 'r', encoding='utf-8') as f:
                            page_info['title_content'] = f.read()
                    
                    # Check for points.md
                    points_file = os.path.join(page_dir, 'points.md')
                    if os.path.exists(points_file):
                        with open(points_file, 'r', encoding='utf-8') as f:
                            page_info['points_content'] = f.read()
                    
                    # Check for detail.md
                    detail_file = os.path.join(page_dir, 'detail.md')
                    page_info['has_detail'] = os.path.exists(detail_file)
                    
                    pages.append(page_info)
                except ValueError:
                    pass
    
    return {'pages': pages}


def _project_root_for_demo(demo: Demonstration) -> str:
    import os
    return os.path.join(
        os.path.dirname(os.path.dirname(__file__)),
        '..',
        'projects',
        demo.folder_name
    )


@router.get("/{demo_id}/page/{page_index}/layout")
def get_page_layout(demo_id: int, page_index: int, db: Session = Depends(get_db)):
    demo = db.query(Demonstration).filter(Demonstration.id == demo_id).first()
    if not demo:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")
    import os, json
    project_path = _project_root_for_demo(demo)
    layout_path = os.path.join(project_path, 'public', 'content', f'page-{page_index}', 'layout.json')
    if not os.path.exists(layout_path):
        return { 'items': [] }
    try:
        with open(layout_path, 'r', encoding='utf-8') as f:
            return json.load(f)
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Failed to read layout: {str(e)}")


@router.put("/{demo_id}/page/{page_index}/layout")
def save_page_layout(
    demo_id: int,
    page_index: int,
    layout: LayoutUpdate,
    current_user = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    demo = db.query(Demonstration).filter(Demonstration.id == demo_id).first()
    if not demo:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")
    import os, json
    project_path = _project_root_for_demo(demo)
    page_dir = os.path.join(project_path, 'public', 'content', f'page-{page_index}')
    os.makedirs(page_dir, exist_ok=True)
    layout_path = os.path.join(page_dir, 'layout.json')
    try:
        with open(layout_path, 'w', encoding='utf-8') as f:
            json.dump({ 'items': [item.dict() for item in layout.items] }, f, ensure_ascii=False, indent=2)
        return { 'status': 'success' }
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Failed to save layout: {str(e)}")


@router.post("/{demo_id}/upload")
def upload_asset(
    demo_id: int,
    file: UploadFile = File(...),
    current_user = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    demo = db.query(Demonstration).filter(Demonstration.id == demo_id).first()
    if not demo:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Project not found")
    import os, shutil, uuid
    project_path = _project_root_for_demo(demo)
    uploads_dir = os.path.join(project_path, 'public', 'uploads')
    os.makedirs(uploads_dir, exist_ok=True)
    # Safe filename
    ext = os.path.splitext(file.filename or '')[1]
    safe_name = f"{uuid.uuid4().hex}{ext}"
    dest_path = os.path.join(uploads_dir, safe_name)
    try:
        with open(dest_path, 'wb') as out:
            shutil.copyfileobj(file.file, out)
        # Return public path relative to project root static serving
        return { 'status': 'success', 'path': f"/uploads/{safe_name}" }
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Failed to upload: {str(e)}")


@router.get("/{demo_id}/page/{page_index}/{content_type}")
def get_page_content(
    demo_id: int,
    page_index: int,
    content_type: str,
    db: Session = Depends(get_db)
):
    """Get content for a specific page and type"""
    if content_type not in ['title', 'points', 'detail']:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid content type"
        )
    
    demo = db.query(Demonstration).filter(Demonstration.id == demo_id).first()
    if not demo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )
    
    # Get project path
    project_path = os.path.join(
        os.path.dirname(os.path.dirname(__file__)),
        '..',
        'projects',
        demo.folder_name
    )
    
    page_folder = f"page-{page_index}"
    content_file = os.path.join(project_path, 'public', 'content', page_folder, f'{content_type}.md')
    
    if not os.path.exists(content_file):
        return {'content': ''}
    
    try:
        with open(content_file, 'r', encoding='utf-8') as f:
            content = f.read()
        return {'content': content}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to read content: {str(e)}"
        )


@router.put("/{demo_id}/page/{page_index}/{content_type}")
def update_page_content(
    demo_id: int,
    page_index: int,
    content_type: str,
    request: PageContentUpdate,
    current_user = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Update content for a specific page and type"""
    if content_type not in ['title', 'points', 'detail']:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid content type"
        )
    
    demo = db.query(Demonstration).filter(Demonstration.id == demo_id).first()
    if not demo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )
    
    # Get project path
    project_path = os.path.join(
        os.path.dirname(os.path.dirname(__file__)),
        '..',
        'projects',
        demo.folder_name
    )
    
    page_folder = f"page-{page_index}"
    content_dir = os.path.join(project_path, 'public', 'content', page_folder)
    
    # Create directory if it doesn't exist
    os.makedirs(content_dir, exist_ok=True)
    
    content_file = os.path.join(content_dir, f'{content_type}.md')
    
    try:
        # Write content
        with open(content_file, 'w', encoding='utf-8') as f:
            f.write(request.content)
        
        return {
            'status': 'success',
            'message': f'Content updated for page {page_index}'
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update content: {str(e)}"
        )


@router.post("/{demo_id}/add-page")
def add_page(
    demo_id: int,
    request: AddPageRequest,
    current_user = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Add a new page to the project"""
    demo = db.query(Demonstration).filter(Demonstration.id == demo_id).first()
    if not demo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )
    
    # Get project path
    project_path = os.path.join(
        os.path.dirname(os.path.dirname(__file__)),
        '..',
        'projects',
        demo.folder_name
    )
    
    content_dir = os.path.join(project_path, 'public', 'content')
    
    # Find the next available page index
    existing_pages = []
    if os.path.exists(content_dir):
        for item in os.listdir(content_dir):
            if item.startswith('page-'):
                try:
                    existing_pages.append(int(item.replace('page-', '')))
                except ValueError:
                    pass
    
    next_index = max(existing_pages, default=0) + 1
    base_page_index = request.base_page_index
    
    # Get base template from extension
    extensions_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'extensions')
    base_extension = 'orange-template'  # Default extension
    template_page_dir = os.path.join(
        extensions_dir, base_extension, 'public', 'content', f'page-{base_page_index + 1}'
    )
    
    new_page_dir = os.path.join(content_dir, f'page-{next_index}')
    
    try:
        # Create new page directory
        os.makedirs(new_page_dir, exist_ok=True)
        
        # Copy base template files
        if os.path.exists(template_page_dir):
            for filename in ['title.md', 'points.md', 'detail.md']:
                template_file = os.path.join(template_page_dir, filename)
                new_file = os.path.join(new_page_dir, filename)
                if os.path.exists(template_file):
                    with open(template_file, 'r', encoding='utf-8') as src:
                        with open(new_file, 'w', encoding='utf-8') as dst:
                            dst.write(src.read())
        else:
            # Create empty files if template doesn't exist
            for filename in ['title.md', 'points.md', 'detail.md']:
                open(os.path.join(new_page_dir, filename), 'w').close()
        
        return {
            'status': 'success',
            'page_index': next_index,
            'message': f'Page {next_index} added successfully'
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to add page: {str(e)}"
        )


@router.post("/{demo_id}/publish")
def publish_changes(
    demo_id: int,
    request: PublishRequest,
    current_user = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Publish changes to the project"""
    demo = db.query(Demonstration).filter(Demonstration.id == demo_id).first()
    if not demo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )
    
    # For now, we'll just rebuild the project if it's running
    # In a real scenario, you might want to trigger a rebuild or deployment
    
    from core.process_manager import process_manager
    
    # Check if demo is running
    status_info = process_manager.get_demo_status(demo.folder_name)
    
    if status_info.get('status') == 'running':
        # Note: This is a placeholder. In production, you would:
        # 1. Rebuild the Next.js project
        # 2. Restart the dev server or deploy to production
        return {
            'status': 'success',
            'message': 'Changes will be reflected on reload. Rebuild recommended if using production build.'
        }
    else:
        return {
            'status': 'success',
            'message': 'Changes saved. Start the project to see changes.'
        }


@router.delete("/{demo_id}/page/{page_index}")
def delete_page(
    demo_id: int,
    page_index: int,
    current_user = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """Delete a page and renumber subsequent pages to keep sequence contiguous."""
    demo = db.query(Demonstration).filter(Demonstration.id == demo_id).first()
    if not demo:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found"
        )

    import shutil
    project_path = _project_root_for_demo(demo)
    content_dir = os.path.join(project_path, 'public', 'content')

    if not os.path.exists(content_dir):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No content directory")

    # Ensure target exists
    target_dir = os.path.join(content_dir, f'page-{page_index}')
    if not os.path.exists(target_dir):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Page not found")

    try:
        # Get max existing index
        existing = []
        for item in os.listdir(content_dir):
            if item.startswith('page-'):
                try:
                    existing.append(int(item.replace('page-', '')))
                except ValueError:
                    pass
        if not existing:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No pages to delete")

        max_index = max(existing)

        # Remove the target page
        shutil.rmtree(target_dir, ignore_errors=True)

        # Shift subsequent pages down by one to keep contiguous numbering
        for i in range(page_index + 1, max_index + 1):
            src = os.path.join(content_dir, f'page-{i}')
            dst = os.path.join(content_dir, f'page-{i-1}')
            if os.path.exists(src):
                # If dst exists (shouldn't), remove it first
                if os.path.exists(dst):
                    shutil.rmtree(dst, ignore_errors=True)
                os.replace(src, dst)

        return {
            'status': 'success',
            'message': f'Page {page_index} deleted and pages renumbered'
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=f"Failed to delete page: {str(e)}")

