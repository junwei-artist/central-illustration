# Fix: Demo Not Accessible from Network

## 🔍 Problem
Demo showing on port 3001 but getting "refused to connect" when accessing from another device (192.168.1.16).

## 🐛 Root Cause
The demo Next.js server was only listening on `localhost` (127.0.0.1), not on all network interfaces (0.0.0.0).

## ✅ Solution Applied

**File**: `backend/core/process_manager.py`

Added the `-H 0.0.0.0` flag when starting demos to make them listen on all network interfaces:

```python
# Before
['npm', 'run', 'dev', '--', '-p', str(port)]

# After
['npm', 'run', 'dev', '--', '-H', '0.0.0.0', '-p', str(port)]
```

## 🚀 How to Apply

### Step 1: Stop the Current Demo
1. Go to the demo page as admin
2. Click "Stop Demo" button
3. Wait for it to stop

### Step 2: Restart the Backend (to pick up changes)
**Stop the current backend:**
```bash
# In the terminal running backend, press Ctrl+C
```

**Start it again:**
```bash
./run-illustration-backend.command
```

### Step 3: Start the Demo Again
1. As admin, go to the demo page
2. Click "Start Demo"
3. The demo will now start with host `0.0.0.0`

### Step 4: Test Network Access

**From your main computer:**
```bash
# Should work
http://localhost:3001
```

**From another device on the same network:**
```bash
# Should now work
http://192.168.1.16:3001
```

## ✅ Expected Behavior

### Before Fix:
- ❌ localhost works: `http://localhost:3001` ✅
- ❌ Network fails: `http://192.168.1.16:3001` ❌ (refused to connect)

### After Fix:
- ✅ localhost works: `http://localhost:3001` ✅
- ✅ Network works: `http://192.168.1.16:3001` ✅

## 🔍 How to Verify

### Check What Ports Are Listening

**On macOS/Linux:**
```bash
lsof -i -P | grep LISTEN | grep node
```

Should show something like:
```
node  12345  user  TCP *:3001 (LISTEN)  ← Good! * means all interfaces
```

NOT:
```
node  12345  user  TCP 127.0.0.1:3001 (LISTEN)  ← Bad! Only localhost
```

### Check Process Arguments

```bash
ps aux | grep "next dev"
```

Should include:
```
next dev -H 0.0.0.0 -p 3001
```

## 🎯 What Changed

1. **Process Manager**: Now passes `-H 0.0.0.0` flag when starting demos
2. **Network Binding**: Demos now listen on all network interfaces
3. **Accessibility**: Demos accessible from any device on the same network

## 🔒 Security Note

Listening on `0.0.0.0` makes the demo accessible from any device on your network. This is safe for:
- ✅ Local development
- ✅ Testing on mobile devices
- ✅ Demonstration to colleagues on the same network
- ✅ Same WiFi/network only

**For production**, deploy to a proper hosting service with proper security.

## 📝 Apply to Existing Demos

All currently running demos were started before this change. To apply the fix to them:

1. Stop each running demo
2. Restart the backend (to pick up the code change)
3. Start each demo again

New demos started after the backend restart will automatically use the network-accessible configuration.

---

Now your demos are truly network-accessible! 🌐

