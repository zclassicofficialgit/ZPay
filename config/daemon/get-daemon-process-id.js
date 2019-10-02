// @flow
import fs from 'fs';
import path from 'path';
import { getZclassicFolder } from './get-zclassic-folder';

const ZCLASSIC_PID_FILE = 'zcashd.pid';

export const getDaemonProcessId = (zclassicPath?: string) => {
  try {
    const myPath = zclassicPath || getZclassicFolder();
    const buffer = fs.readFileSync(path.join(myPath, ZCLASSIC_PID_FILE));
    const pid = Number(buffer.toString().trim());
    return pid;
  } catch (err) {
    return null;
  }
};
