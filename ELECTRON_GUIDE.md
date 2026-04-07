# Electron Desktop App Guide

## Overview
Your app can now be packaged as an installable Windows/Mac/Linux desktop application while remaining easy to develop and update.

## Development Mode

### Option 1: Web Browser (Current)
```bash
setup_and_run.bat
```
- Opens in browser at http://localhost:5173
- Best for rapid development
- Hot reload works perfectly

### Option 2: Electron Window
```bash
npm install
npm run electron:dev
```
- Opens in native desktop window
- Same hot reload as browser
- Test desktop-specific features

## Building Installable App

### First Time Setup
```bash
npm install
```

### Build for Windows
```bash
npm run electron:build:win
```
Creates installer in `release/` folder:
- `AI Web Builder Studio Setup.exe` - Installer
- Users can install to Program Files
- Creates desktop shortcut
- Appears in Start Menu

### Build for Mac
```bash
npm run electron:build:mac
```
Creates `AI Web Builder Studio.dmg`

### Build for Linux
```bash
npm run electron:build:linux
```
Creates `AI Web Builder Studio.AppImage`

## How It Works

### Architecture
```
Desktop App
├── Electron Window (UI)
├── Main Backend (port 8000) - Chat & Code Generation
├── Metrics Backend (port 8001) - GPU/CPU Monitoring
└── Ollama (port 11434) - Local AI Models
```

### Separate Metrics Backend
The metrics server runs independently on port 8001, so:
- ✅ GPU/CPU monitoring never stops
- ✅ Continues updating during code generation
- ✅ No blocking or freezing
- ✅ Real-time stats always available

### What Gets Packaged
- Frontend (React/Vite build)
- Backend Python code
- Electron wrapper
- Your app icon

### What Users Need
Users must install separately:
1. Python 3.10+ (for backend)
2. Ollama (for AI models)
3. CUDA/GPU drivers (for GPU acceleration)

## Development Workflow

### Making Updates
1. Edit your code normally
2. Test in browser: `setup_and_run.bat`
3. Test in Electron: `npm run electron:dev`
4. Build new version: `npm run electron:build:win`
5. Distribute new installer

### Version Updates
Update version in `package.json`:
```json
{
  "version": "1.1.0"
}
```

## File Structure
```
project/
├── electron/
│   ├── main.js          # Electron main process
│   ├── preload.js       # Security bridge
│   └── icon.png         # App icon (add your own)
├── backend/
│   ├── main.py          # Main backend (port 8000)
│   └── metrics_server.py # Metrics backend (port 8001)
├── dist/                # Built frontend (after npm run build)
└── release/             # Installers (after electron:build)
```

## Customization

### App Icon
Replace `electron/icon.png` with your own:
- Windows: 256x256 PNG
- Mac: 512x512 PNG
- Linux: 512x512 PNG

### App Name
Edit `package.json`:
```json
{
  "name": "your-app-name",
  "productName": "Your App Display Name",
  "description": "Your app description"
}
```

### Window Size
Edit `electron/main.js`:
```javascript
mainWindow = new BrowserWindow({
  width: 1600,  // Change width
  height: 1000, // Change height
  // ...
});
```

## Distribution

### Windows
- Share the `.exe` installer from `release/`
- Users double-click to install
- ~100-200MB file size

### Auto-Updates (Optional)
For automatic updates, integrate:
- electron-updater
- GitHub Releases
- Or your own update server

## Benefits

### For Development
- ✅ Keep using browser for fast dev
- ✅ Hot reload still works
- ✅ No build step needed for testing
- ✅ Easy debugging

### For Users
- ✅ Professional desktop app
- ✅ No browser needed
- ✅ Desktop shortcuts
- ✅ Native notifications (future)
- ✅ System tray integration (future)

### For Distribution
- ✅ Single installer file
- ✅ Professional installation experience
- ✅ Easy version management
- ✅ Can add auto-updates later

## Troubleshooting

### Build Fails
```bash
# Clear cache and rebuild
rm -rf node_modules dist release
npm install
npm run build
npm run electron:build:win
```

### Backend Not Starting
Check `electron/main.js` paths are correct for your Python installation.

### Port Conflicts
If ports 8000/8001 are in use:
- Edit `electron/main.js` to change ports
- Update `App.tsx` fetch URLs to match

## Next Steps

1. Add your app icon to `electron/icon.png`
2. Test in Electron: `npm run electron:dev`
3. Build installer: `npm run electron:build:win`
4. Test installation on clean Windows machine
5. Distribute to users!

## Notes

- Metrics backend (port 8001) runs independently - never blocks
- Main backend (port 8000) handles chat and code generation
- Both backends start automatically with the app
- GPU monitoring continues smoothly during generation
