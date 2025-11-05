# Extensions and Editor System

## Overview

This document describes the new extensions system and comprehensive content editor that has been added to the Central Illustration platform.

## Features Implemented

### 1. Extension System

The backend now supports an extensions system where template projects can be stored and used to create new demos.

**Location**: `backend/extensions/`

**Current Extensions**:
- **orange-template**: A modern template based on quality-implementation with:
  - Hero slider with multiple pages
  - Dynamic content from markdown files
  - Orange gradient theme
  - Framer Motion animations
  - Glassmorphism detail viewer
  - Comprehensive page management

### 2. Extension API Endpoints

All extension-related endpoints are available at `/extensions/*`:

- `GET /extensions/list` - List all available template extensions
- `GET /extensions/{extension_name}/info` - Get information about a specific extension
- `POST /extensions/create-from-extension` - Create a new demo from an extension template
- `GET /extensions/{extension_name}/content/{filepath}` - Get content from extension template

### 3. Content Editor API Endpoints

All content editor endpoints are available at `/content-editor/*`:

- `GET /content-editor/{demo_id}/pages` - Get list of pages in a project
- `GET /content-editor/{demo_id}/page/{page_index}/{content_type}` - Get content for a specific page and type
- `PUT /content-editor/{demo_id}/page/{page_index}/{content_type}` - Update content for a specific page and type
- `POST /content-editor/{demo_id}/add-page` - Add a new page to the project
- `POST /content-editor/{demo_id}/publish` - Publish changes to the project

**Content Types**:
- `title` - Title and subtitle content
- `points` - Main content and bullet points
- `detail` - Detailed content shown in modal viewer

### 4. Admin Panel Updates

The admin panel has been enhanced with:

#### Extension-Based Demo Creation
- Select from available extensions when creating new demos
- See extension descriptions and icons
- Automatic project setup and dependency installation

#### Content Editor
- Full-screen editor with sidebar navigation
- Edit multiple content types (title, points, detail)
- Switch between pages easily
- Add new pages based on page-1 or page-2 style
- Save content to project files
- Publish changes to live project

**Editor Features**:
- Page selection sidebar
- Content type tabs (Title, Points, Detail)
- Large textarea for markdown editing
- Auto-load content when switching pages or types
- Save and publish buttons
- Add page buttons for creating new pages

### 5. Page Structure

Each page in a project follows this structure:

```
public/content/
  ├── page-1/
  │   ├── title.md       # Title and subtitle
  │   ├── points.md      # Main content
  │   └── detail.md       # Detailed content for modal
  ├── page-2/
  │   ├── title.md
  │   ├── points.md
  │   └── detail.md
  └── ...
```

### 6. Workflow

#### Creating a New Demo from Extension

1. Go to Admin Panel (`/admin`)
2. Click "Create from Template"
3. Select an extension from the dropdown
4. Fill in title, description, and folder name
5. Submit to create the project
6. npm install will run automatically

#### Editing Demo Content

1. Click the "Edit Content" button (green FileText icon) on any demo
2. Select a page from the sidebar
3. Select a content type (Title, Points, or Detail)
4. Edit the markdown content
5. Click "Save Content" to save changes
6. Click "Publish" to publish changes to the live project

#### Adding New Pages

1. Open the content editor for a demo
2. Scroll to the bottom of the pages list
3. Click either:
   - "Add Page (Style 1)" - Based on page-1 layout
   - "Add Page (Style 2)" - Based on page-2 layout
4. The new page will be created with template content
5. Edit the content as needed

## Technical Details

### Backend Structure

```
backend/
├── api/
│   ├── extensions.py        # Extension management API
│   ├── content_editor.py   # Content editing API
│   └── ...
├── extensions/
│   └── orange-template/
│       ├── template.json    # Extension metadata
│       ├── public/content/  # Content structure
│       ├── app/             # Next.js pages
│       └── ...              # Project files
└── ...
```

### Frontend Structure

```
frontend/
├── app/
│   └── admin/
│       └── page.tsx         # Updated admin panel with editor
└── lib/
    └── api.ts               # API client with new methods
```

### API Service Methods

The frontend API service (`lib/api.ts`) has been extended with:

```typescript
// Extensions
getExtensions()
getExtensionInfo(extensionName)
createProjectFromExtension(extensionName, data)

// Content Editor
getProjectPages(demoId)
getPageContent(demoId, pageIndex, contentType)
updatePageContent(demoId, pageIndex, contentType, content)
addPage(demoId, basePageIndex)
publishChanges(demoId)
```

## Configuration

### Extension Template JSON

Each extension has a `template.json` file with metadata:

```json
{
  "name": "Extension Name",
  "description": "Extension description",
  "version": "1.0.0",
  "author": "Author",
  "icon": "🎨",
  "category": "landing-page",
  "features": ["Feature 1", "Feature 2"],
  "pages": [
    {
      "index": 0,
      "name": "Page Name",
      "type": "hero-centered",
      "description": "Page description",
      "template": "page-1"
    }
  ],
  "content_structure": {
    "page-1": {
      "title.md": "Description",
      "points.md": "Description",
      "detail.md": "Description"
    }
  }
}
```

## Usage Examples

### Creating a Demo from Extension

```typescript
const result = await apiService.createProjectFromExtension(
  'orange-template',
  {
    title: 'My New Demo',
    description: 'A great demonstration',
    folder_name: 'my-new-demo'
  }
)
```

### Editing Content

```typescript
// Get pages
const pages = await apiService.getProjectPages(demoId)

// Get content
const content = await apiService.getPageContent(demoId, 1, 'title')

// Update content
await apiService.updatePageContent(demoId, 1, 'title', 'New Title')

// Add a page
const newPage = await apiService.addPage(demoId, 0) // 0 for page-1 style, 1 for page-2 style

// Publish changes
await apiService.publishChanges(demoId)
```

## Future Enhancements

Possible enhancements:
- Visual markdown preview
- Real-time collaborative editing
- Version history and rollback
- Template marketplace
- Custom page layouts
- Image upload and management
- Advanced styling options

## Testing

To test the new features:

1. Start the backend: `cd backend && python -m uvicorn main:app --reload`
2. Start the frontend: `cd frontend && npm run dev`
3. Login as admin
4. Go to `/admin`
5. Try creating a new demo from the orange-template extension
6. Open the content editor and edit content
7. Try adding a new page
8. Publish the changes

## Notes

- Content is stored as markdown files in `public/content/`
- Pages are numbered starting from 1 (page-1, page-2, etc.)
- The editor supports full markdown syntax
- Changes are saved to the filesystem immediately
- Publishing triggers a rebuild if the project is running
- Extensions must follow the standard Next.js project structure

