#!/bin/bash
# Legacy helper name retained for convenience.
# Builds the frontend static bundle into frontend/dist for Azure or any other static host.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/../.." && pwd)"
FRONTEND_DIR="$ROOT_DIR/frontend"

echo "Building frontend static bundle..."

if [ ! -d "$FRONTEND_DIR/node_modules" ]; then
  echo "Installing dependencies..."
  (cd "$FRONTEND_DIR" && npm install)
fi

(cd "$FRONTEND_DIR" && npm run build)

echo "✅ Frontend bundle available at: $FRONTEND_DIR/dist"
echo ""
echo "Next steps:"
echo "1. Publish frontend/dist using Azure Static Web Apps, Azure Storage static website, Firebase Hosting, or another static host"
echo "2. Set VITE_API_BASE_URL to your deployed backend URL before building for each environment"

