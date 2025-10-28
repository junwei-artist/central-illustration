# Demo Management System

## Overview

The Central Illustration platform now includes a sophisticated demo management system that allows admins to start/stop demo projects dynamically with automatic port allocation.

## Features

### Backend Process Manager (`backend/core/process_manager.py`)
- **Dynamic Port Allocation**: Automatically assigns ports starting from 3001
- **Process Lifecycle Management**: Start/stop/status checking
- **Persistent Storage**: Saves process info to survive backend restarts
- **Automatic Cleanup**: Detaches processes so they run independently
- **Port Conflict Resolution**: Finds next available port if conflict exists

### Backend API (`backend/api/demo_manager.py`)

**Endpoints:**
- `POST /demo-manager/start/{demo_id}` - Start a demo project (admin only)
- `POST /demo-manager/stop/{demo_id}` - Stop a demo project (admin only)  
- `GET /demo-manager/status/{demo_id}` - Get demo status (admin only)
- `GET /demo-manager/redirect/{demo_id}` - Get redirect URL (public)
- `GET /demo-manager/all` - List all demo processes

### Frontend Integration

**Demo Detail Page (`frontend/app/demos/[slug]/page.tsx`):**
- Shows running status with port number
- Admin can start/stop demos with one click
- Launch button only appears when demo is running
- Auto-refreshes status every 5 seconds

**API Service (`frontend/lib/api.ts`):**
- `startDemo(demoId)` - Start a demo
- `stopDemo(demoId)` - Stop a demo
- `getDemoStatus(demoId)` - Get status
- `getDemoRedirectUrl(demoId)` - Get URL to launch demo

## How It Works

### Starting a Demo

1. **Admin clicks "Start Demo"** on demo detail page
2. **Frontend calls** `POST /demo-manager/start/{demo_id}`
3. **Backend:**
   - Validates admin authentication
   - Gets demo folder from database
   - Allocates next available port (3001, 3002, etc.)
   - Runs `npm run dev -p {port}` in project folder
   - Stores process PID and port in `~/.central-illustration/demo_processes.json`
   - Returns port number to frontend
4. **Frontend updates** UI to show "Running on port X"
5. **Launch button appears** with redirect to `http://localhost:{port}`

### Stopping a Demo

1. **Admin clicks "Stop Demo"**
2. **Frontend calls** `POST /demo-manager/stop/{demo_id}`
3. **Backend:**
   - Kills the process
   - Removes from process tracking
   - Updates status
4. **Frontend updates** UI to show "Not Running"

### Launching a Demo

1. **User clicks "Launch Demo Project"** button
2. **Frontend gets redirect URL** from `/demo-manager/redirect/{demo_id}`
3. **Opens new tab** with `http://localhost:{dynamic_port}`
4. **Demo loads** in its own window

## Usage

### For Admins

1. Go to any demo detail page: `/demos/{slug}`
2. See current status (Running/Not Running)
3. Click "Start Demo" to launch the project
4. Click "Stop Demo" to shut it down
5. Click "Launch Demo Project" when running to view it

### For Users

1. Browse to demo detail page
2. See running status
3. If running, click "Launch Demo Project" to view
4. If not running, see message that admin needs to start it

## Configuration

### Demo Projects

Each demo project should be in `/projects/{folder_name}/` with:
- `package.json` with `npm run dev` script
- Next.js application
- `-p {PORT}` argument support in dev script

### Port Management

- Base port: 3001
- Auto-increments for each new demo
- Ports tracked per demo folder name
- Persistent across backend restarts

## Database

Demos are stored in the `demonstration` table:
- `id` - Unique ID
- `title` - Display title
- `description` - Description text
- `folder_name` - Folder in `/projects/` (used for port tracking)
- `is_visible` - Public visibility toggle
- `created_at` / `updated_at` - Timestamps

## Technical Details

### Process Persistence

Process information stored in: `~/.central-illustration/demo_processes.json`

```json
{
  "total-quality-management": {
    "pid": 12345,
    "port": 3001,
    "status": "running",
    "path": "/path/to/project"
  }
}
```

### Security

- Only admins can start/stop demos
- Public can check status and get redirect URLs
- Process isolation with `start_new_session=True`
- Graceful shutdown with SIGTERM, forceful with SIGKILL

### Error Handling

- Checks if process is still running before reporting status
- Cleans up dead processes automatically
- Handles port conflicts gracefully
- Returns detailed error messages

## Troubleshooting

### Demo won't start
- Check that folder exists in `/projects/`
- Verify `package.json` has `dev` script
- Check npm is installed
- Look at backend logs for errors

### Port conflicts
- System auto-finds next available port
- Old processes cleaned up on backend restart
- Check `demo_processes.json` for running processes

### Demo won't launch
- Verify demo is running (green status indicator)
- Check port is not blocked by firewall
- Ensure process didn't crash (check admin panel)

## Future Enhancements

- View process logs in admin panel
- Automatic restart on crash
- Resource usage monitoring
- Multiple environment support (dev/prod)
- Docker container support
- Resource limits (CPU/memory)

---

This system enables true multi-tenant demonstration management with minimal overhead! 🚀

