@echo off
title AI Web Builder - Complete Setup
color 0A

echo ========================================
echo   AI Web Builder Studio - GPU Setup
echo ========================================
echo.

REM Set GPU environment variables for this session
set OLLAMA_NUM_GPU=99
set OLLAMA_GPU_LAYERS=999
set CUDA_VISIBLE_DEVICES=0

echo [1/5] GPU Environment Variables Set
echo   - OLLAMA_NUM_GPU=99 (use all GPU layers)
echo   - OLLAMA_GPU_LAYERS=999
echo   - CUDA_VISIBLE_DEVICES=0
echo.

REM Check if Ollama is running
tasklist /FI "IMAGENAME eq ollama.exe" 2>NUL | find /I /N "ollama.exe">NUL
if "%ERRORLEVEL%"=="0" (
    echo [2/5] Stopping existing Ollama...
    taskkill /F /IM ollama.exe >NUL 2>&1
    timeout /t 2 >NUL
)

echo [2/5] Starting Ollama with GPU optimization...
start "Ollama GPU" cmd /k "set OLLAMA_NUM_GPU=99 && set OLLAMA_GPU_LAYERS=999 && ollama serve"
timeout /t 3 >NUL
echo.

echo [3/5] Starting Main Backend (port 8000)...
cd backend
start "Backend" cmd /k "title Main Backend && uvicorn main:app --reload --host 0.0.0.0 --port 8000"
timeout /t 2 >NUL
echo.

echo [4/5] Starting Metrics Backend (port 8001)...
start "Metrics" cmd /k "title Metrics Server && uvicorn metrics_server:app --host 0.0.0.0 --port 8001"
cd ..
timeout /t 2 >NUL
echo.

echo [5/5] Starting Frontend...
start "Frontend" cmd /k "title Frontend Dev Server && npm run dev"
echo.

echo ========================================
echo   All services started!
echo ========================================
echo.
echo   Ollama:    Running with GPU optimization
echo   Main Backend:   http://localhost:8000
echo   Metrics:        http://localhost:8001
echo   Frontend:       http://localhost:3000
echo.
echo   Check GPU usage: ollama ps
echo.
echo Press any key to open the app in browser...
pause >NUL

start http://localhost:3000

echo.
echo To stop all services, close the terminal windows.
echo.
pause
