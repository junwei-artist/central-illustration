# Dynamic Proxy Architecture

## Overview

The application now uses a dynamic proxy architecture where all demo web services are accessed through the FastAPI backend. Only one public port (8000) needs to be exposed, while demo services run on internal ports.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                     Public Access                           │
│                                                             │
│  http://your-domain:8000                                    │
│              │                                              │
│              ▼                                              │
└──────────────┼──────────────────────────────────────────────┘
               │
               ▼
    ┌──────────────────────┐
    │   FastAPI Backend    │  ← Only public port (8000)
    │     Port 8000        │
    └──────────┬───────────┘
               │
               │ /proxy/{demo_id}/...
               │
       ┌───────┼───────┬─────────────┐
       │       │       │             │
       ▼       ▼       ▼             ▼
   ┌────┐  ┌────┐  ┌────┐        ┌────┐
   │Demo│  │Demo│  │Demo│  ...   │Demo│
   │3001│  │3002│  │3003│        │30XX│
   └────┘  └────┘  └────┘        └────┘
   (Internal ports - not exposed publicly)
```

## Key Changes

### 1. Proxy Endpoint

A new `/proxy/{demo_id}/...` endpoint has been added that:
- Accepts all HTTP methods (GET, POST, PUT, DELETE, etc.)
- Routes requests to the appropriate demo service based on `demo_id`
- Forwards headers and request body
- Returns the response from the demo service
- Handles path-based routing (e.g., `/proxy/1/api/data` → `http://localhost:3001/api/data`)

### 2. Internal Port Binding

- Demo services now listen on localhost/internal network only
- Ports are dynamically assigned starting from 3001
- Ports are not exposed in `docker-compose.yml`
- Database port is also kept internal

### 3. URL Structure

**Old approach:**
```
http://localhost:3001  (direct access to demo)
```

**New approach:**
```
http://localhost:8000/proxy/1  (via FastAPI proxy)
```

### 4. Database Connection

The database is now only accessible within the Docker network. External tools can still connect by using port mapping when needed.

## Benefits

1. **Security**: Only one port (8000) needs to be exposed
2. **Dynamic Routing**: No need to configure firewalls for multiple ports
3. **Centralized Access Control**: Can add authentication/authorization at the proxy level
4. **Monitoring**: All requests can be logged and monitored in one place
5. **Simplified Deployment**: Easier to deploy to cloud platforms
6. **Network Isolation**: Demo services are isolated from external access

## API Changes

### Demo Status Endpoint

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

### Demo Redirect Endpoint

**Before:**
```json
{
  "url": "http://localhost:3001",
  "status": "running"
}
```

**After:**
```json
{
  "url": "http://localhost:8000/proxy/1",
  "status": "running"
}
```

## Implementation Details

### Files Changed

1. **backend/requirements.txt**: Added `httpx==0.25.2` for HTTP proxying
2. **backend/api/proxy.py**: New proxy implementation
3. **backend/main.py**: Added proxy router
4. **backend/api/demo_manager.py**: Updated to return proxy URLs
5. **docker-compose.yml**: Removed public port mappings for db and demos

### Proxy Features

- **HTTP Method Support**: All methods (GET, POST, PUT, DELETE, PATCH, OPTIONS, HEAD)
- **Path Forwarding**: Preserves full path structure
- **Query Parameters**: Forwards query parameters
- **Headers**: Forwards relevant headers (excludes proxy-specific ones)
- **Body**: Forwards request body for POST/PUT/PATCH
- **Error Handling**: Proper error responses for timeouts and connection errors

## Testing

1. Start the backend: `docker-compose up backend`
2. Start a demo via the API: `POST /demo-manager/start/{demo_id}`
3. Access the demo: `http://localhost:8000/proxy/{demo_id}`
4. Verify internal port: Check process manager for actual port assignment

## Security Considerations

1. **Authentication**: Consider adding authentication to proxy endpoints
2. **Rate Limiting**: Implement rate limiting at the proxy level
3. **CORS**: Configure CORS appropriately for proxied content
4. **HTTPS**: Use HTTPS in production for all communications
5. **Access Logs**: Monitor proxy access for security auditing

## Future Enhancements

1. Add authentication middleware to proxy routes
2. Implement caching for static assets
3. Add load balancing for multiple instances
4. Support WebSocket proxying
5. Add metrics and monitoring for proxy performance

