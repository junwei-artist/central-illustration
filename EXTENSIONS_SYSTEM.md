# Extensions System & Content Editor

## Overview

This system allows administrators to:
1. **Create projects from template extensions** (like orange-template)
2. **Edit content** for each page in the hero section
3. **Add new pages** based on existing page templates
4. **Publish changes** to make them live

## Architecture

### Backend Extensions

Located in `backend/extensions/`, extensions are template projects that can be used to create new demo projects.

#### Current Extensions:
- **orange-template**: Modern minimalist template with orange theme

### Backend API Endpoints

#### Extensions API (`/extensions`)
- `GET /extensions/list` - List all available extensions
- `GET /extensions/{extension_name}/info` - Get extension information and structure
- `POST /extensions/create-from-extension?extension_name={name}` - Create a project from an extension

#### Content Editor API (`/content-editor`)
- `GET /content-editor/{demo_id}/pages` - Get list of pages in a project
- `GET /content-editor/{demo_id}/page/{page_index}/{content_type}` - Get content for a specific page and type (title/points/detail)
- `PUT /content-editor/{demo_id}/page/{page_index}/{content_type}` - Update content for a specific page and type
- `POST /content-editor/{demo_id}/add-page` - Add a new page based on page 1 or page 2 template
- `POST /content-editor/{demo_id}/publish` - Publish changes

### Frontend API Service

The `apiService` object now includes methods for:
- Extensions management
- Content editing
- Page management
- Publishing

### Content Structure

Each project can have multiple pages (page-1, page-2, etc.), and each page contains:
- `title.md` - Title and subtitle
- `points.md` - Main content/description
- `detail.md` - Detailed content shown in modal viewer

### How to Use

#### 1. Create a Project from Extension

```typescript
await apiService.createProjectFromExtension('orange-template', {
  title: 'My New Project',
  description: 'Description here',
  folder_name: 'my-new-project'
})
```

#### 2. Get Project Pages

```typescript
const pages = await apiService.getProjectPages(demoId)
```

#### 3. Get Page Content

```typescript
const content = await apiService.getPageContent(demoId, 1, 'title')
```

#### 4. Update Page Content

```typescript
await apiService.updatePageContent(demoId, 1, 'title', '# New Title')
```

#### 5. Add a New Page

```typescript
// Add a page based on page-1 style (index 0) or page-2 style (index 1)
await apiService.addPage(demoId, 0) // page-1 style
```

#### 6. Publish Changes

```typescript
await apiService.publishChanges(demoId)
```

### Adding New Extensions

1. Place your template project in `backend/extensions/your-extension-name/`
2. Create a `template.json` file with metadata:
   ```json
   {
     "name": "Your Extension",
     "description": "Description here",
     "version": "1.0.0",
     "icon": "🎨"
   }
   ```

3. The extension will automatically appear in the extensions list

### Content Editing Workflow

1. Admin creates a project from an extension template
2. Admin can view and edit content for each page
3. Admin can add new pages based on existing templates
4. Changes are saved immediately to markdown files
5. Admin can publish changes (triggers rebuild/restart if needed)

### Future Enhancements

- Visual drag-and-drop page editor
- Live preview while editing
- Image upload support
- Theme customization
- Advanced layout options
- Version control for content changes

