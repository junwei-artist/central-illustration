# Fix: Multiple Project Conflict Issue

## Problem

When editing one project, all other running projects would stop or have issues. This was caused by:

1. **Shared Build Cache**: All Next.js projects were using the default `.next` build directory, causing conflicts
2. **File Watching Limits**: Multiple Next.js dev servers watching the same workspace exceeded system limits
3. **Memory Constraints**: Multiple instances competing for resources

## Solution Applied

### 1. Isolated Build Directories

Each project now uses a unique build directory specified in `next.config.js`:

- `quality-implementation` → `.next-quality-implementation`
- `template` → `.next-template`
- `simple-template` → `.next-simple-template`
- `semplied` → `.next-semplied`
- `total-quality-management` → `.next-total-quality-management`

**File**: `projects/{project-name}/next.config.js`

```javascript
const nextConfig = {
  reactStrictMode: true,
  distDir: '.next-{project-name}',  // Isolated build directory
}
```

### 2. Enhanced Process Manager

The backend process manager now:

- Increases Node.js memory limit to 4GB per instance
- Enables polling for file watching to avoid conflicts
- Properly isolates environment variables per project

**File**: `backend/core/process_manager.py`

```python
env['NODE_OPTIONS'] = '--max-old-space-size=4096'
env['WATCHPACK_POLLING'] = 'true'
```

## How to Apply Changes

### Option 1: Restart Backend (Recommended)

1. Stop the backend if running:
   ```bash
   # Find and kill backend process
   pkill -f "uvicorn main:app"
   ```

2. Restart the backend:
   ```bash
   cd backend
   uvicorn main:app --reload
   ```

3. Stop and restart your project demos through the admin panel

### Option 2: Clean Install (If issues persist)

For each project:

1. Stop the demo if running
2. Delete the old `.next` directory (if it exists):
   ```bash
   cd projects/quality-implementation
   rm -rf .next
   ```

3. Restart the demo through the admin panel

## Benefits

✅ **No More Conflicts**: Projects can be edited independently  
✅ **Isolated Builds**: Each project has its own cache  
✅ **Better Performance**: Proper memory allocation per instance  
✅ **Stable Development**: Projects won't crash when editing others  

## Testing

1. Start multiple demos simultaneously
2. Edit a file in one project
3. Verify other projects continue running without issues
4. Check that each project has its own build directory

## Technical Details

### File Watching

The `WATCHPACK_POLLING=true` environment variable tells webpack to use polling instead of native file system watching. This:
- Reduces conflicts between multiple watchers
- Works better across different operating systems
- Prevents "too many open files" errors

### Memory Allocation

`--max-old-space-size=4096` allocates 4GB of heap memory per Node.js process, preventing out-of-memory errors when multiple projects are running.

### Build Isolation

By using unique `distDir` values, each project:
- Maintains its own webpack cache
- Doesn't interfere with other project compilations
- Can be built/cleaned independently

## Future Improvements

Consider:
- Using Docker containers for complete isolation
- Implementing a shared cache server for dependencies
- Adding health checks and auto-restart for crashed instances
- Implementing resource limits per project

