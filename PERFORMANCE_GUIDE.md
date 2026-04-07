# Performance Optimization Guide

## Your Hardware
- CPU: i5-12450HX (8 cores)
- RAM: 16GB
- GPU: RTX 4050 (6GB VRAM, 105W TGP)

## Recommended Models (Fastest to Slowest)

### 1. qwen2.5-coder:1.5b (FASTEST - Recommended)
```bash
ollama pull qwen2.5-coder:1.5b
```
- Size: ~1GB
- Speed: ~50-80 tokens/sec on your GPU
- Quality: Good for simple apps
- VRAM: ~2GB

### 2. qwen2.5-coder:3b (BALANCED - Currently Set)
```bash
ollama pull qwen2.5-coder:3b
```
- Size: ~2GB
- Speed: ~30-50 tokens/sec on your GPU
- Quality: Better code generation
- VRAM: ~3.5GB

### 3. deepseek-coder:1.3b (ALTERNATIVE)
```bash
ollama pull deepseek-coder:1.3b
```
- Size: ~1GB
- Speed: ~60-90 tokens/sec
- Quality: Good for web apps

### 4. qwen3:8b (SLOWER - Original)
```bash
ollama pull qwen3:8b
```
- Size: ~5GB
- Speed: ~15-25 tokens/sec on your GPU
- Quality: Best quality but slower
- VRAM: ~5.5GB (might be tight on 6GB)

## Check GPU Usage

### Windows PowerShell:
```powershell
# Check if Ollama is using GPU
nvidia-smi

# Should show "ollama" process using GPU memory
```

### Check Ollama GPU Status:
```bash
ollama ps
```

## Optimize Ollama for GPU

### Set Environment Variables (Windows):
```cmd
# In your terminal before running ollama serve
set OLLAMA_NUM_GPU=1
set OLLAMA_GPU_LAYERS=999
ollama serve
```

### Or create a startup script:
Create `start_ollama.bat`:
```batch
@echo off
set OLLAMA_NUM_GPU=1
set OLLAMA_GPU_LAYERS=999
ollama serve
```

## Expected Performance

With RTX 4050 (6GB):
- 1.5B models: ~60 tokens/sec (2-3 sec for simple apps)
- 3B models: ~35 tokens/sec (4-6 sec for simple apps)
- 7-8B models: ~20 tokens/sec (8-12 sec for simple apps)

## Troubleshooting Slow Generation

1. **Check GPU is being used:**
   ```bash
   nvidia-smi
   ```
   Should show ollama using GPU memory

2. **Model too large:**
   - Switch to smaller model (1.5b or 3b)
   - Update in App.tsx: `setSelectedModel('qwen2.5-coder:1.5b')`

3. **CPU fallback:**
   - If GPU not detected, Ollama uses CPU (much slower)
   - Reinstall Ollama or check CUDA drivers

4. **RAM/VRAM full:**
   - Close other apps
   - Use smaller model

## Quick Test

```bash
# Test generation speed
ollama run qwen2.5-coder:3b "write hello world in html"
```

Watch the tokens/sec in the output!
