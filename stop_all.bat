@echo off
echo Stopping all services...

taskkill /F /IM ollama.exe >NUL 2>&1
taskkill /F /IM python.exe >NUL 2>&1
taskkill /F /IM node.exe >NUL 2>&1

echo All services stopped.
pause
