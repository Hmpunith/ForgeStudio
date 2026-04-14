const { app, BrowserWindow, shell, dialog, Menu } = require('electron');
const path = require('path');
const { spawn, execSync } = require('child_process');
const fs = require('fs');
const https = require('https');
const http = require('http');

// ─── Remove the native menu bar entirely ──────────────────────────────────────
Menu.setApplicationMenu(null);

let mainWindow;
let splashWindow;
let backendProcess;
let metricsProcess;

// ─── Resolve correct paths for packaged vs dev ────────────────────────────────
function getPaths() {
  const isPackaged = app.isPackaged;
  const rootPath = isPackaged ? process.resourcesPath : path.join(__dirname, '..');

  const pythonDir = path.join(rootPath, 'python-embed');
  const pythonExe = path.join(pythonDir, 'python.exe');
  const backendPath = path.join(rootPath, 'backend');

  return { isPackaged, rootPath, pythonDir, pythonExe, backendPath };
}

// ─── Poll a URL until it responds or we time out ──────────────────────────────
function waitForUrl(url, timeoutMs = 30000, intervalMs = 500) {
  return new Promise((resolve) => {
    const deadline = Date.now() + timeoutMs;

    const attempt = () => {
      const req = http.get(url, { timeout: 1500 }, (res) => {
        resolve(true);
      });
      req.on('error', () => {
        if (Date.now() < deadline) {
          setTimeout(attempt, intervalMs);
        } else {
          resolve(false); // timed out — continue anyway
        }
      });
      req.on('timeout', () => {
        req.destroy();
        if (Date.now() < deadline) {
          setTimeout(attempt, intervalMs);
        } else {
          resolve(false);
        }
      });
    };

    attempt();
  });
}

// ─── Check Ollama ─────────────────────────────────────────────────────────────
async function checkOllama() {
  return new Promise((resolve) => {
    const req = http.get('http://localhost:11434/api/version', { timeout: 3000 }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ installed: true, running: true, version: JSON.parse(data).version });
        } catch {
          resolve({ installed: true, running: true, version: 'unknown' });
        }
      });
    });
    req.on('error', () => {
      try {
        execSync('where ollama', { stdio: 'ignore' });
        resolve({ installed: true, running: false });
      } catch {
        resolve({ installed: false, running: false });
      }
    });
    req.on('timeout', () => {
      req.destroy();
      resolve({ installed: false, running: false });
    });
  });
}

// ─── Download helper ──────────────────────────────────────────────────────────
function downloadFile(url, destPath, onProgress) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(destPath);

    const makeRequest = (requestUrl) => {
      https.get(requestUrl, (response) => {
        if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
          file.close();
          try { fs.unlinkSync(destPath); } catch {}
          makeRequest(response.headers.location);
          return;
        }

        const totalSize = parseInt(response.headers['content-length'], 10);
        let downloaded = 0;

        response.on('data', (chunk) => {
          downloaded += chunk.length;
          if (onProgress && totalSize) {
            onProgress(Math.round((downloaded / totalSize) * 100));
          }
        });

        response.pipe(file);
        file.on('finish', () => { file.close(); resolve(destPath); });
      }).on('error', (err) => {
        try { fs.unlinkSync(destPath); } catch {}
        reject(err);
      });
    };

    makeRequest(url);
  });
}

// ─── Install Ollama silently ──────────────────────────────────────────────────
async function installOllama(updateStatus) {
  const ollamaUrl = 'https://ollama.com/download/OllamaSetup.exe';
  const tempDir = app.getPath('temp');
  const installerPath = path.join(tempDir, 'OllamaSetup.exe');

  try {
    updateStatus('Downloading Ollama AI engine…', 10);

    await downloadFile(ollamaUrl, installerPath, (percent) => {
      updateStatus(`Downloading Ollama… ${percent}%`, Math.round(percent * 0.6));
    });

    updateStatus('Installing Ollama (this may take a moment)…', 70);

    execSync(`"${installerPath}" /SP- /VERYSILENT /NORESTART`, {
      timeout: 120000,
      stdio: 'ignore'
    });

    try { fs.unlinkSync(installerPath); } catch {}

    await new Promise(resolve => setTimeout(resolve, 3000));
    return true;
  } catch (error) {
    console.error('Ollama installation failed:', error);
    return false;
  }
}

