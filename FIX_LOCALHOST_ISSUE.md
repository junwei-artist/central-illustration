# Fix localhost Issue on Network Access

## 🔍 Problem
When accessing from another device (e.g., `http://192.168.1.16:3000`), the API still calls `localhost:8000` instead of `192.168.1.16:8000`.

## ✅ Solution - Follow These Steps

### Step 1: Stop the Frontend Server
1. Go to the terminal running the frontend
2. Press `Ctrl + C` to stop it

### Step 2: Restart the Frontend Server
```bash
./run-illustration-frontend.command
```

Or manually:
```bash
cd frontend
npm run dev
```

### Step 3: Clear Browser Cache on ALL Devices

**On your main computer (where you're developing):**
1. Open Chrome DevTools (F12)
2. Right-click the refresh button
3. Select "Empty Cache and Hard Reload"
4. Or press `Cmd + Shift + R` (Mac) or `Ctrl + Shift + R` (Windows)

**On your other device (testing):**
1. If using a mobile browser:
   - **Safari (iOS)**: Settings > Safari > Clear History and Website Data
   - **Chrome (Android)**: Settings > Privacy > Clear browsing data
2. Or open in an **incognito/private window**
3. Or restart the browser completely

### Step 4: Verify the Fix

On your other device:
1. Open `http://YOUR_IP:3000/demos`
2. Open browser console (for mobile, enable remote debugging)
3. Look for these console logs:

Expected output:
```
🔧 Constructed API URL from window: http://192.168.1.16:8000
🚀 API Interceptor:
   Request URL: /demos/?visible_only=true
   Base URL: http://192.168.1.16:8000
   Full URL: http://192.168.1.16:8000/demos/?visible_only=true
   window.location: http://192.168.1.16:3000/demos
```

### Step 5: Check Network Tab

In the Network tab, you should see:
- Request URL: `http://192.168.1.16:8000/demos/?visible_only=true`
- NOT `http://localhost:8000/demos/?visible_only=true`

## 🐛 If Still Not Working

### Option A: Check if Dev Server Restarted
- Look at the terminal output when you start the frontend
- Should see messages like "Ready" and "Local: http://localhost:3000"
- If you see old messages, kill the process and restart

### Option B: Verify File Was Updated
```bash
cd frontend/lib
grep -A 2 "getBaseURL" api.ts
```

Should show the dynamic code, not hardcoded localhost.

### Option C: Use Environment Variable
Create/edit `frontend/.env.local`:
```env
NEXT_PUBLIC_API_URL=http://192.168.1.16:8000
```

Then restart the frontend server.

### Option D: Check for Multiple Copies of api.ts
```bash
find frontend -name "api.ts" -type f
```

Should only be one file: `frontend/lib/api.ts`

## 🎯 Quick Test

1. Restart frontend: `Ctrl+C` then `npm run dev`
2. Hard refresh: `Cmd+Shift+R` or `Ctrl+Shift+R`
3. Check console logs - should show IP, not localhost
4. Check Network tab - should show IP in request URL

## ✅ Expected Behavior

- Access from `http://localhost:3000` → API calls `http://localhost:8000`
- Access from `http://192.168.1.16:3000` → API calls `http://192.168.1.16:8000`
- Access from `http://yourdomain.com:3000` → API calls `http://yourdomain.com:8000`

The key is: **The API URL should match whatever hostname you're accessing the frontend from.**

