// @flow

import path from 'path';
import os from 'os';

import { app } from '../electron'; // eslint-disable-line

export const locateZclassicConf = () => {
  if (os.platform() === 'darwin') {
    return path.join(app.getPath('appData'), 'Zclassic', 'zclassic.conf');
  }

  if (os.platform() === 'linux') {
    return path.join(app.getPath('home'), '.zclassic', 'zclassic.conf');
  }

  return path.join(app.getPath('appData'), 'ZClassic', 'zclassic.conf');
};
