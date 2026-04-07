# Quick Start Guide

## 🚀 Running the App

### Web Browser Mode (Recommended for Development)
```bash
setup_and_run.bat
```
Opens at http://localhost:3000

### Desktop App Mode
```bash
start_electron_dev.bat
```
Opens in native window

## 📦 Building Installer

```bash
build_installer.bat
```
Creates installer in `release/` folder

## 🔧 What's Running

### Three Backends (All Independent)
1. **Ollama** (port 11434) - AI models
2. **Main Backend** (port 8000) - Chat & code generation
3. **Metrics Backend** (port 8001) - GPU/CPU monitoring

### Why Separate Metrics?
- ✅ GPU stats never freeze during generation
- ✅ Real-time monitoring always works
- ✅ No blocking or delays
- ✅ Independent from main operations

## 🎯 Development Workflow

1. **Edit code** - Make your changes
2. **Test in browser** - `setup_and_run.bat`
3. **Test in Electron** - `start_electron_dev.bat`
4. **Build installer** - `build_installer.bat`
5. **Distribute** - Share the .exe from `release/`

## 📁 Key Files

- `setup_and_run.bat` - Start all services (browser)
- `start_electron_dev.bat` - Start in Electron window
- `build_installer.bat` - Create Windows installer
- `backend/main.py` - Main backend (chat/code)
- `backend/metrics_server.py` - Metrics backend (GPU/CPU)
- `electron/main.js` - Electron configuration

## 🎨 Customization

### Change App Name
Edit `package.json`:
```json
{
  "productName": "Your App Name"
}
```

### Change Window Size
Edit `electron/main.js`:
```javascript
width: 1400,
height: 900
```

### Add App Icon
Replace `electron/icon.png` with your 256x256 PNG

## 🐛 Troubleshooting

### Metrics Stop During Generation
- Fixed! Metrics now run on separate backend (port 8001)
- Should never stop anymore

### Port Already in Use
- Close other instances
- Or change ports in `electron/main.js` and `App.tsx`

### Build Fails
```bash
npm install
npm run build
```

## 📚 More Info

- Full Electron guide: `ELECTRON_GUIDE.md`
- Deployment info: `DEPLOYMENT_GUIDE.md`
- Features list: `FEATURES_COMPLETE.md`
