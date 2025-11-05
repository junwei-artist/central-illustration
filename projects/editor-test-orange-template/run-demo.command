#!/bin/bash

cd "$(dirname "$0")"

echo "============================================"
echo "  Total Quality Management Demo"
echo "============================================"
echo ""

if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install
fi

echo "Starting development server..."
echo "Demo will be available at: http://localhost:3001"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

npm run dev

