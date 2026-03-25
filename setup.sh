#!/bin/bash

# Sri Geetha Dairy - Full Stack Setup Script
# This script sets up both frontend and backend

echo "🚀 Sri Geetha Dairy - Full Stack Setup"
echo "======================================="

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 16+";
    exit 1;
fi

echo "✅ Node.js version: $(node --version)"

# Check MongoDB
if ! command -v mongod &> /dev/null; then
    echo "⚠️  MongoDB not found locally. Make sure MongoDB is running."
    echo "   Install: brew install mongodb-community"
    echo "   Start: brew services start mongodb-community"
fi

# Install Frontend Dependencies
echo ""
echo "📦 Installing Frontend Dependencies..."
npm install

# Install Backend Dependencies
echo ""
echo "📦 Installing Backend Dependencies..."
cd backend
npm install
cd ..

echo ""
echo "✅ Setup Complete!"
echo ""
echo "🔧 To run the full application:"
echo "   1. Terminal 1 - Start MongoDB (if not running)"
echo "      brew services start mongodb-community"
echo ""
echo "   2. Terminal 2 - Start Backend"
echo "      cd backend && npm run dev"
echo ""
echo "   3. Terminal 3 - Start Frontend"
echo "      npm run dev"
echo ""
echo "📊 Backend API: http://localhost:5000/api"
echo "🎨 Frontend: http://localhost:3001"
echo ""
echo "Happy coding! 🎉"
