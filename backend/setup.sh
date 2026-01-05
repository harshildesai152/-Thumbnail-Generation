#!/bin/bash

echo "🚀 Setting up Thumbnail Generation Backend..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check if MongoDB is running
if ! pgrep mongod > /dev/null; then
    echo "⚠️  MongoDB is not running. Please start MongoDB service."
    echo "   On macOS: brew services start mongodb/brew/mongodb-community"
    echo "   On Ubuntu: sudo systemctl start mongod"
    echo "   On Windows: net start MongoDB"
fi

# Check if Redis is running
if ! pgrep redis-server > /dev/null; then
    echo "⚠️  Redis is not running. Please start Redis service."
    echo "   On macOS: brew services start redis"
    echo "   On Ubuntu: sudo systemctl start redis-server"
    echo "   On Windows: redis-server --daemonize yes"
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Create environment file if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env file..."
    cat > .env << EOF
NODE_ENV=development
PORT=3001
MONGODB_URI=mongodb://localhost:27017/thumbnail_app
REDIS_URL=redis://localhost:6379
JWT_SECRET=your_super_secret_jwt_key_here_change_this_in_production_$(openssl rand -hex 32)
JWT_EXPIRE=7d
UPLOAD_PATH=./uploads
MAX_FILE_SIZE=100000000
ALLOWED_FILE_TYPES=image/jpeg,image/png,image/gif,video/mp4,video/avi,video/mov
BCRYPT_ROUNDS=12
FRONTEND_URL=http://localhost:3000
EOF
    echo "✅ .env file created. Please update JWT_SECRET for production!"
else
    echo "ℹ️  .env file already exists."
fi

# Create uploads directories
echo "📁 Creating upload directories..."
mkdir -p uploads/originals uploads/thumbnails logs

# Build the project
echo "🔨 Building TypeScript..."
npm run build

echo ""
echo "🎉 Setup complete!"
echo ""
echo "To start the development server:"
echo "  npm run dev"
echo ""
echo "To start in production:"
echo "  npm run build && npm start"
echo ""
echo "API will be available at: http://localhost:3001"
echo "Health check: http://localhost:3001/api/health"
