@echo off
echo 🚀 Setting up Thumbnail Generation Backend...

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js 18+ first.
    pause
    exit /b 1
)

REM Check if MongoDB is running (basic check)
net start | find "MongoDB" >nul 2>&1
if %errorlevel% neq 0 (
    echo ⚠️  MongoDB service is not running. Please start MongoDB service.
    echo    Run: net start MongoDB
)

REM Check if Redis is running (basic check)
tasklist /FI "IMAGENAME eq redis-server.exe" 2>NUL | find /I /N "redis-server.exe">NUL
if %errorlevel% neq 0 (
    echo ⚠️  Redis is not running. Please start Redis server.
    echo    Download and run Redis from: https://redis.io/download
)

REM Install dependencies
echo 📦 Installing dependencies...
call npm install

REM Create environment file if it doesn't exist
if not exist .env (
    echo 📝 Creating .env file...
    echo NODE_ENV=development> .env
    echo PORT=3001>> .env
    echo MONGODB_URI=mongodb://localhost:27017/thumbnail_app>> .env
    echo REDIS_URL=redis://localhost:6379>> .env
    echo JWT_SECRET=your_super_secret_jwt_key_here_change_this_in_production_%random%%random%%random%>> .env
    echo JWT_EXPIRE=7d>> .env
    echo UPLOAD_PATH=./uploads>> .env
    echo MAX_FILE_SIZE=100000000>> .env
    echo ALLOWED_FILE_TYPES=image/jpeg,image/png,image/gif,video/mp4,video/avi,video/mov>> .env
    echo BCRYPT_ROUNDS=12>> .env
    echo FRONTEND_URL=http://localhost:3000>> .env
    echo ✅ .env file created. Please update JWT_SECRET for production!
) else (
    echo ℹ️  .env file already exists.
)

REM Create uploads directories
echo 📁 Creating upload directories...
if not exist uploads mkdir uploads
if not exist uploads\originals mkdir uploads\originals
if not exist uploads\thumbnails mkdir uploads\thumbnails
if not exist logs mkdir logs

REM Build the project
echo 🔨 Building TypeScript...
call npm run build

echo.
echo 🎉 Setup complete!
echo.
echo To start the development server:
echo   npm run dev
echo.
echo To start in production:
echo   npm run build ^& npm start
echo.
echo API will be available at: http://localhost:3001
echo Health check: http://localhost:3001/api/health
echo.
pause
