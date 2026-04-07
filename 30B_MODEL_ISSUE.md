# 30B Model Won't Run - Not Enough RAM

## The Problem

Your 30B model needs **13.6GB RAM** but you only have **12.6GB available**.

```
Model needs: 13.6 GB
Available:   12.6 GB
Missing:     1.0 GB ❌
```

## Why This Happens

Your 16GB RAM is split:
- Windows: ~2-3GB
- Background apps: ~1-2GB
- Available: ~12.6GB
- **30B model needs: 13.6GB** ❌

## Solutions

### Option 1: Free Up Memory (Try This First)

1. **Run the cleanup script:**
   ```cmd
   fix_30b_memory.bat
   ```
   This closes Chrome, Discord, Spotify, etc.

2. **Manually close apps:**
   - Close all browser tabs
   - Close Discord, Spotify, Steam
   - Close any games or heavy apps
   - Check Task Manager (Ctrl+Shift+Esc)

3. **Restart your PC:**
   - Fresh start = more free RAM
   - Then immediately try 30B model

### Option 2: Use 8B Model Instead (Recommended)

You have **qwen3:8b** which is much better for your system:

```
qwen3:8b
- Size: 5.2GB (fits in RAM easily)
- Speed: 10-15 seconds
- Quality: Very good
- Fits: Mostly in GPU VRAM
```

**To use it:**
1. Open Settings
2. Select "qwen3:8b"
3. Much faster and works perfectly!

### Option 3: Use 6.7B Model (Best Balance)

**deepseek-coder:6.7b-instruct** is the sweet spot:

```
deepseek-coder:6.7b
- Size: 3.8GB (perfect fit)
- Speed: 10-20 seconds
- Quality: Excellent for code
- Fits: Mostly in GPU
```

This is what I recommend for your system!

## Model Comparison for Your System

| Model | Size | RAM Needed | Speed | Quality | Works? |
|-------|------|------------|-------|---------|--------|
| qwen2.5-coder:1.5b | 1GB | 2GB | 3-5s | Good | ✅ Perfect |
| qwen2.5-coder:3b | 2GB | 3GB | 5-10s | Very Good | ✅ Perfect |
| deepseek-coder:6.7b | 4GB | 5GB | 10-20s | Excellent | ✅ Perfect |
| qwen3:8b | 5GB | 6GB | 10-15s | Excellent | ✅ Perfect |
| **qwen3-coder:30b** | **18GB** | **13.6GB** | **30-90s** | **Best** | ❌ **Too Large** |

## Why 30B Doesn't Fit

Your system breakdown:
```
Total RAM:        16.0 GB
Windows:          -2.5 GB
Background apps:  -1.0 GB
Available:        12.5 GB

30B model needs:  13.6 GB ❌ (1.1 GB short)
```

## What You Can Do

### Immediate Solution:
**Use deepseek-coder:6.7b** - it's the best model for your system!

1. Open Settings (gear icon)
2. Select "deepseek-coder:6.7b-instruct"
3. Enjoy fast, high-quality code generation

### If You Really Want 30B:

You would need:
- 32GB RAM (upgrade from 16GB)
- Or close EVERYTHING (might work with 12.8GB free)

But honestly, **6.7B or 8B is perfect for your system** and gives 90% of the quality at 3x the speed!

## Recommended Setup

**For your RTX 4050 + 16GB RAM:**

1. **Daily use:** qwen2.5-coder:3b (fast, good quality)
2. **Best quality:** deepseek-coder:6.7b (excellent code)
3. **Alternative:** qwen3:8b (very good, slightly slower)

All of these work perfectly on your system!

## Testing Models

To test if a model fits:
```cmd
ollama run MODEL_NAME "test"
```

Examples:
```cmd
ollama run qwen3:8b "test"              ✅ Works
ollama run deepseek-coder:6.7b "test"   ✅ Works
ollama run qwen3-coder:30b "test"       ❌ Out of memory
```

## Bottom Line

**The 30B model is too large for 16GB RAM.**

Use these instead:
- **Best choice:** deepseek-coder:6.7b-instruct
- **Fastest:** qwen2.5-coder:3b
- **Alternative:** qwen3:8b

All give excellent results and work perfectly on your system! 🎉
