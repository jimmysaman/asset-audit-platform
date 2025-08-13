@echo off
echo Starting Asset Audit Web Application...
echo.

echo Checking if node_modules exists...
if not exist node_modules (
    echo Installing dependencies...
    npm install
)

echo.
echo Starting React development server...
echo This may take a moment...
echo.

set BROWSER=none
npm start

pause
