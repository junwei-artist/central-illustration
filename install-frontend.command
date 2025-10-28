#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo "============================================"
echo "  Central Illustration - Frontend Setup"
echo "============================================"
echo ""

# Check if Node.js is installed
echo -e "${YELLOW}Checking for Node.js...${NC}"
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed.${NC}"
    echo ""
    echo "Please install Node.js 18+ from:"
    echo "https://nodejs.org/"
    echo ""
    read -p "Press any key to exit..."
    exit 1
fi

# Display Node version
NODE_VERSION=$(node --version)
NPM_VERSION=$(npm --version)
echo -e "${GREEN}✓ Found Node.js $NODE_VERSION${NC}"
echo -e "${GREEN}✓ Found npm $NPM_VERSION${NC}"

# Check Node version
NODE_MAJOR_VERSION=$(node --version | cut -d'.' -f1 | tr -d 'v')
if [ "$NODE_MAJOR_VERSION" -lt 18 ]; then
    echo -e "${RED}❌ Node.js version 18 or higher is required.${NC}"
    echo "Current version: $NODE_VERSION"
    echo "Please upgrade Node.js from: https://nodejs.org/"
    read -p "Press any key to exit..."
    exit 1
fi

echo ""

# Navigate to frontend directory
cd "$(dirname "$0")/frontend" || exit 1

# Install dependencies
echo -e "${YELLOW}Installing dependencies...${NC}"
npm install

if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Failed to install dependencies${NC}"
    read -p "Press any key to exit..."
    exit 1
fi

echo -e "${GREEN}✓ Dependencies installed successfully${NC}"
echo ""

# Create .env.local file if it doesn't exist
if [ ! -f ".env.local" ]; then
    echo -e "${YELLOW}Creating .env.local configuration file...${NC}"
    cat > .env.local << 'EOF'
# Backend API URL
NEXT_PUBLIC_API_URL=http://localhost:8000
EOF
    echo -e "${GREEN}✓ .env.local file created${NC}"
else
    echo -e "${GREEN}✓ .env.local file already exists${NC}"
fi

echo ""
echo "============================================"
echo -e "${GREEN}✓ Frontend setup completed successfully!${NC}"
echo "============================================"
echo ""
echo "Next steps:"
echo "1. Make sure the backend server is running"
echo "2. Run: ./run-illustration-frontend.command"
echo ""
read -p "Press any key to exit..."

