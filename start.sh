#!/bin/bash
# Bookverse - Production startup script for hosting (MyMilesWeb, cPanel, etc.)
#
# Usage:
#   ./start.sh           - Install, build, start (skips if already done)
#   ./start.sh --install - Force npm install
#   ./start.sh --build   - Force rebuild
#   npm run start:hosting - Same as ./start.sh
#
# For cPanel: Set "Application startup file" to: npm run start:hosting

set -e

# Ensure we're in the project root (where package.json lives)
cd "$(dirname "$0")"

echo "=== Bookverse Startup Script ==="

# 1. Install dependencies (if node_modules missing or --install flag)
if [ ! -d "node_modules" ] || [ "$1" = "--install" ]; then
  echo "Installing dependencies..."
  npm install
  echo "Dependencies installed."
else
  echo "Skipping npm install (node_modules exists). Use --install to force."
fi

# 2. Generate Prisma client
echo "Generating Prisma client..."
npx prisma generate

# 3. Push database schema (creates tables if needed)
echo "Syncing database schema..."
npx prisma db push

# 4. Build Next.js (if .next missing or --build flag)
if [ ! -d ".next" ] || [ "$1" = "--build" ]; then
  echo "Building Next.js application..."
  npm run build
  echo "Build complete."
else
  echo "Skipping build (.next exists). Use --build to force rebuild."
fi

# 5. Start the application
echo "Starting application..."
exec npm start
