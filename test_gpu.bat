@echo off
echo Testing GPU availability...
echo.

REM Check NVIDIA driver
nvidia-smi
echo.

REM Check if Ollama sees GPU
echo Checking Ollama GPU detection...
ollama ps
echo.

echo If you see models loaded above, GPU is being used.
echo If empty, try running: ollama run deepseek-coder:6.7b-instruct "test"
pause
