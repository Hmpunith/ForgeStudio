# AI Web Builder Studio (Local Bolt.new Clone)

Build web apps with AI - completely locally using Ollama!

## 🚀 Quick Start (One Command)

Just run this:
```cmd
setup_and_run.bat
```

This will:
- Configure Ollama for GPU usage
- Start Ollama with GPU optimization
- Start the backend server
- Start the frontend dev server
- Open the app in your browser

## 📋 System Requirements

### Minimum
- Windows 10/11
- 8GB RAM
- 4+ CPU cores
- Optional: NVIDIA GPU

### Recommended (Your Setup)
- 16GB RAM
- NVIDIA GPU with 6GB+ VRAM
- i5/Ryzen 5 or better

### For 30B+ Models
- 32GB+ RAM
- NVIDIA GPU with 8GB+ VRAM
- i7/Ryzen 7 or better

## 🎯 Supported Models

The project automatically detects and supports ALL Ollama models!

**Recommended for 16GB RAM:**
- qwen2.5-coder:3b (fast, 5-10s)
- deepseek-coder:6.7b (best quality, 10-20s)
- qwen3:8b (excellent, 10-15s)

**For 32GB+ RAM:**
- qwen3-coder:30b (maximum quality, 15-30s)
- deepseek-coder:33b
- Any large model

## 🛑 Stop All Services

```cmd
stop_all.bat
```

## 📊 Features

✅ Real-time GPU/CPU/RAM monitoring
✅ Automatic model detection
✅ Dynamic model switching
✅ Optimized for any hardware
✅ Beautiful dark UI
✅ Live preview
✅ Iterative code generation

## 🔧 Manual Setup

If you prefer to run services separately:

### 1. Install Dependencies

**Backend:**
```cmd
cd backend
pip install -r requirements.txt
```

**Frontend:**
```cmd
npm install
```

### 2. Install Ollama & Models

Download Ollama: https://ollama.ai

Pull a model:
```cmd
ollama pull qwen2.5-coder:3b
```

### 3. Start Services

**Ollama:**
```cmd
start_ollama_gpu.bat
```

**Backend:**
```cmd
cd backend
uvicorn main:app --reload
```

**Frontend:**
```cmd
npm run dev
```

## 📈 Performance Guide

See `PERFORMANCE_GUIDE.md` for optimization tips.

**Expected speeds on RTX 4050:**
- qwen2.5-coder:3b → 5-10 seconds ⚡
- deepseek-coder:6.7b → 10-20 seconds
- qwen3:8b → 10-15 seconds

## 🚢 Deployment

See `DEPLOYMENT_GUIDE.md` for running on different systems.

**Your project automatically scales to:**
- Entry laptops (8GB RAM)
- Gaming laptops (16GB RAM) ← You are here
- Workstations (32GB+ RAM)
- Cloud instances (any size)

No code changes needed!

## 🔍 Troubleshooting

**Slow generation?**
- Run `ollama ps` - check GPU usage
- Try smaller model in settings
- See `FIX_GPU.md`

**Model won't load?**
- Check RAM: `wmic memorychip get capacity`
- See `30B_MODEL_ISSUE.md`

**Preview not working?**
- Check backend console
- Check browser console (F12)

## 📚 Documentation

- `DEPLOYMENT_GUIDE.md` - Running on different systems
- `PERFORMANCE_GUIDE.md` - Optimization tips
- `SAFETY_INFO.md` - Hardware safety info
- `30B_MODEL_ISSUE.md` - Large model troubleshooting
- `FIX_GPU.md` - GPU optimization

## 🎨 Tech Stack

- **Frontend:** React, TypeScript, Tailwind CSS, Vite
- **Backend:** FastAPI, Python
- **AI:** Ollama (local models)
- **Monitoring:** Real-time GPU/CPU metrics

## 🤝 Contributing

This project is ready for deployment on any system with Ollama support!

## 📝 License

MIT

---

**Built with ❤️ for local AI development**

