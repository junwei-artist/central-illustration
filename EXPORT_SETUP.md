# Export Feature Setup Guide

## Installation Steps

### 1. Install Backend Dependencies

```bash
cd backend
pip install -r requirements.txt
```

This will install:
- `playwright==1.40.0` - Browser automation
- `python-pptx==0.6.23` - PowerPoint creation
- `pillow==10.1.0` - Image processing
- `reportlab==4.0.7` - PDF creation

### 2. Install Playwright Browsers

Playwright needs to download browser binaries:

```bash
playwright install chromium
```

Or if you have multiple browsers available:
```bash
playwright install
```

### 3. Verify Installation

Make sure the backend can start properly:
```bash
cd backend
python main.py
```

You should see the FastAPI server start on port 8000.

## Usage

### Testing with Quality-Implementation Project

1. **Start the Backend**:
   ```bash
   cd backend
   uvicorn main:app --reload
   ```

2. **Start the Frontend** (if not already running):
   ```bash
   cd frontend
   npm run dev
   ```

3. **Start the quality-implementation Demo**:
   - Navigate to the Demos page at `http://localhost:3000/demos`
   - Or navigate to the demo detail page
   - Click "Start Demo" for quality-implementation
   - Wait for it to be running

4. **Export**:
   - Click the "Export" button on the quality-implementation card
   - Select a format:
     - **PPT 16:9**: For modern widescreen presentations
     - **PPT 4:3**: For traditional presentations
     - **PDF 16:9**: For widescreen PDF documents
     - **PDF 4:3**: For standard PDF documents
   - The file will download automatically

## Troubleshooting

### "Export failed" Error

**Problem**: Export fails with an error message

**Solutions**:
1. Ensure the demo is running before exporting
2. Check backend logs for error messages
3. Verify Playwright browsers are installed:
   ```bash
   playwright install chromium
   ```

### Playwright Browser Not Found

**Problem**: `playwright.browser_type.chromium: Executable doesn'tَه exist`

**Solution**: Run:
```bash
playwright install chromium
```

### High Memory Usage

**Problem**: Export consumes too much memory

**Solution**: The export process is memory-intensive. Ensure your system has at least 4GB available RAM. Consider restarting the backend if issues persist.

### Slow Export

**Problem**: Export takes a long time

**Explanation**: Export process:
1. Launches a browser (takes 2-3 seconds)
2. Navigates to each slide (1 second per slide)
3. Captures screenshot (1-2 seconds per slide)
4. Generates file (1-3 seconds)

Total time for 8 slides: approximately 15-30 seconds

**Solution**: This is normal. Consider adding a progress indicator in future versions.

## Architecture

### Frontend Flow

```
User clicks Export → Selects format → API call → Downloads file
```

### Backend Flow

```
API endpoint → Check demo running → Launch browser → 
Capture screenshots → Generate file → Stream to client
```

### Technologies Used

- **Playwright**: Automated browser control and screenshot capture
- **python-pptx**: PowerPoint presentation generation
- **ReportLab**: PDF generation
- **Pillow**: Image processing and manipulation

## Limitations and Future Work

### Current Limitations

1. **Fixed 8 Slides**: Assumes exactly 8 slides in hero section
2. **Requires Running Demo**: Demo must be started
3. **No Customization**: Cannot add titles or modify slides
4. **Basic Quality**: Screenshots at 1920x1080 or 1920x1440

### Planned Enhancements

1. **Dynamic Slide Detection**: Automatically detect number of slides
2. **Offline Export**: Export without running the demo
3. **Custom Titles**: Add slide titles and metadata
4. **Batch Export**: Export multiple demos at once
5. **Quality Options**: Select export resolution
6. **Progress Tracking**: Show export progress
7. **Thumbnails**: Generate thumbnail previews

## API Reference

### Export Endpoint

**Endpoint**: `POST /export/{demo_id}?format={format}`

**Parameters**:
- `demo_id` (path): Integer ID of the demo
- `format` (query): One of: `ppt_169`, `ppt_43`, `pdf_169`, `pdf_43`

**Response**: Binary file stream

**Example Request**:
```bash
curl -X POST "http://localhost:8000/export/1?format=ppt_169" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -o output.pptx
```

**Response Headers**:
- `Content-Type`: `application/vnd.openxmlformats-officedocument.presentationml.presentation` (PPTX) or `application/pdf` (PDF)
- `Content-Disposition`: `attachment; filename={FIELD_NAME}_export.{FORMAT}`

