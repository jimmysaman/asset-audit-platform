@echo off
echo Setting up Asset Audit Mobile Application...
echo.

echo Installing dependencies...
call npm install

echo.
echo Checking React Native environment...
call npx react-native doctor

echo.
echo Mobile app setup complete!
echo.
echo To run the app:
echo   For Android: npm run android
echo   For iOS: npm run ios
echo.
echo Make sure you have:
echo   - Android Studio (for Android development)
echo   - Xcode (for iOS development on Mac)
echo   - An emulator or physical device connected
echo.
pause
