// Preload script for Electron security
const { contextBridge } = require('electron');

contextBridge.exposeInMainWorld('electron', {
  isElectron: true
});
