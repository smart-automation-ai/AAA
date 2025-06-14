#!/bin/bash

echo "🔧 Updating GitHub Pages Site"
echo "============================="

# Check if changes are committed
if git diff --quiet && git diff --staged --quiet; then
    echo "✅ All changes are committed"
else
    echo "⚠️  You have uncommitted changes. Please commit them first:"
    echo "   git add ."
    echo "   git commit -m 'Your commit message'"
    exit 1
fi

echo ""
echo "📋 To update your live site at https://smart-automation-ai.github.io/AAA/"
echo "You have several options:"
echo ""
echo "1. 🌐 GitHub Web Interface (Recommended):"
echo "   - Go to: https://github.com/smart-automation-ai/AAA"
echo "   - Click 'Upload files' or edit files directly"
echo "   - Copy the changes from the patch file: 0001-Fix-debug-issues-Remove-console-logs-improve-error-h.patch"
echo ""
echo "2. 🔑 Set up Personal Access Token:"
echo "   - Go to: https://github.com/settings/tokens"
echo "   - Generate new token with 'repo' permissions"
echo "   - Use token as password when pushing"
echo ""
echo "3. 🔐 Set up SSH Key:"
echo "   - Generate SSH key: ssh-keygen -t ed25519 -C 'your-email@example.com'"
echo "   - Add to GitHub: https://github.com/settings/keys"
echo "   - Change remote: git remote set-url origin git@github.com:smart-automation-ai/AAA.git"
echo ""
echo "📄 Patch file created: 0001-Fix-debug-issues-Remove-console-logs-improve-error-h.patch"
echo "   This contains all the debug fixes ready to apply"
echo ""
echo "✅ Debug fixes are ready to deploy!"