"""
Separate lightweight server for GPU/CPU metrics monitoring
Runs independently on port 8001 to avoid blocking during generation
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import subprocess
import psutil
import re
import os

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

_nvidia_smi_available = None  # Cache result

def check_nvidia_smi():
    global _nvidia_smi_available
    if _nvidia_smi_available is None:
        try:
            result = subprocess.run(
                ['nvidia-smi', '--query-gpu=name', '--format=csv,noheader'],
                capture_output=True, text=True, timeout=2
            )
            _nvidia_smi_available = result.returncode == 0
        except Exception:
            _nvidia_smi_available = False
    return _nvidia_smi_available


def get_gpu_metrics():
    """Get real-time GPU metrics using nvidia-smi, with safe fallback."""
    if not check_nvidia_smi():
        return {
            'gpu_percent': 0, 'gpu_temp': 0, 'gpu_power': 0,
            'vram_used': 0.0, 'vram_total': 0.0, 'gpu_available': False
        }

    try:
        result = subprocess.run(
            ['nvidia-smi',
             '--query-gpu=utilization.gpu,temperature.gpu,power.draw,memory.used,memory.total',
             '--format=csv,noheader,nounits'],
            capture_output=True, text=True, timeout=2
        )
        if result.returncode == 0:
            raw = result.stdout.strip()
            # handle multiple GPUs - take first GPU
            first_line = raw.split('\n')[0]
            values = [v.strip() for v in first_line.split(',')]
            if len(values) >= 5:
                return {
                    'gpu_percent': float(values[0]),
                    'gpu_temp':    float(values[1]),
                    'gpu_power':   float(values[2]),
                    'vram_used':   round(float(values[3]) / 1024, 2),
                    'vram_total':  round(float(values[4]) / 1024, 2),
                    'gpu_available': True
                }
    except (subprocess.TimeoutExpired, ValueError, IndexError) as e:
        print(f"GPU parse error: {e}")
    except Exception as e:
        print(f"GPU metrics error: {e}")

    return {
        'gpu_percent': 0, 'gpu_temp': 0, 'gpu_power': 0,
        'vram_used': 0.0, 'vram_total': 0.0, 'gpu_available': False
    }


@app.get("/metrics")
async def get_metrics():
    """Lightweight endpoint that returns current system metrics."""
    gpu_metrics = get_gpu_metrics()
    cpu_percent = psutil.cpu_percent(interval=0.1)
    ram = psutil.virtual_memory()

    return {
        "cpu":       round(cpu_percent, 1),
        "ram_used":  round(ram.used  / (1024**3), 2),
        "ram_total": round(ram.total / (1024**3), 2),
        **gpu_metrics
    }


@app.get("/health")
async def health():
    return {"status": "ok"}


if __name__ == "__main__":
    import uvicorn
    print("🔥 Starting metrics server on port 8001...")
    uvicorn.run(app, host="0.0.0.0", port=8001, log_level="error")
