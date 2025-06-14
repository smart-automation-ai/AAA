#!/bin/bash

echo "🛡️ Azeroth Automation - Deployment Script"
echo "=========================================="

# Check if we're in the right directory
if [ ! -f "index.html" ]; then
    echo "❌ Error: index.html not found. Please run this script from the project root."
    exit 1
fi

echo "✅ Project files found"

# Create necessary directories
mkdir -p api
mkdir -p .github/workflows

echo "✅ Directories created"

# Set up Python virtual environment
if command -v python3 &> /dev/null; then
    echo "🐍 Setting up Python environment..."
    python3 -m venv venv
    source venv/bin/activate
    pip install -r requirements.txt
    echo "✅ Python environment ready"
else
    echo "⚠️  Python3 not found. Please install Python 3.8+ to run the API"
fi

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "🔧 Initializing Git repository..."
    git init
    git add .
    git commit -m "Initial commit: Azeroth Automation AI Review Generator"
    echo "✅ Git repository initialized"
fi

echo ""
echo "🚀 Deployment Options:"
echo "======================"
echo ""
echo "1. 📱 Frontend (GitHub Pages):"
echo "   - Push this repository to GitHub"
echo "   - Enable GitHub Pages in repository settings"
echo "   - Your site will be available at: https://yourusername.github.io/AA/"
echo ""
echo "2. 🖥️  Backend API (Heroku):"
echo "   - Install Heroku CLI: https://devcenter.heroku.com/articles/heroku-cli"
echo "   - Run: heroku create your-app-name"
echo "   - Run: git push heroku main"
echo "   - Set environment variable: heroku config:set OPENAI_API_KEY=your-key"
echo ""
echo "3. 🔧 Local Development:"
echo "   - Frontend: Open index.html in your browser"
echo "   - Backend: python api/review-generator.py"
echo ""
echo "📋 Next Steps:"
echo "=============="
echo "1. Get OpenAI API key from: https://platform.openai.com/api-keys"
echo "2. Update the API endpoint in script.js if using remote backend"
echo "3. Customize business information in the HTML/CSS"
echo "4. Test the review generator tool"
echo "5. Deploy to your preferred hosting platform"
echo ""
echo "💡 For Tipton County businesses:"
echo "   - Update contact information with your real details"
echo "   - Add your actual business phone/email"
echo "   - Customize pricing based on your business model"
echo ""
echo "✅ Setup complete! Ready to start making money with AI automation."

# Make the script executable
chmod +x deploy.sh 