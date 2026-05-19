@echo off
REM VoiceChat Pro - Windows Startup Script
title VoiceChat Pro Setup

echo.
echo  ==========================================
echo   VoiceChat Pro - Starting Up
echo  ==========================================
echo.

REM Check Node.js
node -v >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed.
    echo Please install Node.js 16+ from https://nodejs.org
    pause
    exit /b 1
)

echo [OK] Node.js is installed:
node -v

REM ---- BACKEND SETUP ----
echo.
echo [1/4] Setting up backend...
cd /d "%~dp0backend"

if not exist "node_modules" (
    echo Installing backend dependencies...
    call npm install
    if %errorlevel% neq 0 (
        echo [ERROR] Backend npm install failed.
        pause
        exit /b 1
    )
)

if not exist ".env" (
    echo Creating .env from .env.example...
    copy .env.example .env
)

echo [OK] Backend ready.

REM ---- FRONTEND SETUP ----
echo.
echo [2/4] Setting up frontend...
cd /d "%~dp0frontend"

if not exist "node_modules" (
    echo Installing frontend dependencies...
    call npm install
    if %errorlevel% neq 0 (
        echo [ERROR] Frontend npm install failed.
        pause
        exit /b 1
    )
)

if not exist ".env.local" (
    echo Creating .env.local from .env.example...
    copy .env.example .env.local
)

echo [OK] Frontend ready.

REM ---- START SERVERS ----
echo.
echo [3/4] Starting backend server (port 5000)...
start "VoiceChat Backend" cmd /k "cd /d "%~dp0backend" && npm run dev"

echo Waiting for backend to initialize...
timeout /t 3 /nobreak >nul

echo.
echo [4/4] Starting frontend server (port 3000)...
start "VoiceChat Frontend" cmd /k "cd /d "%~dp0frontend" && npm start"

echo.
echo  ==========================================
echo   Both servers are starting!
echo.
echo   Backend:  http://localhost:5001
echo   Frontend: http://localhost:3000
echo.
echo   Make sure MongoDB is running on port 27017
echo   (default: mongodb://localhost:27017/voicechat)
echo  ==========================================
echo.
echo The app will open in your browser automatically.
echo Close the backend/frontend windows to stop the servers.
echo.
pause
