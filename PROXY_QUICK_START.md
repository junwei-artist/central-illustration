# Proxy Architecture - Quick Start Guide

## Summary of Changes

Your application now uses a **single public port** (8000) with all demo services accessed through the FastAPI backend proxy.

## What Changed?

### Before
- Each demo exposed its own port (3001, 3002, etc.)
- Multiple ports had to be opened in firewall
- Direct access to demo services

### After
- Only FastAPI port (8000) is public
- All demos accessed via `/proxy/{demo_id}/...`
- Internal ports not exposed externally
- Dynamic routing handled by backend

## Installation

1. **Install new dependency:**
   ```bash
   cd backend
   source venv/bin/activate  # or your virtual environment
   pip install httpx==0.25.2
   ```

2. **Update Docker containers:**
   ```bash
   docker-compose down
   docker-compose build
   docker-compose up -d
   ```

## Usage

### Starting a Demo

```bash
# Start demo via API (admin only)
POST http://localhost:8000/demo-manager/start/1
```

### Accessing a Demo

**Old way (no longer works):**
```
http://localhost:3001  # Direct access
```

**New way:**
```
http://localhost:8000/proxy/1  # Via proxy
```

### API Endpoints

- **List demos**: `GET /demos/`
- **Start demo**: `POST /demo-manager/start/{demo_id}`
- **Stop demo**: `POST /demo-manager/stop/{demo_id}`
- **Check status**: `GET /demo-manager/status/{demo_id}`
- **Access demo**: `GET /proxy/{demo_id}/...` (any path)

### Example Paths

```
# Root of demo 1
http://localhost:8000/proxy/1

# API endpoint in demo 1
http://localhost:8000/proxy/1/api/users

# Static file in demo 1
http://localhost:8000/proxy/1/static/style.css
```

## Benefits

✅ **Security**: Only one port exposed  
✅ **Simple deployment**: No firewall configuration for multiple ports  
✅ **Network isolation**: Demos can't be accessed directly  
✅ **Centralized control**: All traffic goes through FastAPI  
✅ **Dynamic**: Easy to add/remove demos without port conflicts  

## Troubleshooting

### Demo not accessible?

1. Check if demo is running:
   ```bash
   GET http://localhost:8000/demo-manager/status/{demo_id}
   ```

2. Check backend logs:
   ```bash
   docker-compose logs backend
   ```

3. Verify internal port:
   - Internal port is `localhost:{port}` (e.g., localhost:3001)
   - Not accessible from outside Docker network
   - Only accessed via proxy

### Connection errors?

- Make sure httpx is installed: `pip install httpx==0.25.2`
- Restart backend after installing: `docker-compose restart backend`

## Files Modified

- `backend/requirements.txt` - Added httpx
- `backend/api/proxy.py` - New proxy implementation
- `backend/main.py` - Added proxy router
- `backend/api/demo_manager.py` - Updated URL generation
- `docker-compose.yml` - Removed public port mappings

## Architecture

```
Client → http://localhost:8000/proxy/1/api/data
          ↓
FastAPI Backend (port 8000 - PUBLIC)
          ↓
Internal Proxy → http://localhost:3001/api/data
          ↓
Demo Service (port 3001 - INTERNAL ONLY)
```

## Next Steps

1. Install httpx dependency
2. Rebuild Docker containers
3. Start backend service
4. Test proxy endpoint
5. Update any hardcoded URLs in frontend/client code

For detailed architecture documentation, see `PROXY_ARCHITECTURE.md`.

