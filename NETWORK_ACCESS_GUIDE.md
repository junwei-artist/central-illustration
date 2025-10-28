# Network Access Guide

## 🌐 Accessing from Other Devices on Your Network

The application now supports dynamic host detection, making it accessible from other devices on your network.

## 🔧 What Was Fixed

### Frontend (`frontend/lib/api.ts`)
- **Dynamic API URL**: Automatically detects the current hostname
- Constructs API URL as: `{protocol}://{hostname}:8000`
- Falls back to localhost for SSR during build

### Backend (`backend/api/demo_manager.py`)
- **Dynamic Redirect URLs**: Returns demo URLs using the client's hostname
- No more hardcoded localhost in responses
- Properly detects request origin

### CORS Configuration (`backend/core/config.py`)
- **Flexible Origin Handling**: Empty `CORS_ORIGINS` allows all origins
- Supports comma-separated origins or wildcard "*"

## 🚀 Accessing from Other Devices

### Step 1: Find Your Computer's IP Address

**On macOS/Linux:**
```bash
ifconfig | grep "inet " | grep -v 127.0.0.1
```

**On Windows:**
```cmd
ipconfig
```

Look for your local network IP (usually starts with 192.168.x.x or 10.0.x.x)

### Step 2: Start the Servers

**Backend:**
```bash
./run-illustration-backend.command
```

**Frontend:**
```bash
./run-illustration-frontend.command
```

Both servers should be running on `0.0.0.0` (all interfaces)

### Step 3: Access from Other Devices

From any device on the same network:
- **Frontend**: `http://YOUR_IP:3000`
- **Backend**: `http://YOUR_IP:8000`
- **API Docs**: `http://YOUR_IP:8000/docs`

Replace `YOUR_IP` with your actual IP address (e.g., `192.168.1.100`)

## 📱 Example

If your computer's IP is `192.168.1.100`:
- Frontend: `http://192.168.1.100:3000`
- Backend API: `http://192.168.1.100:8000`

From your phone/tablet/other computer, open these URLs and the app will work!

## 🔒 Security Notes

### For Local Network Access Only

The default configuration allows access from any IP address on your network. This is safe for:
- ✅ Local development
- ✅ Testing on mobile devices
- ✅ Demonstration to colleagues on same network

### For Production Deployment

Update `backend/.env`:
```env
# Specify allowed origins
CORS_ORIGINS=https://yourdomain.com,https://app.yourdomain.com
```

Or for specific IPs:
```env
CORS_ORIGINS=http://192.168.1.100:3000
```

## 🌍 Remote Access

### Option 1: VPN
Use a VPN to connect devices to the same network.

### Option 2: Port Forwarding
Configure your router to forward ports 3000 and 8000 to your computer.

### Option 3: Cloud Deployment
Deploy to a cloud provider (AWS, Heroku, DigitalOcean, etc.)

## 🔍 How It Works

### Frontend
```javascript
// Automatically detects hostname
const hostname = window.location.hostname  // e.g., "192.168.1.100"
const apiUrl = `http://${hostname}:8000`  // Dynamic!
```

### Backend
```python
# Returns client's hostname
client_host = request.headers.get('host')  # Client's IP
return f"http://{client_host}:{port}"  # Works for any client!
```

## ✅ Verification

Test from another device:
1. Open `http://YOUR_IP:3000` on your phone
2. Should see the landing page
3. API calls automatically go to `http://YOUR_IP:8000`
4. Demo projects redirect to the correct IP

## 🐛 Troubleshooting

### Can't access from other devices

**Check firewall:**
```bash
# macOS - Allow incoming connections
System Preferences > Security > Firewall > Firewall Options

# Or via terminal:
sudo /usr/libexec/ApplicationFirewall/socketfilterfw --add /usr/bin/python3
sudo /usr/libexec/ApplicationFirewall/socketfilterfw --unblockapp /usr/bin/python3
```

**Verify server is listening on all interfaces:**
```bash
# Should show 0.0.0.0, not 127.0.0.1
netstat -an | grep 3000
netstat -an | grep 8000
```

**Check network connectivity:**
```bash
# From other device, ping your computer
ping YOUR_IP
```

### API calls failing

- **CORS errors**: Make sure `CORS_ORIGINS` is empty in .env (allows all)
- **Connection refused**: Firewall blocking ports
- **Wrong URL**: Check that frontend is using dynamic hostname

### Demo redirects to localhost

- Backend must be updated to the latest version
- Restart backend after changes
- Check that demo is actually running

## 📝 Environment Variables

### Frontend (`.env.local`)
```env
# Optional: Override API URL
NEXT_PUBLIC_API_URL=http://192.168.1.100:8000
```

### Backend (`.env`)
```env
# Allow all origins (development)
CORS_ORIGINS=

# Or specify origins (production)
CORS_ORIGINS=https://yourdomain.com
```

## 🎉 Benefits

- ✅ Works on any device on the network
- ✅ No configuration needed
- ✅ Automatic hostname detection
- ✅ Mobile-friendly testing
- ✅ Colleague demonstrations
- ✅ Multi-device slick-testing

---

Now your Central Illustration platform is truly network-accessible! 🌐

