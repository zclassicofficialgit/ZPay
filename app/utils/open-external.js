// @flow

export const openExternal = (url: string) => {
  // Use electronAPI from preload if available, fallback to electron.shell for compatibility
  if (window.electronAPI && window.electronAPI.openExternal) {
    return window.electronAPI.openExternal(url);
  }
  // Fallback for development or if preload is not loaded
  const electron = require('electron'); // eslint-disable-line
  return electron.shell.openExternal(url);
};
