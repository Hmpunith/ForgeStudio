@echo off
title AI Web Builder - Electron Dev Mode
color 0B

echo ========================================
echo   Electron Development Mode
echo ========================================
echo.

echo [1/5] Installing dependencies...
call npm install
echo.

echo [2/5] Starting Ollama with GPU...
set OLLAMA_NUM_GPU=99
set OLLAMA_GPU_LAYERS=999
start "Ollama" cmd /k "ollama serve"
timeout /t 3 >NUL
echo.

echo [3/5] Starting Main Backend (port 8000)...
cd backend
start "Main Backend" cmd /k "uvicorn main:app --reload --host 0.0.0.0 --port 8000"
timeout /t 2 >NUL
echo.

echo [4/5] Starting Metrics Backend (port 8001)...
start "Metrics" cmd /k "uvicorn metrics_server:app --host 0.0.0.0 --port 8001"
cd ..
timeout /t 2 >NUL
echo.

echo [5/5] Starting Electron...
npm run electron:dev

pause
