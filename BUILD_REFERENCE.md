# Frontend Build Reference

## 🚀 Building the Frontend

Use the `build-frontend.command` script to build the Next.js frontend for production.

### Quick Build

```bash
./build-frontend.command
```

Or simply double-click `build-frontend.command` in Finder (macOS).

### Build Options

The script will ask you to choose:

**Option 1: Build Only** (Faster)
- Uses existing `node_modules`
- Cleans previous build
- Runs production build
- Good for: Quick rebuilds when only code changed

**Option 2: Rebuild Everything** (Complete)
- Removes `node_modules` and `package-lock.json`
- Fresh npm install
- Cleans previous build
- Runs production build
- Good for: After package updates, fixing dependency issues

### What It Does

1. ✅ Checks for Node.js installation
2. ✅ Verifies frontend directory exists
3. ✅ Offers build options (fast or complete rebuild)
4. ✅ Cleans previous `.next` build directory
5. ✅ Creates `.env.local` if missing
6. ✅ Runs `npm run build` for production
7. ✅ Shows success or error messages

### Build Output

After successful build, you'll find:

```
frontend/
├── .next/              # Production build output
│   ├── static/         # Static assets
│   ├── server/         # Server-side code
│   └── ...
```

### Running the Built Version

After building, you can run the production server:

```bash
cd frontend
npm run start
```

This starts the production server on http://localhost:3000

### Manual Build Commands

If you prefer manual control:

```bash
cd frontend

# Install dependencies (if needed)
npm install

# Clean previous build
rm -rf .next

# Build for production
npm run build

# Run production server
npm run start
```

### Troubleshooting

**Build fails with dependency errors:**
```bash
./build-frontend.command
# Choose option 2 to reinstall all dependencies
```

**TypeScript errors:**
- Check the error messages in the build output
- Fix any TypeScript issues in your code
- Ensure all imports are correct

**Out of memory:**
```bash
# Increase Node memory limit
NODE_OPTIONS="--max_old_space_size=4096" npm run build
```

**Build successful but server won't start:**
- Make sure you ran `npm run build` first
- Check that `.next` directory exists
- Verify `.env.local` is configured

### Development vs Production

**Development Mode:**
```bash
./run-illustration-frontend.command
# or
npm run dev
```
- Hot reload enabled
- Source maps for debugging
- Faster compilation
- Not optimized

**Production Mode:**
```bash
./build-frontend.command
npm run start
```
- Optimized bundles
- No source maps
- Production-ready
- Better performance
- Requires build step first

### Deploying the Build

To deploy the built frontend:

1. **Build the frontend:**
   ```bash
   ./build-frontend.command
   # Choose option 2 for clean build
   ```

2. **The production files are in:**
   - `.next/` - Next.js build output
   - `public/` - Static files (images, etc.)
   - `package.json` - Dependencies

3. **Deploy to your hosting:**
   - Upload entire `frontend/` directory
   - Set `NEXT_PUBLIC_API_URL` environment variable
   - Run `npm install --production` on server
   - Run `npm run start` on server

### Environment Variables

Make sure `.env.local` exists and contains:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

For production, update to your actual API URL:
```env
NEXT_PUBLIC_API_URL=https://api.yourdomain.com
```

### Quick Reference

| Task | Command |
|------|---------|
| Build frontend | `./build-frontend.command` |
| Build + start | `./build-frontend.command` then `cd frontend && npm run start` |
| Clean build | `cd frontend && rm -rf .next node_modules` |
| Check build | `ls -la frontend/.next` |
| View errors | `tail -f frontend/.next/trace` |

### Next Steps After Building

1. Test the production build locally:
   ```bash
   cd frontend
   npm run start
   ```
   Visit http://localhost:3000

2. Check for issues:
   - Login works
   - Pages load correctly
   - API connections work
   - No console errors

3. Deploy to production

---

For more information, see:
- [README.md](README.md) - Full documentation
- [LOCAL_SETUP.md](LOCAL_SETUP.md) - Development setup
- [SETUP_GUIDE.md](SETUP_GUIDE.md) - Using command files

