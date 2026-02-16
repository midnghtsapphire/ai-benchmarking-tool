#!/bin/bash
set -e

echo "=== Building for GitHub Pages ==="

# Build using the GH Pages vite config (no manus-runtime)
npx vite build --config vite.config.ghpages.ts

echo "=== Build complete ==="

# Ensure .nojekyll exists in output
touch dist/public/.nojekyll

# Copy 404.html to output root
if [ -f client/public/404.html ]; then
  cp client/public/404.html dist/public/404.html
fi

echo "=== Deploying to gh-pages branch ==="

# Save current branch
CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)

# Create a temp directory for deployment
TEMP_DIR=$(mktemp -d)
cp -r dist/public/* "$TEMP_DIR/"
cp -r dist/public/.nojekyll "$TEMP_DIR/" 2>/dev/null || true

# Check if gh-pages branch exists
if git show-ref --verify --quiet refs/heads/gh-pages; then
  git checkout gh-pages
else
  git checkout --orphan gh-pages
  git rm -rf . 2>/dev/null || true
fi

# Clean and copy new build
find . -maxdepth 1 ! -name '.git' ! -name '.' -exec rm -rf {} +
cp -r "$TEMP_DIR"/* .
cp "$TEMP_DIR/.nojekyll" . 2>/dev/null || true

# Commit and push
git add -A
git commit -m "Deploy to GitHub Pages - $(date -u '+%Y-%m-%d %H:%M:%S UTC')" --allow-empty

git push origin gh-pages --force

# Return to original branch
git checkout "$CURRENT_BRANCH"

# Cleanup
rm -rf "$TEMP_DIR"

echo "=== Deployed to gh-pages! ==="
echo "Site will be available at: https://midnghtsapphire.github.io/ai-benchmarking-tool/"
