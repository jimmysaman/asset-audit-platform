@echo off
echo Starting Asset Audit Platform Demo...
echo =====================================
echo.

echo Starting Backend Server...
start "Backend Server" cmd /k "cd backend && node test-server.js"

echo Waiting for backend to start...
timeout /t 3 /nobreak > nul

echo Starting Web Application...
start "Web Application" cmd /k "cd web && npm start"

echo.
echo =====================================
echo Demo Environment Starting...
echo =====================================
echo.
echo Backend API will be available at: http://localhost:5000
echo Web Application will be available at: http://localhost:3000
echo.
echo Default Login Credentials:
echo   Username: admin
echo   Password: admin123
echo.
echo The web browser will open automatically in a few seconds...
echo.

timeout /t 10 /nobreak > nul

echo Opening web application...
start http://localhost:3000

echo.
echo Demo environment is ready!
echo.
echo To stop the demo:
echo 1. Close the Backend Server window
echo 2. Close the Web Application window
echo 3. Close this window
echo.
pause
