#!/bin/bash
# Quick start script for VoiceChat Pro

echo "🚀 Starting VoiceChat Pro..."
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 16+ first."
    exit 1
fi

echo "✅ Node.js version: $(node -v)"
echo "✅ npm version: $(npm -v)"
echo ""

# Navigate to backend
echo "📦 Starting backend setup..."
cd backend

if [ ! -d "node_modules" ]; then
    echo "📥 Installing backend dependencies..."
    npm install
else
    echo "✅ Backend dependencies already installed"
fi

# Check if .env exists
if [ ! -f ".env" ]; then
    echo "⚠️  .env file not found. Please create .env with required variables."
    echo "📝 Using .env.example as template..."
    cp .env.example .env
fi

echo "✅ Backend ready!"
echo ""

# Navigate to frontend
echo "📦 Starting frontend setup..."
cd ../frontend

if [ ! -d "node_modules" ]; then
    echo "📥 Installing frontend dependencies..."
    npm install
else
    echo "✅ Frontend dependencies already installed"
fi

# Check if .env.local exists
if [ ! -f ".env.local" ]; then
    echo "⚠️  .env.local file not found. Please create .env.local with required variables."
    echo "📝 Using .env.example as template..."
    cp .env.example .env.local
fi

echo "✅ Frontend ready!"
echo ""

echo "🎉 Setup complete!"
echo ""
echo "📝 Next steps:"
echo "1. Make sure MongoDB is running:"
echo "   mongod"
echo ""
echo "2. Start backend (in backend/ directory):"
echo "   npm run dev"
echo ""
echo "3. Start frontend (in frontend/ directory, new terminal):"
echo "   npm start"
echo ""
echo "4. Open http://localhost:3000 in your browser"
echo ""
echo "✨ Happy chatting!"
