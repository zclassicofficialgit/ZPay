// @flow
import fs from 'fs';
import path from 'path';
import { promisify } from 'util';
import eres from 'eres';

import { getZclassicFolder } from './get-zclassic-folder';

const ZCLASSIC_LOCK_FILE = '.lock';

export const checkLockFile = async (zclassicPath?: string) => {
  try {
    const myPath = zclassicPath || getZclassicFolder();
    const [cannotAccess] = await eres(promisify(fs.access)(path.join(myPath, ZCLASSIC_LOCK_FILE)));
    return !cannotAccess;
  } catch (err) {
    return false;
  }
};
