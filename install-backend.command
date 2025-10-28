#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo "============================================"
echo "  Central Illustration - Backend Setup"
echo "============================================"
echo ""

# Check if Python 3.12 is installed
echo -e "${YELLOW}Checking for Python 3.12...${NC}"
if ! command -v python3.12 &> /dev/null; then
    echo -e "${RED}❌ Python 3.12 is not installed.${NC}"
    echo ""
    echo "Please install Python 3.12 from:"
    echo "https://www.python.org/downloads/"
    echo ""
    read -p "Press any key to exit..."
    exit 1
fi

# Display Python version
PYTHON_VERSION=$(python3.12 --version)
echo -e "${GREEN}✓ Found $PYTHON_VERSION${NC}"
echo ""

# Navigate to backend directory
cd "$(dirname "$0")/backend" || exit 1

# Check if venv already exists
if [ -d "venv" ]; then
    echo -e "${YELLOW}Virtual environment already exists.${NC}"
    read -p "Do you want to recreate it? (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo -e "${YELLOW}Removing existing virtual environment...${NC}"
        rm -rf venv
    else
        echo "Keeping existing virtual environment."
    fi
fi

# Create virtual environment
if [ ! -d "venv" ]; then
    echo -e "${YELLOW}Creating virtual environment with Python 3.12...${NC}"
    python3.12 -m venv venv
    if [ $? -ne 0 ]; then
        echo -e "${RED}❌ Failed to create virtual environment${NC}"
        read -p "Press any key to exit..."
        exit 1
    fi
    echo -e "${GREEN}✓ Virtual environment created${NC}"
fi

# Activate virtual environment
echo -e "${YELLOW}Activating virtual environment...${NC}"
source venv/bin/activate

# Upgrade pip
echo -e "${YELLOW}Upgrading pip...${NC}"
python -m pip install --upgrade pip

# Install dependencies
echo -e "${YELLOW}Installing dependencies...${NC}"
pip install -r requirements.txt

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Failed to install dependencies${NC}"
    read -p "Press any key to exit..."
    exit 1
fi

echo -e "${GREEN}✓ Dependencies installed successfully${NC}"
echo ""

# Create .env file if it doesn't exist
if [ ! -f ".env" ]; then
    echo -e "${YELLOW}Creating .env configuration file...${NC}"
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
    echo -e "${GREEN}✓ .env file created${NC}"
    echo ""
    echo -e "${YELLOW}⚠️  IMPORTANT: Update the SECRET_KEY in .env for production use!${NC}"
else
    echo -e "${GREEN}✓ .env file already exists${NC}"
fi

echo ""
echo "============================================"
echo -e "${GREEN}✓ Backend setup completed successfully!${NC}"
echo "============================================"
echo ""
echo "Next steps:"
echo "1. Make sure PostgreSQL is running (or start with: docker-compose up db)"
echo "2. Run: ./run-illustration-backend.command"
echo ""
read -p "Press any key to exit..."

