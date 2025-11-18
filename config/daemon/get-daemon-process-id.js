// @flow
import fs from 'fs';
import path from 'path';
import { getZclassicFolder } from './get-zclassic-folder';
import { log } from './logger';

// The daemon binary creates zcashd.pid (because it's based on Zcash code)
// but we support both for compatibility
const PID_FILE_NAMES = ['zcashd.pid', 'zclassicd.pid'];

const isProcessRunning = (pid: number): boolean => {
  try {
    // Sending signal 0 checks if process exists without actually sending a signal
    // This works cross-platform (Unix/Linux/macOS)
    process.kill(pid, 0);
    return true;
  } catch (err) {
    // ESRCH means "no such process" - the process doesn't exist
    return false;
  }
};

export const getDaemonProcessId = (zclassicPath?: string) => {
  const myPath = zclassicPath || getZclassicFolder();

  // Try each PID file name
  for (const pidFileName of PID_FILE_NAMES) {
    try {
      const pidFilePath = path.join(myPath, pidFileName);
      const buffer = fs.readFileSync(pidFilePath);
      const pid = Number(buffer.toString().trim());

      // Verify the process actually exists
      if (isProcessRunning(pid)) {
        log(`Found running daemon process with PID: ${pid} (from ${pidFileName})`);
        return pid;
      }

      // Process doesn't exist - this is a stale PID file
      log(`Found stale PID file ${pidFileName} with PID ${pid}. Process not running. Cleaning up...`);
      try {
        fs.unlinkSync(pidFilePath);
        log(`Stale PID file ${pidFileName} removed successfully`);
      } catch (unlinkErr) {
        log(`Warning: Could not remove stale PID file ${pidFileName}: ${unlinkErr.message}`);
      }
    } catch (err) {
      // This PID file doesn't exist or can't be read, try the next one
      continue;
    }
  }

  // No PID file found or all were stale
  return null;
};
