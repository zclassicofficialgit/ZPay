// @flow

import { app, dialog, ipcMain, shell } from 'electron';

/**
 * IPC Handlers for Electron
 * These replace the deprecated 'remote' module functionality
 */

export const registerIPCHandlers = () => {
  // App control handlers - using Electron 4 compatible API
  ipcMain.on('app:relaunch', (event, args) => {
    const relaunchArgs = Array.isArray(args) ? args : [];
    app.relaunch({ args: relaunchArgs });
    event.returnValue = true;
  });

  ipcMain.on('app:quit', (event) => {
    app.quit();
    event.returnValue = true;
  });

  ipcMain.on('app:get-version', (event) => {
    event.returnValue = app.getVersion();
  });

  ipcMain.on('app:get-path', (event, name) => {
    event.returnValue = app.getPath(name);
  });

  // Process info handlers
  ipcMain.on('process:get-env', (event, key) => {
    if (typeof key === 'string') {
      event.returnValue = process.env[key];
    } else {
      // Return entire env if no key specified (be careful with this)
      event.returnValue = process.env.NODE_ENV;
    }
  });

  ipcMain.on('process:get-argv', (event) => {
    event.returnValue = process.argv;
  });

  ipcMain.on('process:is-test', (event) => {
    event.returnValue = process.env.NODE_ENV === 'test';
  });

  // Shell handlers - async operations use event.sender.send for response
  ipcMain.on('shell:open-external', (event, url) => {
    shell.openExternal(url)
      .then(() => event.sender.send('shell:open-external-reply', true))
      .catch(err => event.sender.send('shell:open-external-reply', { error: err.message }));
  });

  // Dialog handlers - async dialogs
  ipcMain.on('dialog:show-save', (event, options) => {
    dialog.showSaveDialog(options)
      .then(result => event.sender.send('dialog:show-save-reply', result))
      .catch(err => event.sender.send('dialog:show-save-reply', { error: err.message }));
  });

  ipcMain.on('dialog:show-open', (event, options) => {
    dialog.showOpenDialog(options)
      .then(result => event.sender.send('dialog:show-open-reply', result))
      .catch(err => event.sender.send('dialog:show-open-reply', { error: err.message }));
  });

  ipcMain.on('dialog:show-message', (event, options) => {
    dialog.showMessageBox(options)
      .then(result => event.sender.send('dialog:show-message-reply', result))
      .catch(err => event.sender.send('dialog:show-message-reply', { error: err.message }));
  });

  console.log('IPC handlers registered successfully (Electron 4 compatible)');
};
