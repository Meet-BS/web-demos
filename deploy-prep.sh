#!/bin/bash

echo "🚀 Preparing Web Demos for Render Deployment"
echo "============================================="
echo ""

# Check if we're in a git repository
if [ ! -d ".git" ]; then
    echo "📂 Initializing Git repository..."
    git init
    echo ""
fi

# Check if we have a remote origin
if ! git remote | grep -q "origin"; then
    echo "⚠️  No remote repository found."
    echo "   Please add your GitHub repository URL:"
    echo "   git remote add origin https://github.com/your-username/web-demos.git"
    echo ""
else
    echo "✅ Git repository configured"
    echo ""
fi

# Install all dependencies
echo "📦 Installing dependencies..."
npm run install-all
echo ""

# Run health check
echo "🏥 Running health check..."
if npm run health; then
    echo "✅ All health checks passed!"
else
    echo "❌ Health checks failed. Please fix any issues before deploying."
    exit 1
fi
echo ""

# Add all files to git
echo "📝 Staging files for git..."
git add .
echo ""

# Check git status
echo "📊 Git status:"
git status --short
echo ""

echo "🎯 Ready for deployment!"
echo ""
echo "Next steps:"
echo "1. Commit your changes:"
echo "   git commit -m 'Ready for Render deployment'"
echo ""
echo "2. Push to GitHub:"
echo "   git push origin main"
echo ""
echo "3. Deploy on Render:"
echo "   - Go to https://dashboard.render.com"
echo "   - Create new Web Service"
echo "   - Connect your GitHub repo"
echo "   - Use build command: npm run install-all"
echo "   - Use start command: npm start"
echo "   - Set NODE_ENV=production"
echo ""
echo "📖 See DEPLOYMENT.md for detailed instructions"
