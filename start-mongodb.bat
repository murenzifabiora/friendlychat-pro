@echo off
title Start MongoDB
echo.
echo  ==========================================
echo   Starting MongoDB
echo  ==========================================
echo.

REM Try common MongoDB install paths
set MONGO_PATHS=^
"C:\Program Files\MongoDB\Server\7.0\bin\mongod.exe" ^
"C:\Program Files\MongoDB\Server\6.0\bin\mongod.exe" ^
"C:\Program Files\MongoDB\Server\5.0\bin\mongod.exe" ^
"C:\Program Files\MongoDB\Server\4.4\bin\mongod.exe"

set MONGO_EXE=

for %%P in (%MONGO_PATHS%) do (
    if exist %%P (
        set MONGO_EXE=%%P
        goto :found
    )
)

REM Try PATH
mongod --version >nul 2>&1
if %errorlevel% equ 0 (
    set MONGO_EXE=mongod
    goto :found
)

echo [ERROR] MongoDB not found.
echo.
echo Please install MongoDB Community Edition from:
echo https://www.mongodb.com/try/download/community
echo.
echo Or if already installed, start it manually:
echo   mongod --dbpath "C:\data\db"
echo.
pause
exit /b 1

:found
echo [OK] Found MongoDB: %MONGO_EXE%
echo.

REM Create data directory if it doesn't exist
if not exist "C:\data\db" (
    echo Creating data directory C:\data\db ...
    mkdir "C:\data\db"
)

echo Starting MongoDB on port 27017...
echo Data directory: C:\data\db
echo.
echo Press Ctrl+C to stop MongoDB.
echo.
%MONGO_EXE% --dbpath "C:\data\db" --port 27017
