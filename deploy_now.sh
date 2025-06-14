#!/bin/bash

# 🚀 Immediate GitHub Deployment Script
# ====================================
# Simple, reliable script to push changes to GitHub immediately

echo "🚀 GitHub Live Deployment Starting..."
echo "====================================="

# Check if we're in a git repository
if [ ! -d ".git" ]; then
    echo "❌ Not in a Git repository. Initializing..."
    git init
    git remote add origin https://github.com/smart-automation-ai/AAA.git
fi

# Configure Git user if not set
if ! git config user.name >/dev/null 2>&1; then
    git config user.name "Auto Deploy"
    echo "✅ Git user configured"
fi

if ! git config user.email >/dev/null 2>&1; then
    git config user.email "deploy@github.com"
    echo "✅ Git email configured"
fi

# Check current status
echo ""
echo "📊 Current Git Status:"
git status --short

# Add all changes
echo ""
echo "📦 Adding all changes..."
git add .

# Create commit with timestamp
COMMIT_MSG="🚀 Live update: $(date '+%Y-%m-%d %H:%M:%S')"
echo ""
echo "💾 Committing changes..."
git commit -m "$COMMIT_MSG" || echo "ℹ️ No changes to commit"

# Push to GitHub
echo ""
echo "🌐 Pushing to GitHub..."
echo "Repository: https://github.com/smart-automation-ai/AAA"

if git push origin main; then
    echo ""
    echo "🎉 SUCCESS! Your changes are now live on GitHub!"
    echo "🌐 GitHub Pages will update automatically in 1-2 minutes"
    echo "📱 Live site: https://smart-automation-ai.github.io/AAA/"
    echo ""
    echo "✅ Deployment completed successfully!"
else
    echo ""
    echo "⚠️ Push failed. This might be due to authentication."
    echo ""
    echo "🔧 To fix authentication issues:"
    echo "1. Generate a Personal Access Token at: https://github.com/settings/tokens"
    echo "2. Use your GitHub username and the token as password when prompted"
    echo ""
    echo "Or set up SSH keys for seamless authentication:"
    echo "1. Generate SSH key: ssh-keygen -t ed25519 -C 'your-email@example.com'"
    echo "2. Add to GitHub: https://github.com/settings/ssh/new"
    echo "3. Update remote: git remote set-url origin git@github.com:smart-automation-ai/AAA.git"
    echo ""
    echo "🔄 Try running this script again after setting up authentication"
fi

echo ""
echo "📋 Next Steps:"
echo "- Your GitHub Actions workflow will automatically deploy changes"
echo "- Monitor deployment at: https://github.com/smart-automation-ai/AAA/actions"
echo "- Check your live site: https://smart-automation-ai.github.io/AAA/" 