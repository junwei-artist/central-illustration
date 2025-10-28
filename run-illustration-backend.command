#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo "============================================"
echo "  Central Illustration - Backend Server"
echo "============================================"
echo ""

# Get script directory
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
BACKEND_DIR="$SCRIPT_DIR/backend"

# Check if backend directory exists
if [ ! -d "$BACKEND_DIR" ]; then
    echo -e "${RED}❌ Backend directory not found at: $BACKEND_DIR${NC}"
    read -p "Press any key to exit..."
    exit 1
fi

# Navigate to backend directory
cd "$BACKEND_DIR" || exit 1

# Check if Python 3.12 is available
if ! command -v python3.12 &> /dev/null; then
    echo -e "${RED}❌ Python 3.12 is not installed.${NC}"
    echo "Please run install-backend.command first."
    read -p "Press any key to exit..."
    exit 1
fi

# Check if venv exists
if [ ! -d "venv" ]; then
    echo -e "${YELLOW}⚠️  Virtual environment not found.${NC}"
    echo "Please run install-backend.command first to set up the environment."
    read -p "Press any key to exit..."
    exit 1
fi

# Activate virtual environment
echo -e "${YELLOW}Activating virtual environment...${NC}"
source venv/bin/activate

# Check if .env exists
if [ ! -f ".env" ]; then
    echo -e "${YELLOW}⚠️  .env file not found. Creating default configuration...${NC}"
    cat > .env << 'EOF'
# Database Configuration
DATABASE_URL=postgresql://user:password@localhost:5432/demodb

# Security Configuration
SECRET_KEY=your-secret-key-change-in-production-for-security
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# CORS Configuration
CORS_ORIGINS=http://localhost:3000,http://localhost:3001
EOF
fi

# Load environment variables
echo -e "${YELLOW}Loading environment variables...${NC}"
set -a
source .env
set +a

# Display configuration
echo ""
echo -e "${BLUE}Configuration:${NC}"
echo "  Python: $(python --version)"
echo "  Database: ${DATABASE_URL#postgresql://}"
echo "  Host: 0.0.0.0"
echo "  Port: 8000"
echo "  Mode: Development (with auto-reload)"
echo ""

# Display API information
echo -e "${GREEN}Starting backend server...${NC}"
echo ""
echo "============================================"
echo "  Backend will be available at:"
echo "  http://localhost:8000"
echo ""
echo "  API Documentation:"
echo "  http://localhost:8000/docs"
echo "============================================"
echo ""
echo -e "${YELLOW}Press Ctrl+C to stop the server${NC}"
echo ""

# Run the backend server
python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload

# Deactivate virtual environment on exit
deactivate

echo ""
echo -e "${YELLOW}Backend server stopped.${NC}"
read -p "Press any key to exit..."

