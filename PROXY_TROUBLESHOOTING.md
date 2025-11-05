# Proxy Troubleshooting Guide

## Issue: "Connection Refused" or "502 Bad Gateway" when accessing proxy

### Symptoms
- Error: "This site can't be reached" or "Connection refused"
- Error: "502 Bad Gateway"
- URL: `http://192.168.1.16/proxy/4` (or your IP)

### Root Cause

The **demo service has stopped or crashed**. The proxy endpoint is working correctly, but it cannot connect to the internal demo service because it's not running.

### Solution

#### Step 1: Restart the Demo Service

You need to log in as an admin user and restart the demo.

**Option A: Using the API directly**

```bash
# 1. Get an authentication token
TOKEN=$(curl -X POST http://192.168.1.16:8000/auth/login \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=admin&password=YOUR_PASSWORD" \
  | python3 -c "import sys, json; print(json.load(sys.stdin)['access_token'])")

# 2. Restart the demo (demo ID 4)
curl -X POST http://192.168.1.16:8000/demo-manager/start/4 \
  -H "Authorization: Bearer $TOKEN"
```

**Option B: Using the Frontend**

1. Navigate to `http://192.168.1.16:3000/login`
2. Log in as admin
3. Go to admin panel
4. Start demo 4

#### Step 2: Verify Demo is Running

```bash
# Check status
curl http://192.168.1.16:8000/demo-manager/status/4
```

You should see:
```json
{
  "status": "running",
  "port": 3001,
  "url": "http://192.168.1.16/proxy/4"
}
```

#### Step 3: Access via Proxy

Once the demo is running, access it at:
```
http://192.168.1.16/proxy/4
```

### Understanding the Architecture

```
Your Browser (192.168.1.x)
    ↓
    GET http://192.168.1.16/proxy/4
    ↓
FastAPI Backend (Port 8000) ✅ Running
    ↓
Proxy Endpoint ✅ Working
    ↓
Internal Demo Service (Port 3001) ❌ Not Running ← Problem here!
```

The proxy receives your request correctly, but when it tries to connect to the demo service on `localhost:3001`, that service is not running.

### Common Causes of Demo Service Crashes

1. **Process died**: Demo process crashed or was killed
2. **Port conflict**: Another service took port 3001
3. **System restart**: Server was rebooted
4. **Resource limits**: Out of memory or CPU

### How to Prevent Future Issues

#### Auto-restart on Crash

You could add a process monitor (like PM2 or supervisor) to automatically restart demo services if they crash.

#### Health Checks

Implement periodic health checks that restart demos if they become unresponsive.

#### Process Manager Cleanup

The process manager should be improved to:
- Detect when processes have died
- Clean up zombie processes
- Mark demos as not running when the process dies

### Debug Commands

```bash
# Check what's running on port 3001
lsof -i :3001

# Check backend port
lsof -i :8000

# Check demo status
curl http://localhost:8000/demo-manager/status/4

# List all demos
curl http://localhost:8000/demo-manager/all

# Test proxy endpoint locally
curl http://localhost:8000/proxy/4

# Check for zombie processes
ps aux | grep defunct
```

### Quick Fix Script

Create a script to restart all demos:

```bash
#!/bin/bash
# restart-demos.sh

# Login and get token
TOKEN=$(curl -X POST http://localhost:8000/auth/login \
  -H "Content-Type: application/x-www-form-urlencoded" \
  -d "username=admin&password=YOUR_PASSWORD" \
  | python3 -c "import sys, json; print(json.load(sys.stdin)['access_token'])")

# Get list of demos and restart them
DEMO_IDS=$(curl -s http://localhost:8000/demos/ | python3 -c "import sys, json; [print(d['id']) for d in json.load(sys.stdin)]")

for DEMO_ID in $DEMO_IDS; do
  echo "Restarting demo $DEMO_ID..."
  curl -X POST "http://localhost:8000/demo-manager/stop/$DEMO_ID" \
    -H "Authorization: Bearer $TOKEN"
  sleep 1
  curl -X POST "http://localhost:8000/demo-manager/start/$DEMO_ID" \
    -H "Authorization: Bearer $TOKEN"
  sleep 2
done

echo "All demos restarted"
```

### Still Having Issues?

If the demo starts but still shows 502:

1. **Check demo service logs**: Look for errors in the demo's console
2. **Verify port binding**: Ensure demo is actually listening on the assigned port
3. **Check firewall**: Make sure there are no firewall rules blocking localhost connections
4. **Test direct connection**: Try connecting to `http://localhost:3001` from the server directly
5. **Check process manager state**: Look at `~/.central-illustration/demo_processes.json`

### Contact Information

For persistent issues, check:
- Backend logs: `docker-compose logs backend`
- Demo logs: Check console where demo was started
- Process manager state: `cat ~/.central-illustration/demo_processes.json`

