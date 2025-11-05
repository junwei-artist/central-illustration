# Export Feature Documentation

## Overview

The export feature allows users to convert a demo project's hero section slides into PowerPoint (PPT) or PDF formats with different aspect ratios (16:9 or 4:3).

## How It Works

### Frontend

1. **Export Button**: Each demo card on the `/demos` page has an "Export" button
2. **Format Selection**: Clicking the button reveals a dropdown menu with options:
   - **PowerPoint**: 16:9 or 4:3
   - **PDF**: 16:9 or 4:3
3. **Export Process**: User selects a format, and the system:
   - Sends a POST request to `/export/{demo_id}?format={format}`
   - Shows "Exporting..." state while processing
   - Downloads the file when ready

### Backend

The export process uses the following technologies:

1. **Playwright**: Automated browser to capture screenshots of each slide
2. **python-pptx**: Creates PowerPoint presentations
3. **ReportLab**: Creates PDF documents
4. **Pillow**: Image processing

## Export Process Flow

1. **Validate Demo**: Check if demo exists and is running
2. **Capture Screenshots**: 
   - Launch headless browser
   - Navigate to demo URL
   - Click through numbered buttons (1-8) to navigate slides
   - Capture screenshot of each slide
3. **Generate Export File**:
   - For PPT: Create presentation with screenshots as slide backgrounds
   - For PDF: Combine screenshots into multi-page PDF
4. **Return File**: Stream the file to client for download

## Technical Details

### API Endpoint

```
POST /export/{demo_id}?format={format}
```

**Parameters:**
- `demo_id`: ID of the demo to export
- `format`: One of: `ppt_169`, `ppt_43`, `pdf_169`, `pdf_43`

**Response:** Binary file stream (PPTX or PDF)

### Required Dependencies

```txt
playwright==1.40.0
python-pptx==0.6.23
pillow==10.1.0
reportlab==4.0.7
```

### Setup

1. Install dependencies:
   ```bash
   cd backend
   pip install -r requirements.txt
   ```

2. Install Playwright browsers:
   ```bash
   playwright install chromium
   ```

## Usage

### As a User

1. Navigate to the Demos page
2. Find the demo you want to export
3. Click the "Export" button
4. Select your desired format:
   - **PPT 16:9**: PowerPoint with wide slides (suitable for presentations)
   - **PPT 4:3**: PowerPoint with standard slides
   - **PDF 16:9**: PDF with wide pages
   - **PDF 4:3**: PDF with standard pages
5. Wait for the file to download

### Testing with Quality-Implementation

The `quality-implementation` project is set up as the benchmark for testing:

1. Start the quality-implementation demo
2. Ensure it has 8 slides in the hero section
3. Use the export button on its card
4. Test each format to verify functionality

## Current Limitations

1. **Fixed Number of Slides**: Currently assumes 8 slides (can be made dynamic)
2. **Requires Running Demo**: Demo must be started before export
3. **No Customization**: Cannot customize slides or add titles

## Future Enhancements

1. Dynamic slide count detection
2. Export without starting demo (use local files)
3. Custom slide titles and metadata
4. Batch export multiple demos
5. Custom branding options
6. Progress tracking for large exports

## Troubleshooting

### Export Fails

- Ensure the demo is running
- Check browser console for errors
- Verify Playwright is installed and browsers are downloaded

### Missing Slides

- Check that the demo has the correct number of slides
- Verify numbered buttons exist on the page
- Check browser console for navigation errors

### Quality Issues

- Screenshots are captured at 1920x1080 (16:9) or 1920x1440 (4:3)
- Adjust viewport size in `capture_slide_screenshots()` for higher quality

## Files Modified/Created

### Frontend
- `frontend/components/DemoCard.tsx`: Added export button and menu

### Backend
- `backend/api/exporter.py`: New export API
- `backend/main.py`: Added exporter router
- `backend/requirements.txt`: Added export dependencies

### Documentation
- `EXPORT_FEATURE.md`: This file

