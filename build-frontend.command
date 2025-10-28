#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo "============================================"
echo "  Central Illustration - Build Frontend"
echo "============================================"
echo ""

# Get script directory
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
FRONTEND_DIR="$SCRIPT_DIR/frontend"

# Check if frontend directory exists
if [ ! -d "$FRONTEND_DIR" ]; then
    echo -e "${RED}❌ Frontend directory not found at: $FRONTEND_DIR${NC}"
    read -p "Press any key to exit..."
    exit 1
fi

# Navigate to frontend directory
cd "$FRONTEND_DIR" || exit 1

# Check if Node.js is available
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed.${NC}"
    echo "Please install Node.js 18+ from: https://nodejs.org/"
    read -p "Press any key to exit..."
    exit 1
fi

# Display configuration
echo -e "${BLUE}Configuration:${NC}"
echo "  Node: $(node --version)"
echo "  npm: $(npm --version)"
echo "  Directory: $FRONTEND_DIR"
echo ""

# Ask user if they want to reinstall dependencies
echo -e "${YELLOW}Choose build option:${NC}"
echo "  1) Build only (faster, use existing node_modules)"
echo "  2) Rebuild everything (clean install + build)"
read -p "Enter choice [1 or 2]: " choice

# Reinstall dependencies if requested
if [ "$choice" = "2" ]; then
    echo ""
    echo -e "${YELLOW}Removing node_modules and package-lock.json...${NC}"
    rm -rf node_modules package-lock.json
    
    echo -e "${YELLOW}Installing dependencies...${NC}"
    npm install
    
    if [ $? -ne 0 ]; then
        echo -e "${RED}❌ Failed to install dependencies${NC}"
        read -p "Press any key to exit..."
        exit 1
    fi
    
    echo -e "${GREEN}✓ Dependencies installed successfully${NC}"
    echo ""
elif [ "$choice" != "1" ] && [ "$choice" != "2" ]; then
    echo -e "${YELLOW}Invalid choice. Building with existing dependencies...${NC}"
    echo ""
fi

# Check if .env.local exists
if [ ! -f ".env.local" ]; then
    echo -e "${YELLOW}⚠️  .env.local not found. Creating default configuration...${NC}"
    cat > .env.local << 'EOF'
NEXT_PUBLIC_API_URL=http://localhost:8000
EOF
    echo -e "${GREEN}✓ .env.local created${NC}"
    echo ""
fi

# Clean previous build
echo -e "${YELLOW}Cleaning previous build...${NC}"
rm -rf .next
echo -e "${GREEN}✓ Cleaned${NC}"
echo ""

# Build the frontend
echo -e "${GREEN}Building frontend for production...${NC}"
echo ""

npm run build

if [ $? -ne 0 ]; then
    echo ""
    echo -e "${RED}❌ Build failed!${NC}"
    echo ""
    echo "Common issues:"
    echo "  - Missing dependencies: Run with option 2 to reinstall"
    echo "  - TypeScript errors: Check error messages above"
    echo "  - Environment variables: Check .env.local"
    echo ""
    read -p "Press any key to exit..."
    exit 1
fi

echo ""
echo "============================================"
echo -e "${GREEN}✓ Frontend built successfully!${NC}"
echo "============================================"
echo ""
echo -e "${BLUE}Build output:${NC}"
echo "  - Production build: .next/"
echo "  - Static assets: .next/static/"
echo ""
echo -e "${BLUE}Next steps:${NC}"
echo "  1. To preview: npm run start"
echo "  2. To serve: Use a production server like nginx"
echo "  3. To deploy: Upload the .next folder to your server"
echo ""
read -p "Press any key to exit..."

