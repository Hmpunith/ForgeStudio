# Using the 30B Model

## What to Expect

Your qwen3-coder:30b (18GB) is much larger than your 6GB VRAM.

**Performance:**
- Generation time: 30-90 seconds per request
- GPU usage: 100% (but bottlenecked)
- RAM usage: 12-14GB (model overflow)
- VRAM usage: 5.5-6GB (maxed out)

**Why so slow?**
- Only ~6GB fits in GPU VRAM
- Remaining ~12GB loads into system RAM
- GPU constantly waits for data from RAM
- RAM is 10-20x slower than VRAM

## How to Use It

1. **Open Settings** (gear icon)
2. **Select "qwen3-coder:30b"** from dropdown
3. **Be patient** - first generation takes 60-90 seconds
4. **Watch metrics** - you'll see:
   - GPU: 100%
   - VRAM: 5.5-6GB (maxed)
   - RAM: 12-14GB
   - CPU: 40-60%

## Tips for 30B Model

**1. Use shorter prompts:**
```
"todo app"
"calculator"
"weather dashboard"
```

**2. Don't iterate too much:**
- Each change takes 30-60 seconds
- Plan your app before generating

**3. Close other apps:**
- Free up RAM
- Close Chrome tabs, Discord, etc.

**4. First generation is slowest:**
- Model loads into memory
- Subsequent generations are faster (20-40s)

## Is It Worth It?

**Pros:**
- Best code quality
- Better understanding of complex requests
- More creative solutions
- Better formatting

**Cons:**
- 30-90 seconds per generation
- High RAM usage
- System may feel sluggish

## Recommended Workflow

**For best experience:**

1. **Start with 30B for initial generation:**
   - Get high-quality base code
   - Takes 60-90s but worth it

2. **Switch to 3B for iterations:**
   - Quick tweaks and changes
   - 5-10s per change

3. **Back to 30B for major features:**
   - Complex additions
   - Refactoring

## Alternative: Use 6.7B Instead

If 30B is too slow, try **deepseek-coder:6.7b-instruct**:
- Fits mostly in VRAM
- 10-20 second generation
- Still excellent quality
- Much better than 3B

## Monitor Performance

Watch the status bar:
- If VRAM is maxed (6GB) → model too large
- If RAM is high (>12GB) → model overflowing
- If GPU is 100% but slow → RAM bottleneck

## When to Use Each Model

- **qwen2.5-coder:3b** → Quick iterations, simple apps (5-10s)
- **deepseek-coder:6.7b** → Best balance (10-20s)
- **qwen3-coder:30b** → Maximum quality, complex apps (30-90s)

The 30B model will work, but you'll need patience!
