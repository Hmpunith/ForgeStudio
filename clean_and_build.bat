@echo off
title Clean and Build Installer
color 0E

echo ========================================
echo   Cleaning and Building Installer
echo ========================================
echo.

echo [1/4] Stopping any running processes...
taskkill /F /IM "AI Web Builder Studio.exe" 2>nul
taskkill /F /IM electron.exe 2>nul
timeout /t 2 >nul
echo.

echo [2/4] Cleaning old build...
if exist release rmdir /s /q release
if exist dist rmdir /s /q dist
echo.

echo [3/4] Building frontend...
call npm run build
echo.

echo [4/4] Creating installer...
call npm run electron:build:win
echo.

echo ========================================
echo   Build Complete!
echo ========================================
echo.
echo Installer location: release\
echo.
pause
