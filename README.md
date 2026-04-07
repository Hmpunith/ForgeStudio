# Forge Studio (Local AI Web Builder)

Build web apps with AI - completely locally using Ollama or Cloud APIs (Claude/OpenAI/Gemini).

## 🚀 Quick Start (Development)

To run this application locally in your browser:

### 1. Install Dependencies
```bash
# Install frontend dependencies
npm install

# Setup backend Python environment
cd backend
python -m venv venv
.\venv\Scripts\activate
pip install -r requirements.txt
cd ..
```

### 2. Start Services
Open two terminal windows:

**Terminal 1 (Backend):**
```bash
cd backend
.\venv\Scripts\activate
uvicorn main:app --reload --port 8000
```

**Terminal 2 (Frontend):**
```bash
npm run dev
```

The app will be available at `http://localhost:5173`.

## 📦 Building the Windows .exe

To package Forge Studio into a standalone Windows installer (`.exe`), you need to provide a portable Python environment to be bundled with the app.

1. Download the [Windows embeddable package (64-bit)](https://www.python.org/downloads/windows/) from python.org.
2. Extract it to a folder named `python-embed` in the root of this project.
3. Uncomment `import site` in `python-embed/pythonXX._pth`.
4. Install `pip` into `python-embed`.
5. Install the backend requirements into `python-embed`:
   ```bash
   python-embed\python.exe -m pip install -r requirements.txt -t python-embed\Lib\site-packages
   ```
6. Run the build command:
   ```bash
   npm run electron:build:win
   ```
The installer will be generated in the `release/` folder!

## 🎯 Supported Models

- Local Models (via Ollama): `qwen2.5-coder`, `deepseek-coder`, `llama3.1`
- Cloud Models: OpenRoute, Anthropic (Claude 3.5 Sonnet), OpenAI, Google Gemini

## 🎨 Tech Stack

- **Frontend:** React, TypeScript, Tailwind CSS, Vite
- **Desktop Packaging:** Electron, electron-builder
- **Backend:** FastAPI, Python
- **AI:** Ollama / Official API SDKs

## 📝 License

MIT

