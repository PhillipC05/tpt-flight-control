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
cd database

REM Create temporary PHP script
echo ^<?php > setup_sqlite.php
echo try { >> setup_sqlite.php
echo     $db = new PDO('sqlite:flight_control_demo.db'); >> setup_sqlite.php
echo     $db-^>setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION); >> setup_sqlite.php
echo     $sql = file_get_contents('schema.sql'); >> setup_sqlite.php
echo     $db-^>exec($sql); >> setup_sqlite.php
echo     $sql = file_get_contents('demo_schema.sql'); >> setup_sqlite.php
echo     $db-^>exec($sql); >> setup_sqlite.php
echo     // Insert default admin user >> setup_sqlite.php
echo     $stmt = $db-^>prepare(\"INSERT OR IGNORE INTO roles (id, name, display_name, permissions) VALUES (1, 'admin', 'System Administrator', '[]')\"); >> setup_sqlite.php
echo     $stmt-^>execute(); >> setup_sqlite.php
echo     $adminPassword = password_hash('FlightControl@2026!', PASSWORD_DEFAULT); >> setup_sqlite.php
echo     $stmt = $db-^>prepare(\"INSERT OR IGNORE INTO users (id, username, email, password_hash, first_name, last_name, role_id, is_active) VALUES (1, 'admin', 'admin@tptflightcontrol.com', ?, 'System', 'Administrator', 1, 1)\"); >> setup_sqlite.php
echo     $stmt-^>execute([$adminPassword]); >> setup_sqlite.php
echo     echo \"✅ Embedded database created successfully\n\"; >> setup_sqlite.php
echo } catch (Exception $e) { >> setup_sqlite.php
echo     echo \"ERROR: \" . $e-^>getMessage() . \"\n\"; >> setup_sqlite.php
echo     exit(1); >> setup_sqlite.php
echo } >> setup_sqlite.php
echo ?^> >> setup_sqlite.php

php setup_sqlite.php
del setup_sqlite.php
if %ERRORLEVEL% NEQ 0 (
    cd ..
    pause
    exit /b 1
)
cd ..

echo.
echo ============================================
echo Starting Servers
echo ============================================
echo.

echo Starting Backend API Server...
start "Flight Control Backend" cmd /c "cd backend && php -S 0.0.0.0:8000 -t public"

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