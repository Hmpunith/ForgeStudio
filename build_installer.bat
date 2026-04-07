@echo off
title Build Installer
color 0E

echo ========================================
echo   Building Windows Installer
echo ========================================
echo.

echo [1/3] Installing dependencies...
call npm install
echo.

echo [2/3] Building frontend...
call npm run build
echo.

echo [3/3] Creating installer...
call npm run electron:build:win
echo.

echo ========================================
echo   Build Complete!
echo ========================================
echo.
echo Installer location: release\
echo.
pause
