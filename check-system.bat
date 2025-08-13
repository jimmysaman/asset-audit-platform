@echo off
echo Asset Audit Platform - System Status Check
echo ==========================================
echo.

echo Checking Node.js installation...
node --version
if %errorlevel% neq 0 (
    echo ERROR: Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)

echo.
echo Checking npm installation...
npm --version
if %errorlevel% neq 0 (
    echo ERROR: npm is not available
    pause
    exit /b 1
)

echo.
echo Checking backend dependencies...
cd backend
if exist node_modules (
    echo ✓ Backend dependencies installed
) else (
    echo Installing backend dependencies...
    call npm install
)

echo.
echo Checking web dependencies...
cd ..\web
if exist node_modules (
    echo ✓ Web dependencies installed
) else (
    echo Installing web dependencies...
    call npm install
)

echo.
echo Checking mobile dependencies...
cd ..\mobile
if exist node_modules (
    echo ✓ Mobile dependencies installed
) else (
    echo Installing mobile dependencies...
    call npm install
)

cd ..

echo.
echo ==========================================
echo System Status Summary:
echo ==========================================
echo ✓ Node.js and npm are available
echo ✓ All dependencies are installed
echo.
echo To start the system:
echo 1. Backend API: cd backend && node test-server.js
echo 2. Web App: cd web && npm start
echo 3. Mobile App: cd mobile && npm run android (or ios)
echo.
echo Web Application URL: http://localhost:3000
echo Backend API URL: http://localhost:5000
echo.
echo Default Login:
echo   Username: admin
echo   Password: admin123
echo.
pause