// ─── Professional splash / loading window ────────────────────────────────────
function createSplashWindow() {
  const splash = new BrowserWindow({
    width: 480,
    height: 280,
    frame: false,
    resizable: false,
    alwaysOnTop: true,
    transparent: false,
    backgroundColor: '#0a0e1a',
    icon: path.join(__dirname, 'icon.ico'),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  splash.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(`<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;600;700&display=swap');
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Inter', 'Segoe UI', sans-serif;
      background: linear-gradient(135deg, #0a0e1a 0%, #111827 50%, #0d1117 100%);
      color: #e2e8f0;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100vh;
      padding: 40px;
      -webkit-app-region: drag;
      user-select: none;
      overflow: hidden;
    }
    .logo-ring {
      width: 64px;
      height: 64px;
      border-radius: 16px;
      background: linear-gradient(135deg, #6366f1, #8b5cf6);
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 16px;
      box-shadow: 0 0 40px rgba(99,102,241,0.4);
      animation: pulse 2s ease-in-out infinite;
    }
    .logo-ring svg { width: 36px; height: 36px; fill: white; }
    @keyframes pulse {
      0%, 100% { box-shadow: 0 0 30px rgba(99,102,241,0.4); }
      50%       { box-shadow: 0 0 60px rgba(99,102,241,0.7); }
    }
    h1 { font-size: 20px; font-weight: 700; color: #f8fafc; margin-bottom: 4px; letter-spacing: -0.3px; }
    .subtitle { font-size: 12px; color: #64748b; margin-bottom: 32px; }
    #status {
      font-size: 12px;
      color: #94a3b8;
      margin-bottom: 14px;
      text-align: center;
      min-height: 16px;
      transition: all 0.3s ease;
    }
    .track {
      width: 320px;
      height: 4px;
      background: #1e293b;
      border-radius: 2px;
      overflow: hidden;
    }
    #bar {
      height: 100%;
      width: 0%;
      background: linear-gradient(90deg, #6366f1, #8b5cf6, #a78bfa);
      border-radius: 2px;
      transition: width 0.4s ease;
      background-size: 200% 100%;
      animation: shimmer 1.5s linear infinite;
    }
    @keyframes shimmer {
      0%   { background-position: 200% center; }
      100% { background-position: -200% center; }
    }
    .version { position: absolute; bottom: 16px; font-size: 10px; color: #334155; }
  </style>
</head>
<body>
  <div class="logo-ring">
    <svg viewBox="0 0 24 24"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
  </div>
  <h1>Forge Studio</h1>
  <div class="subtitle">Local AI-powered web development</div>
  <div id="status">Initializing…</div>
  <div class="track"><div id="bar"></div></div>
  <div class="version">v1.0.0</div>
</body>
</html>`)}`)

  return splash;
}

// Update the splash screen status & progress bar
function updateSplash(splash, message, percent) {
  if (!splash || splash.isDestroyed()) return;
  splash.webContents.executeJavaScript(`
    document.getElementById('status').innerText = ${JSON.stringify(message)};
    document.getElementById('bar').style.width = '${Math.min(percent, 100)}%';
  `).catch(() => {});
}

// ─── Start the Python backends ────────────────────────────────────────────────
function startBackends() {
  const { pythonExe, backendPath } = getPaths();

  console.log('[Backends] Python:', pythonExe);
  console.log('[Backends] Backend path:', backendPath);

  const spawnOpts = {
    cwd: backendPath,
    shell: false,
    windowsHide: true,
    env: {
      ...process.env,
      PYTHONDONTWRITEBYTECODE: '1',
      PYTHONUNBUFFERED: '1',
    }
  };

  // Main API backend on port 8000
  backendProcess = spawn(pythonExe, [
    '-m', 'uvicorn', 'main:app',
    '--host', '127.0.0.1',
    '--port', '8000',
    '--log-level', 'warning'
  ], spawnOpts);

  backendProcess.stdout.on('data', d => console.log('[Backend]', d.toString().trim()));
  backendProcess.stderr.on('data', d => console.log('[Backend]', d.toString().trim()));
  backendProcess.on('exit', (code) => console.log('[Backend] exited with code', code));

  // Metrics backend on port 8001
  metricsProcess = spawn(pythonExe, [
    '-m', 'uvicorn', 'metrics_server:app',
    '--host', '127.0.0.1',
    '--port', '8001',
    '--log-level', 'warning'
  ], spawnOpts);

  metricsProcess.stdout.on('data', d => console.log('[Metrics]', d.toString().trim()));
  metricsProcess.stderr.on('data', d => console.log('[Metrics]', d.toString().trim()));
}

// ─── Create the main window ───────────────────────────────────────────────────
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 900,
    minHeight: 600,
    // No native menu bar
    autoHideMenuBar: true,
    menuBarVisible: false,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: true,
    },
    icon: path.join(__dirname, 'icon.ico'),
    backgroundColor: '#0a0e1a',
    show: false,
    titleBarStyle: 'default',
  });

  if (app.isPackaged) {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  } else {
    mainWindow.loadURL('http://localhost:3000');
  }

  // ── Prevent Electron from navigating when files are dropped onto window ──
  // Without this, dropping a file loads it as a URL instead of triggering
  // the React onDrop handler.
  mainWindow.webContents.on('will-navigate', (event, url) => {
    const appUrl = app.isPackaged
      ? `file://${path.join(__dirname, '../dist/index.html')}`
      : 'http://localhost:3000';
    // Allow initial load only; block everything else (including file:// drops)
    if (!url.startsWith(app.isPackaged ? 'file://' : 'http://localhost:3000')) {
      event.preventDefault();
    }
    // Specifically block navigating to any file that isn't the app itself
    if (url.startsWith('file://') && !url.includes('index.html')) {
      event.preventDefault();
    }
  });

  // Also block drag-and-drop at the OS level from replacing the page
  mainWindow.webContents.on('did-finish-load', () => {
    mainWindow.webContents.executeJavaScript(`
      // Prevent Electron's default file-drop navigation at the document level.
      // React's onDrop handlers still fire normally.
      document.addEventListener('dragover', (e) => {
        if (e.dataTransfer && e.dataTransfer.types.includes('Files')) {
          e.preventDefault();
          e.stopPropagation();
        }
      }, true);
      // NOTE: We do NOT add a document-level 'drop' listener here so that
      // React's component-level onDrop handlers can still fire.
    `).catch(() => {});
  });



  mainWindow.once('ready-to-show', () => {
    mainWindow.maximize(); // Launch maximized — fills the full screen
    mainWindow.show();
    // Close splash after main window is visible
    if (splashWindow && !splashWindow.isDestroyed()) {
      splashWindow.close();
      splashWindow = null;
    }
  });

  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// ─── Main startup sequence ────────────────────────────────────────────────────
