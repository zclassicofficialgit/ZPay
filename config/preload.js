// @flow

const { contextBridge, ipcRenderer } = require('electron');

/**
 * Preload script for Electron
 * Exposes safe APIs to the renderer process via contextBridge
 * This replaces the deprecated 'remote' module
 */

// With nodeIntegration: true and contextIsolation: false,
// we can expose APIs directly to window without contextBridge
const fs = require('fs');
const os = require('os');
const path = require('path');

// Try to get app from @electron/remote, fallback to null
let app = null;
try {
  const remote = require('@electron/remote');
  app = remote.app;
} catch (e) {
  console.log('@electron/remote not available, using IPC fallback');
}

// Expose APIs directly to window (no contextBridge needed with contextIsolation: false)
window.electronAPI = {
  // App control - use synchronous values where possible
  relaunchApp: (args) => ipcRenderer.invoke('app:relaunch', args),
  quitApp: () => ipcRenderer.invoke('app:quit'),
  getAppVersion: () => Promise.resolve(app ? app.getVersion() : ipcRenderer.sendSync('app:get-version-sync')),

  // Shell operations
  openExternal: (url) => ipcRenderer.invoke('shell:open-external', url),

  // Process info - synchronous versions
  getEnv: (key) => Promise.resolve(process.env[key]),
  getArgv: () => Promise.resolve(process.argv),
  isTest: () => Promise.resolve(process.env.NODE_ENV === 'test'),

  // Dialog
  showSaveDialog: (options) => ipcRenderer.invoke('dialog:show-save', options),
  showOpenDialog: (options) => ipcRenderer.invoke('dialog:show-open', options),
  showMessageBox: (options) => ipcRenderer.invoke('dialog:show-message', options),

  // App paths - Returns Promise for compatibility with bundle code
  getAppPath: (name) => {
    let result;
    if (!app) {
      // Fallback if remote is not available
      result = ipcRenderer.sendSync('app:get-path-sync', name);
    } else {
      result = app.getPath(name);
    }
    // Return immediately-resolved Promise to work with await in bundle
    return Promise.resolve(result);
  },

  // Node.js APIs - direct access, synchronous
  node: {
    fs: fs,
    os: {
      platform: () => os.platform(),
    },
    path: {
      join: (...args) => path.join(...args),
    },
  },

  // Daemon events (one-way from main to renderer)
  onDaemonStatus: (callback) => {
    ipcRenderer.on('zclassic-daemon-status', (event, data) => callback(data));
  },
  onDaemonParamsDownload: (callback) => {
    ipcRenderer.on('zclassicd-params-download', (event, data) => callback(data));
  },
  onUpdate: (callback) => {
    ipcRenderer.on('update', (event, data) => callback(data));
  },

  // Remove listeners
  removeAllListeners: (channel) => {
    ipcRenderer.removeAllListeners(channel);
  },
};

// Log that preload is loaded (for debugging)
console.log('Preload script loaded successfully');
