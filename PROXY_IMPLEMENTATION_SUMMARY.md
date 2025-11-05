# Dynamic Proxy Implementation Summary

## Overview

The application has been successfully refactored to use a **dynamic proxy architecture** via the FastAPI backend. This change ensures that only one port (8000) needs to be publicly exposed, while all demo services run on internal ports that are not accessible from outside.

## Key Changes

### 1. New Proxy Module (`backend/api/proxy.py`)

Created a new proxy module that handles all requests to demo services:

- **Endpoint**: `/proxy/{demo_id}/{path:path}` - Routes to any path within a demo
- **Root Endpoint**: `/proxy/{demo_id}` - Routes to demo root
- **HTTP Methods**: Supports GET, POST, PUT, DELETE, PATCH, OPTIONS, HEAD
- **Features**:
  - Automatic routing based on demo ID
  - Path and query parameter forwarding
  - Header forwarding (excluding proxy-specific headers)
  - Request body forwarding
  - Error handling for timeouts and connection failures
  - Proper response headers and status codes

### 2. Updated Dependencies

- **Added**: `httpx==0.25.2` to `backend/requirements.txt`
  - Used for making HTTP requests to internal demo services

### 3. Updated Routing (`backend/main.py`)

- Added proxy router to the FastAPI application
- Proxy router is included **last** to ensure it doesn't interfere with other routes

### 4. Updated Demo Manager (`backend/api/demo_manager.py`)

Changed URL generation to use proxy endpoints instead of direct ports:

**Before:**
```python
result['url'] = f"{base_url}:{result['port']}"
# Example: http://localhost:3001
```

**After:**
```python
result['url'] = f"{base_url}/proxy/{demo_id}"
# Example: http://localhost:8000/proxy/1
```

### 5. Updated Docker Configuration (`docker-compose.yml`)

- **Database**: Removed public port mapping (5432)
  - Database is now only accessible within the Docker network
  - Accessible to backend via service name `db`
- **Backend**: Port 8000 remains public (the only exposed port)
- **Frontend**: Port 3000 remains public (not part of proxy architecture)
- **Demos**: No public ports - all accessed via `/proxy/{demo_id}`

## Architecture Flow

### Request Flow

```
1. Client requests: http://localhost:8000/proxy/1/api/users
                      ↓
2. FastAPI backend receives request at port 8000
                      ↓
3. Proxy module identifies demo_id=1 and looks up running service
                      ↓
4. Finds demo running on internal port 3001
                      ↓
5. Proxies request to: http://localhost:3001/api/users
                      ↓
6. Demo service processes request and returns response
                      ↓
7. FastAPI forwards response back to client
```

### Network Isolation

```
Public Network:
  - Port 8000 (FastAPI backend)
  - Port 3000 (Frontend)

Internal Docker Network (bridge):
  - Port 5432 (PostgreSQL - internal)
  - Port 3001 (Demo 1 - internal)
  - Port 3002 (Demo 2 - internal)
  - Port 3003+ (Other demos - internal)
```

## Security Benefits

1. **Single Entry Point**: Only one port exposed to the internet
2. **Network Isolation**: Demo services cannot be accessed directly
3. **Centralized Control**: All demo access goes through FastAPI
4. **Easy Firewall Setup**: Only need to allow port 8000
5. **Future Authentication**: Can add auth middleware to proxy routes

## API Changes

### Demo Status Response

**Before:**
```json
{
  "status": "running",
  "port": 3001,
  "url": "http://localhost:3001"
}
```

**After:**
```json
{
  "status": "running",
  "port": 3001,
  "url": "http://localhost:8000/proxy/1"
}
```

### Demo URLs

**Access patterns:**

- Demo root: `http://localhost:8000/proxy/1`
- API endpoint: `http://localhost:8000/proxy/1/api/users`
- Static file: `http://localhost:8000/proxy/1/static/style.css`
- Nested path: `http://localhost:8000/proxy/1/admin/users/list`

## Installation Steps

1. **Install new dependency:**
   ```bash
   cd backend
   source venv/bin/activate
   pip install httpx==0.25.2
   ```

2. **Rebuild Docker containers:**
   ```bash
   docker-compose down
   docker-compose build
   docker-compose up -d
   ```

3. **Or update running container:**
   ```bash
   docker-compose restart backend
   ```

## Testing

### Start a Demo

```bash
# As admin user
curl -X POST http://localhost:8000/demo-manager/start/1 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Access Demo via Proxy

```bash
# Root
curl http://localhost:8000/proxy/1

# Specific path
curl http://localhost:8000/proxy/1/api/data
```

### Check Status

```bash
curl http://localhost:8000/demo-manager/status/1
```

## Compatibility

### Frontend Changes

The frontend code may need updates to use the new proxy URLs. Check:

- `frontend/lib/api.ts` - Update demo URL generation
- `frontend/components/*` - Update any hardcoded demo URLs
- Any frontend code that constructs demo URLs

### Demo Services

No changes needed to demo services - they continue to run as before on their assigned ports. The only difference is how they're accessed.

## Files Modified

1. `backend/api/proxy.py` - **NEW** - Proxy implementation
2. `backend/requirements.txt` - Added httpx
3. `backend/main.py` - Added proxy router
4. `backend/api/demo_manager.py` - Updated URL generation
5. `docker-compose.yml` - Removed public port mappings

## Files Created

1. `PROXY_ARCHITECTURE.md` - Detailed architecture documentation
2. `PROXY_QUICK_START.md` - Quick start guide
3. `PROXY_IMPLEMENTATION_SUMMARY.md` - This file

## Next Steps

1. **Update Frontend**: Modify frontend code to use proxy URLs
2. **Add Authentication**: Consider adding auth to proxy routes
3. **Add Logging**: Log proxy requests for monitoring
4. **Performance**: Add caching for static assets if needed
5. **WebSocket Support**: Add WebSocket proxying if needed

## Troubleshooting

### Issue: Cannot connect to demo
**Solution**: Verify demo is running with `/demo-manager/status/{id}`

### Issue: 503 Service Unavailable
**Solution**: Start the demo first with `/demo-manager/start/{id}`

### Issue: 502 Bad Gateway
**Solution**: Check if internal port is correct and demo service is responsive

### Issue: httpx not found
**Solution**: Run `pip install httpx==0.25.2` in backend environment

## Migration Notes

If you have existing deployments or external integrations:

1. **Update External Links**: Change all demo URLs from `:port` to `/proxy/{id}`
2. **Update Documentation**: Update any user-facing documentation with new URLs
3. **Firewall Rules**: Update firewall to only allow port 8000
4. **Monitoring**: Update monitoring tools to use new URL structure

