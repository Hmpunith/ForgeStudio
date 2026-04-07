# Fix Ollama GPU Usage

## Problem
Your Ollama is using 91% CPU and only 9% GPU. This makes generation very slow.

## Solution

### Option 1: Set Environment Variables (Recommended)

1. **Stop Ollama** (close the terminal running `ollama serve`)

2. **Set Windows Environment Variables:**
   - Press `Win + R`, type `sysdm.cpl`, press Enter
   - Go to "Advanced" tab → "Environment Variables"
   - Under "User variables", click "New"
   - Add these variables:
     ```
     Variable: OLLAMA_NUM_GPU
     Value: 1
     
     Variable: OLLAMA_GPU_LAYERS  
     Value: 999
     ```

3. **Restart your computer** (important for env vars to take effect)

4. **Start Ollama normally:**
   ```cmd
   ollama serve
   ```

### Option 2: Use the Batch Script (Quick Fix)

1. **Stop Ollama** (close current ollama serve)

2. **Run the GPU-optimized script:**
   ```cmd
   start_ollama_gpu.bat
   ```

3. This sets GPU variables temporarily for this session

### Option 3: Reinstall Ollama

If above doesn't work, your Ollama might not have GPU support:

1. Download latest Ollama from: https://ollama.ai/download
2. Make sure you have CUDA installed
3. Reinstall Ollama

## Verify GPU Usage

After applying fix, check with:
```cmd
ollama ps
```

You should see something like:
```
NAME                    PROCESSOR
deepseek-coder:6.7b    100% GPU    ← This is what we want!
```

Or at least:
```
deepseek-coder:6.7b    10%/90% CPU/GPU    ← Much better!
```

## Check CUDA

Make sure CUDA is installed:
```cmd
nvidia-smi
```

Should show CUDA version in top right.

## Alternative: Use Smaller Model on GPU

If GPU still won't work fully, use a smaller model that fits entirely in VRAM:

```cmd
ollama pull qwen2.5-coder:3b
```

Then update your app to use `qwen2.5-coder:3b` - it will run faster on partial GPU.

## Expected Performance After Fix

With proper GPU usage on RTX 4050:
- deepseek-coder:6.7b → 15-25 tokens/sec (6-10 sec for apps)
- qwen2.5-coder:3b → 40-60 tokens/sec (3-5 sec for apps)

Currently you're getting ~5-10 tokens/sec because of CPU bottleneck.
