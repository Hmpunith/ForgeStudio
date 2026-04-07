@echo off
echo ========================================
echo   Free Memory for 30B Model
echo ========================================
echo.

echo Closing unnecessary applications...
echo.

REM Close common memory-hungry apps
taskkill /F /IM chrome.exe >NUL 2>&1
taskkill /F /IM msedge.exe >NUL 2>&1
taskkill /F /IM firefox.exe >NUL 2>&1
taskkill /F /IM discord.exe >NUL 2>&1
taskkill /F /IM spotify.exe >NUL 2>&1
taskkill /F /IM teams.exe >NUL 2>&1

echo Clearing system cache...
echo.

REM Clear standby memory (requires admin)
echo This may require administrator privileges...
powershell -Command "Clear-RecycleBin -Force -ErrorAction SilentlyContinue"

echo.
echo ========================================
echo   Memory freed!
echo ========================================
echo.
echo Now try running the 30B model again.
echo.
echo If still fails, you need to:
echo 1. Close more applications
echo 2. Restart your PC
echo 3. Use a smaller model (6.7B or 8B)
echo.
pause
