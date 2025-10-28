# Local Development Setup (without Docker)

This guide will help you set up and run Central Illustration on your local machine without using Docker.

## Prerequisites

- **Python 3.12** - Download from [python.org](https://www.python.org/downloads/)
- **PostgreSQL** - Download from [postgresql.org](https://www.postgresql.org/download/)
- **Node.js 18+** - Download from [nodejs.org](https://nodejs.org/)
- **npm** or **yarn**

## Quick Start

### macOS Users

Simply double-click these files in Finder:

1. **`install-backend.command`** - Sets up the Python backend
2. **`run-illustration-backend.command`** - Runs the backend server
3. **`install-frontend.command`** - Sets up the Next.js frontend
4. **`run-illustration-frontend.command`** - Runs the frontend server

### Manual Setup

#### 1. Backend Setup

```bash
# Navigate to backend directory
cd backend

# Create virtual environment with Python 3.12
python3.12 -m venv venv

# Activate virtual environment
source venv/bin/activate  # On macOS/Linux
# OR
venv\Scripts\activate     # On Windows

# Install dependencies
pip install -r requirements.txt

# Create .env file (copy from backend/.env.example)
cp .env.example .env

# Edit .env with your database credentials
# DATABASE_URL=postgresql://user:password@localhost:5432/demodb

# Initialize database
python db/init_db.py

# Run server
uvicorn main:app --reload
```

Backend will be available at: http://localhost:8000

#### 2. Frontend Setup

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Create .env.local file
echo "NEXT_PUBLIC_API_URL=http://localhost:8000" > .env.local

# Run development server
npm run dev
```

Frontend will be available at: http://localhost:3000

#### 3. Database Setup

You need PostgreSQL running. You can either:

**Option A: Use Docker for Database Only**
```bash
docker run --name postgres-demo -e POSTGRES_USER=user -e POSTGRES_PASSWORD=password -e POSTGRES_DB=demodb -p 5432:5432 -d postgres:15-alpine
```

**Option B: Install PostgreSQL Locally**
1. Download and install from [postgresql.org](https://www.postgresql.org/download/)
2. Start the PostgreSQL service
3. Update `.env` with your credentials

**Option C: Use Docker Compose for Database**
```bash
docker-compose up db -d
```

## Using the .command Scripts

### Backend Installation

```bash
# Make executable (first time only)
chmod +x install-backend.command

# Run
./install-backend.command
```

This script will:
- ✅ Check for Python 3.12
- ✅ Create virtual environment
- ✅ Install all dependencies
- ✅ Create `.env` configuration file
- ✅ Set up the environment

### Running Backend

```bash
# Make executable (first time only)
chmod +x run-illustration-backend.command

# Run
./run-illustration-backend.command
```

This script will:
- ✅ Activate virtual environment
- ✅ Load environment variables
- ✅ Start the FastAPI server with auto-reload
- ✅ Display server URL and API docs

### Frontend Installation

```bash
# Make executable (first time only)
chmod +x install-frontend.command

# Run
./install-frontend.command
```

This script will:
- ✅ Check for Node.js
- ✅ Install all npm dependencies
- ✅ Create `.env.local` configuration

### Running Frontend

```bash
# Make executable (first time only)
chmod +x run-illustration-frontend.command

# Run
./run-illustration-frontend.command
```

This script will:
- ✅ Start the Next.js development server
- ✅ Enable hot reload
- ✅ Display the server URL

## Development Workflow

### Terminal 1: Backend
```bash
cd central-illustration
./run-illustration-backend.command
```

### Terminal 2: Frontend
```bash
cd central-illustration
./run-illustration-frontend.command
```

### Terminal 3: Database (if using Docker)
```bash
docker-compose up db
```

## Troubleshooting

### Backend Issues

**Problem**: `python3.12: command not found`
- **Solution**: Install Python 3.12 from [python.org](https://www.python.org/downloads/)

**Problem**: `ModuleNotFoundError`
- **Solution**: Make sure virtual environment is activated and run `pip install -r requirements.txt`

**Problem**: `Connection refused` to database
- **Solution**: Ensure PostgreSQL is running and credentials in `.env` are correct

**Problem**: `Port 8000 already in use`
- **Solution**: Change port in `run-illustration-backend.command`: `--port 8001`

### Frontend Issues

**Problem**: `node: command not found`
- **Solution**: Install Node.js from [nodejs.org](https://nodejs.org/)

**Problem**: `Cannot connect to backend`
- **Solution**: Check that backend is running and update `NEXT_PUBLIC_API_URL` in `.env.local`

**Problem**: `Port 3000 already in use`
- **Solution**: Next.js will automatically use the next available port

### Database Issues

**Problem**: Database doesn't exist
```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE demodb;

# Create user (if needed)
CREATE USER user WITH PASSWORD 'password';
GRANT ALL PRIVILEGES ON DATABASE demodb TO user;
```

## Environment Variables

### Backend (.env)

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/demodb

# Security (CHANGE IN PRODUCTION!)
SECRET_KEY=your-secret-key-change-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# CORS
CORS_ORIGINS=["http://localhost:3000","http://localhost:3001"]
```

### Frontend (.env.local)

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## First Run

After setting up both backend and frontend:

1. **Start Database**: PostgreSQL must be running
2. **Initialize Database**: Run `python backend/db/init_db.py` (first time only)
3. **Start Backend**: Run `./run-illustration-backend.command`
4. **Start Frontend**: Run `./run-illustration-frontend.command`
5. **Access App**: Open http://localhost:3000 in your browser

## Login Credentials

Default admin account (created by `init_db.py`):
- **Username**: `admin`
- **Password**: `admin123`

⚠️ **Change these in production!**

## Stopping Services

- Press `Ctrl+C` in the terminal running the service
- To stop Docker database: `docker-compose down`

## Next Steps

- See [README.md](README.md) for full documentation
- See [QUICKSTART.md](QUICKSTART.md) for Docker setup
- See [PROJECT_OVERVIEW.md](PROJECT_OVERVIEW.md) for architecture details

---

Happy coding! 🚀

