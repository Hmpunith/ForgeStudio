@echo off
echo Starting Ollama with GPU optimization...
echo.

REM Set environment variables for GPU usage
set OLLAMA_NUM_GPU=1
set OLLAMA_GPU_LAYERS=999
set CUDA_VISIBLE_DEVICES=0

echo GPU Settings:
echo - OLLAMA_NUM_GPU=1
echo - OLLAMA_GPU_LAYERS=999
echo - CUDA_VISIBLE_DEVICES=0
echo.

REM Start Ollama
ollama serve
