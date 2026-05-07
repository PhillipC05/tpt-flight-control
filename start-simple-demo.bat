@echo off
echo ============================================
echo   Flight Control System - ZERO SETUP DEMO
echo ============================================
echo.
echo NO DOCKER. NO POSTGRESQL. NO INSTALLATION.
echo This uses embedded SQLite database. 100% automatic.
echo.

REM Check if PHP is available
php --version >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: PHP is required but not found.
    echo Please install PHP 8.2+ and add it to your PATH.
    echo.
    pause
    exit /b 1
)

echo ✅ PHP found
echo.

echo Creating embedded SQLite database...
php database\setup-sqlite.php
if %ERRORLEVEL% NEQ 0 (
    pause
    exit /b 1
)

echo.
echo ============================================
echo Starting Servers
echo ============================================
echo.

echo Starting Backend API Server...
start "Flight Control Backend" cmd /c "cd backend && php -S 0.0.0.0:8000 -t api"

timeout /t 3 /nobreak >nul

echo Starting Frontend Server...
start "Flight Control Frontend" cmd /c "cd frontend && npm run dev"

echo Starting WebSocket Server...
start "Flight Control WebSocket" cmd /c "cd backend && php websocket-server.php"

timeout /t 2 /nobreak >nul

echo.
echo ============================================
echo ✅ DEMO READY!
echo ============================================
echo.
echo Open your browser: http://localhost:5173
echo.
echo Default login:
echo   Username: admin
echo   Password: FlightControl@2026!
echo.
echo All data is stored locally in database/flight_control_demo.db
echo No external services required.
echo.
pause

start http://localhost:5173