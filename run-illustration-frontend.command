#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo "============================================"
echo "  Central Illustration - Frontend Server"
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
    echo "Please run install-frontend.command first."
    read -p "Press any key to exit..."
    exit 1
fi

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}⚠️  Dependencies not installed.${NC}"
    echo "Please run install-frontend.command first."
    read -p "Press any key to exit..."
    exit 1
fi

# Check if .env.local exists
if [ ! -f ".env.local" ]; then
    echo -e "${YELLOW}⚠️  .env.local not found. Creating default configuration...${NC}"
    cat > .env.local << 'EOF'
# Leave empty to use dynamic host detection based on current URL
# NEXT_PUBLIC_API_URL=http://localhost:8000
EOF
fi

# Load environment variables (if any)
source .env.local 2>/dev/null || true

# Display configuration
echo ""
echo -e "${BLUE}Configuration:${NC}"
echo "  Node: $(node --version)"
echo "  npm: $(npm --version)"
if [ -n "${NEXT_PUBLIC_API_URL:-}" ]; then
    echo "  Backend API: ${NEXT_PUBLIC_API_URL} (from .env.local)"
else
    echo "  Backend API: Dynamic (based on client hostname)"
fi
echo "  Host: 0.0.0.0 (accessible from network)"
echo "  Port: 3000"
echo "  Mode: Development (with hot reload)"
echo ""

# Display application information
echo -e "${GREEN}Starting frontend server...${NC}"
echo ""
echo "============================================"
echo "  Frontend will be available at:"
echo "  - http://localhost:3000 (local)"
echo "  - http://YOUR_IP:3000 (network)"
echo ""
echo "  Backend API will adapt to client hostname"
echo "  - localhost → http://localhost:8000"
echo "  - YOUR_IP → http://YOUR_IP:8000"
echo "============================================"
echo ""
echo -e "${YELLOW}Press Ctrl+C to stop the server${NC}"
echo ""

# Run the frontend server
npm run dev

echo ""
echo -e "${YELLOW}Frontend server stopped.${NC}"
read -p "Press any key to exit..."

