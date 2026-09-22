@echo off
title Vidya-Vrtti - Unified Scholarship Portal
color 0A

echo ===============================================================================
echo                     Vidya-Vrtti UNIFIED SCHOLARSHIP PORTAL
echo ===============================================================================
echo.

:: Change directory to current script location
cd /d "%~dp0"

:: 1. Ensure MongoDB data directory exists
if not exist "%USERPROFILE%\mongodb_data" (
    echo [INFO] Creating MongoDB data directory at %USERPROFILE%\mongodb_data...
    mkdir "%USERPROFILE%\mongodb_data"
)

:: 2. Check if MongoDB (mongod.exe) is already running
tasklist /FI "IMAGENAME eq mongod.exe" 2>NUL | find /I /N "mongod.exe">NUL
if "%ERRORLEVEL%"=="0" (
    echo [OK] MongoDB is already running.
) else (
    echo [STARTING] Launching MongoDB Server...
    if exist "C:\Program Files\MongoDB\Server\8.3\bin\mongod.exe" (
        start "MongoDB Database Service" /min "C:\Program Files\MongoDB\Server\8.3\bin\mongod.exe" --dbpath "%USERPROFILE%\mongodb_data" --bind_ip 127.0.0.1 --port 27017
    ) else (
        start "MongoDB Database Service" /min mongod --dbpath "%USERPROFILE%\mongodb_data" --bind_ip 127.0.0.1 --port 27017
    )
    timeout /t 3 /nobreak >nul
)

:: 3. Automatically open the browser
start "" http://localhost:5173

echo.
echo ===============================================================================
echo  Application is running!
echo.
echo  Access URLs:
echo   - PC Browser:      http://localhost:5173
echo   - Phone (Wi-Fi):   http://192.168.0.107:5173
echo.
echo  Demo Accounts (Password for all: demo123):
echo   - Student:    student@demo.in
echo   - Institute:  institute@demo.in
echo   - Officer:    officer@demo.in
echo   - Committee:  committee@demo.in
echo   - Admin:      admin@demo.in
echo ===============================================================================
echo.
echo Starting Express Backend and Vite Frontend...
echo.

:: 4. Start Vite + Express concurrently
call npm run dev

pause
