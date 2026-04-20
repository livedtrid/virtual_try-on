#!/bin/bash
# Deploy frontend to /docs folder for GitHub Pages

set -e

echo "Building frontend and deploying to /docs..."

cd frontend

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
  echo "Installing dependencies..."
  npm install
fi

# Build and move to docs folder
npm run build:docs

cd ..

echo "✅ Frontend deployed to /docs folder!"
echo ""
echo "Next steps:"
echo "1. Commit the /docs folder to git"
echo "2. Push to GitHub"
echo "3. Go to Repository Settings → Pages"
echo "4. Select 'Deploy from a branch'"
echo "5. Choose 'main' branch and '/docs' folder"
echo "6. Your site will be available at: https://yourusername.github.io/virtual_try-on/"

