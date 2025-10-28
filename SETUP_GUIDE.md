# Setup Guide - Central Illustration

## 🚀 Quick Start Options

You have three ways to run this project:

### 1. Docker (Recommended - Easiest)
```bash
docker-compose up -d
docker-compose exec backend python db/init_db.py
```
See [README.md](README.md) for details.

### 2. macOS Command Files (No Terminal Needed!)
Double-click these files in Finder:
- `install-backend.command` → Sets up backend
- `run-illustration-backend.command` → Runs backend
- `install-frontend.command` → Sets up frontend  
- `run-illustration-frontend.command` → Runs frontend

### 3. Manual Setup (Full Control)
See [LOCAL_SETUP.md](LOCAL_SETUP.md) for step-by-step instructions.

## 📋 macOS .command Files

### Backend Setup

#### install-backend.command
**What it does:**
- ✅ Checks if Python 3.12 is installed
- ✅ Creates virtual environment using Python 3.12
- ✅ Installs all Python dependencies
- ✅ Creates `.env` configuration file
- ✅ Shows success message

**How to use:**
1. Double-click `install-backend.command` in Finder
2. Follow the prompts
3. Wait for installation to complete

#### run-illustration-backend.command
**What it does:**
- ✅ Activates the virtual environment
- ✅ Loads environment variables from `.env`
- ✅ Starts FastAPI server on port 8000
- ✅ Enables auto-reload for development
- ✅ Shows server URL and API documentation link

**How to use:**
1. Double-click `run-illustration-backend.command` in Finder
2. Server starts in a terminal window
3. Access at http://localhost:8000
4. Press Ctrl+C to stop

### Frontend Setup

#### install-frontend.command
**What it does:**
- ✅ Checks if Node.js 18+ is installed
- ✅ Installs all npm dependencies
- ✅ Creates `.env.local` configuration file
- ✅ Shows success message

**How to use:**
1. Double-click `install-frontend.command` in Finder
2. Follow the prompts
3. Wait for installation to complete

#### run-illustration-frontend.command
**What it does:**
- ✅ Starts Next.js development server
- ✅ Enables hot reload
- ✅ Loads environment variables
- ✅ Shows server URL

**How to use:**
1. Double-click `run-illustration-frontend.command` in Finder
2. Server starts in a terminal window
3. Access at http://localhost:3000
4. Press Ctrl+C to stop

## 🔄 Complete Workflow

### First Time Setup

1. **Install Python 3.12**
   - Download from: https://www.python.org/downloads/
   
2. **Install Node.js 18+**
   - Download from: https://nodejs.org/
   
3. **Install PostgreSQL** (or use Docker)
   - Download from: https://www.postgresql.org/download/
   - OR: `docker-compose up db -d`

4. **Set up Backend**
   - Double-click `install-backend.command`
   - Wait for installation to complete
   
5. **Set up Frontend**
   - Double-click `install-frontend.command`
   - Wait for installation to complete

6. **Start Database** (if not using Docker)
   - Start PostgreSQL service on your system

### Running the Application

Open **three** terminal/Finder windows:

**Window 1: Database** (if not using Docker)
```bash
# Start PostgreSQL or use Docker:
docker-compose up db -d
```

**Window 2: Backend**
- Double-click `run-illustration-backend.command`
- Should see: "Application startup complete"

**Window 3: Frontend**
- Double-click `run-illustration-frontend.command`
- Should see: "Ready on http://localhost:3000"

### Access the Application

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:8000
- **API Docs:** http://localhost:8000/docs

### Login

- **Username:** `admin`
- **Password:** `admin123`

## 🎯 Recommended Workflow

### Development Mode

1. **Morning Routine:**
   ```
   Window 1: Run database
   Window 2: Run backend
   Window 3: Run frontend
   ```

2. **During Development:**
   - Make changes to backend → auto-reloads
   - Make changes to frontend → hot reloads
   - No need to restart services

3. **End of Day:**
   - Press Ctrl+C in each terminal window
   - Services stop gracefully

## 🔧 Configuration

### Backend Environment (backend/.env)

Created automatically by `install-backend.command`:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/demodb
SECRET_KEY=your-secret-key-change-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
CORS_ORIGINS=["http://localhost:3000","http://localhost:3001"]
```

### Frontend Environment (frontend/.env.local)

Created automatically by `install-frontend.command`:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## 🐛 Troubleshooting

### Backend Issues

**Python not found:**
```bash
# Check if Python 3.12 is installed
python3.12 --version

# If not, install from python.org
```

**Port 8000 in use:**
- Kill the process: `lsof -ti:8000 | xargs kill`
- OR change port in `run-illustration-backend.command`

**Database connection error:**
- Check if PostgreSQL is running
- Verify credentials in `backend/.env`
- Check database exists: `psql -U postgres -l`

### Frontend Issues

**Node not found:**
```bash
# Check if Node.js is installed
node --version

# If not, install from nodejs.org
```

**Port 3000 in use:**
- Next.js will automatically use next available port
- Check terminal output for actual port

**Cannot connect to backend:**
- Ensure backend is running
- Check `NEXT_PUBLIC_API_URL` in `.env.local`
- Verify backend is accessible at http://localhost:8000

### General Issues

**Permission denied on .command files:**
```bash
chmod +x *.command
```

**Scripts not working:**
- Make sure you have Python 3.12 and Node.js 18+ installed
- Check that you're in the correct directory
- Try running from terminal: `./script-name.command`

## 📁 File Structure

```
central-illustration/
├── install-backend.command          ← Backend setup
├── run-illustration-backend.command ← Run backend
├── install-frontend.command         ← Frontend setup
├── run-illustration-frontend.command ← Run frontend
├── backend/
│   ├── .env                         ← Backend config
│   ├── venv/                        ← Python virtual env
│   └── ...
├── frontend/
│   ├── .env.local                   ← Frontend config
│   ├── node_modules/                ← npm packages
│   └── ...
└── ...
```

## 🎨 Features

- ✅ **Auto-detects** Python 3.12
- ✅ **Auto-creates** virtual environment
- ✅ **Auto-installs** dependencies
- ✅ **Auto-generates** configuration files
- ✅ **Color-coded** output for easy reading
- ✅ **Error handling** with helpful messages
- ✅ **Health checks** before running

## 🔐 Security Notes

- Change `SECRET_KEY` in production
- Change default admin password
- Use environment variables for sensitive data
- Never commit `.env` files

## 📚 Additional Documentation

- **README.md** - Main documentation
- **LOCAL_SETUP.md** - Manual setup guide
- **QUICKSTART.md** - Quick start with Docker
- **PROJECT_OVERVIEW.md** - Architecture details

## 🎉 You're Ready!

Once all services are running:
1. Open http://localhost:3000
2. Explore the landing page
3. Click "Explore Demos" to see demonstrations
4. Login as admin to manage content
5. Start creating your own demos!

---

Happy coding! 🚀

