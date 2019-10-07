// @flow
import os from 'os';
import path from 'path';
import electron from 'electron'; // eslint-disable-line

export const getZclassicFolder = () => {
  const { app } = electron;

  if (os.platform() === 'darwin') {
    return path.join(app.getPath('appData'), 'Zclassic');
  }

  if (os.platform() === 'linux') {
    return path.join(app.getPath('home'), '.zclassic');
  }

  return path.join(app.getPath('appData'), 'ZClassic');
};