app.whenReady().then(async () => {
  // Show splash immediately
  splashWindow = createSplashWindow();

  try {
    // Step 1 — Check Ollama
    updateSplash(splashWindow, 'Checking AI engine (Ollama)…', 5);
    const ollamaStatus = await checkOllama();
    console.log('[Startup] Ollama status:', ollamaStatus);

    if (!ollamaStatus.installed) {
      updateSplash(splashWindow, 'Installing Ollama AI engine (first-time only)…', 10);

      const installed = await installOllama((msg, pct) => {
        updateSplash(splashWindow, msg, pct);
      });

      if (!installed) {
        dialog.showMessageBoxSync({
          type: 'warning',
          title: 'Ollama Not Installed',
          message: 'Could not auto-install Ollama.\nThe app will work but AI generation needs Ollama.\n\nInstall manually from: https://ollama.com/download',
          buttons: ['Continue Anyway'],
        });
      }
    } else if (!ollamaStatus.running) {
      updateSplash(splashWindow, 'Starting Ollama service…', 15);
      try {
        spawn('ollama', ['serve'], {
          detached: true,
          stdio: 'ignore',
          shell: false,
          windowsHide: true,
        }).unref();
        await new Promise(resolve => setTimeout(resolve, 2500));
      } catch {
        console.log('[Startup] Could not start Ollama service automatically');
      }
    }

    // Step 2 — Start Python backends
    updateSplash(splashWindow, 'Starting AI backend server…', 40);
    startBackends();

    // Step 3 — Wait for backend to be ready (up to 30 sec)
    updateSplash(splashWindow, 'Waiting for backend to be ready…', 55);
    const backendReady = await waitForUrl('http://127.0.0.1:8000/models', 30000, 500);

    if (backendReady) {
      updateSplash(splashWindow, 'Backend ready!', 90);
      console.log('[Startup] Backend is ready');
    } else {
      updateSplash(splashWindow, 'Backend taking longer than expected, continuing…', 90);
      console.warn('[Startup] Backend did not respond within 30s — opening anyway');
    }

    // Step 4 — Create main window
    updateSplash(splashWindow, 'Launching app…', 98);
    await new Promise(resolve => setTimeout(resolve, 400));
    createWindow();

  } catch (error) {
    console.error('[Startup] Fatal error:', error);
    if (splashWindow && !splashWindow.isDestroyed()) {
      splashWindow.close();
      splashWindow = null;
    }
    startBackends();
    setTimeout(createWindow, 2000);
  }

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

// ─── Cleanup on quit ──────────────────────────────────────────────────────────
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('before-quit', () => {
  if (backendProcess) {
    try { backendProcess.kill('SIGTERM'); } catch {}
  }
  if (metricsProcess) {
    try { metricsProcess.kill('SIGTERM'); } catch {}
  }
});
