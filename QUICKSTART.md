# Quick Start Guide

Get your Central Illustration demo platform running in minutes!

## 🚀 Fast Start (Docker)

```bash
# 1. Start all services
docker-compose up -d

# 2. Initialize database with default admin user
docker-compose exec backend python db/init_db.py

# 3. Access the application
# Frontend: http://localhost:3000
# Backend API: http://localhost:8000
# API Docs: http://localhost:8000/docs
```

**Default Admin Credentials:**
- Username: `admin`
- Password: `admin123`

## 📋 Step-by-Step First Run

### 1. View the Landing Page
Navigate to http://localhost:3000 to see the beautiful SaaS landing page with SVG animations.

### 2. Explore Demos
Visit http://localhost:3000/demos to see available demonstrations.

### 3. Login to Admin
- Go to http://localhost:3000/login
- Login with admin credentials
- You'll be redirected to the admin dashboard

### 4. Manage Demonstrations
In the admin dashboard (http://localhost:3000/admin):
- Click "Add Demo" to create a new demonstration
- Fill in the form:
  - **Title**: Display name (e.g., "Interactive Chart")
  - **Description**: Brief description
  - **Folder Name**: Must match folder in `/projects/` (e.g., `demo-1`)
  - **URL**: Optional external link
  - **Visibility**: Check to make it public
- Click "Create" to save

### 5. Test Comments
- View a demo page (e.g., http://localhost:3000/demos/demo-1)
- Scroll to the bottom
- Try posting a comment (requires login)

## 📁 Adding Your Own Demo

1. **Create folder structure:**
```bash
mkdir projects/my-awesome-demo
cd projects/my-awesome-demo
```

2. **Create index.html:**
```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>My Awesome Demo</title>
    <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gray-100 min-h-screen p-8">
    <div class="max-w-6xl mx-auto">
        <h1 class="text-4xl font-bold text-center py-12">
            My Awesome Demo
        </h1>
        <!-- Your demo content here -->
    </div>
</body>
</html>
```

3. **Add to database via Admin Dashboard:**
   - Title: "My Awesome Demo"
   - Folder Name: `my-awesome-demo` (must match exactly)
   - Description: "Description of my demo"
   - Visibility: ✅ Checked

## 🎨 Sample Demos Included

### 1. Interactive Data Visualization (`demo-1`)
- SVG charts and graphs
- Animated data points
- Interactive controls

### 2. Animated SVG Shapes (`animated-shapes`)
- Rotating shapes
- Pulsing circles
- Morphing animations
- Moving gradients

### 3. SVG Dashboard (`svg-dashboard`)
- Stat cards with custom SVGs
- Dashboard layout
- Progress indicators

## 🔧 Development Workflow

### Making Backend Changes
```bash
# Backend automatically reloads on changes
# View logs
docker-compose logs -f backend
```

### Making Frontend Changes
```bash
# Frontend automatically reloads on changes
# View logs
docker-compose logs -f frontend
```

### Database Access
```bash
# Connect to PostgreSQL
docker-compose exec db psql -U user demodb

# Useful queries:
# SELECT * FROM demonstration;
# SELECT * FROM app_user;
# SELECT * FROM comment;
```

## 🛑 Stopping Services

```bash
# Stop all services
docker-compose down

# Stop and remove volumes (clean slate)
docker-compose down -v
```

## 🐛 Troubleshooting

### Database connection issues
```bash
# Reset database
docker-compose down -v
docker-compose up -d
docker-compose exec backend python db/init_db.py
```

### Port already in use
Edit `docker-compose.yml` and change port mappings:
```yaml
ports:
  - "8001:8000"  # Change backend port
  - "3001:3000"  # Change frontend port
```

### Frontend can't connect to backend
Update `frontend/.env.local`:
```bash
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## 📊 Architecture Overview

```
Browser
   ↓
Frontend (Next.js) :3000
   ↓ HTTPS
Backend (FastAPI) :8000
   ↓ SQL
PostgreSQL :5432
```

## 🎯 Next Steps

1. ✅ Explore the sample demos
2. ✅ Create your own demo in `/projects/`
3. ✅ Add it via admin dashboard
4. ✅ Test comment functionality
5. ✅ Customize the landing page
6. ✅ Deploy to production

For detailed information, see [README.md](README.md)

