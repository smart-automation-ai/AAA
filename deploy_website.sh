#!/bin/bash

# Smart Automation AI Website Deployment Script
# Updated: 2025-06-14

echo "🚀 Deploying Smart Automation AI Website..."

# Check if we're in the right directory
if [ ! -f "index.html" ]; then
    echo "❌ Error: index.html not found. Please run this script from the website root directory."
    exit 1
fi

# Update version timestamp
TIMESTAMP=$(date +"%Y%m%d-%H%M")
echo "📅 Updating version to: $TIMESTAMP"

# Update CSS version in index.html
sed -i "s/styles\.css?v=[^\"]*\"/styles.css?v=$TIMESTAMP\"/g" index.html

# Validate HTML
echo "🔍 Validating HTML..."
if command -v html5validator &> /dev/null; then
    html5validator --root . --also-check-css
else
    echo "⚠️  HTML validator not found. Install with: pip install html5validator"
fi

# Validate CSS
echo "🎨 Validating CSS..."
if [ -f "validate_css.py" ]; then
    python validate_css.py
fi

# Check for JavaScript syntax
echo "🔧 Checking JavaScript..."
if command -v node &> /dev/null; then
    node -c script.js && echo "✅ JavaScript syntax is valid"
else
    echo "⚠️  Node.js not found. Cannot validate JavaScript syntax."
fi

# Minification (optional)
if command -v minify &> /dev/null; then
    echo "🗜️  Minifying assets..."
    minify styles.css > styles.min.css
    minify script.js > script.min.js
    echo "✅ Assets minified"
fi

# Git operations
echo "📦 Committing changes..."
git add .
git status

# Ask for commit message
read -p "Enter commit message (or press Enter for default): " COMMIT_MSG
if [ -z "$COMMIT_MSG" ]; then
    COMMIT_MSG="Website update - $TIMESTAMP"
fi

git commit -m "$COMMIT_MSG"

# Push to GitHub
echo "🌐 Pushing to GitHub..."
git push origin main

# Deploy to GitHub Pages
echo "🚀 Deploying to GitHub Pages..."
echo "Visit: https://smart-automation-ai.github.io/AAA/"

# Performance check
echo "⚡ Performance tips:"
echo "- Optimize images for web"
echo "- Enable gzip compression"
echo "- Use CDN for assets"
echo "- Monitor Core Web Vitals"

# Analytics reminder
echo "📊 Don't forget to:"
echo "- Check Google Analytics"
echo "- Monitor user feedback"
echo "- Update SEO meta tags if needed"

echo "✅ Deployment complete!"
echo "🌟 Website is live at: https://smart-automation-ai.github.io/AAA/"