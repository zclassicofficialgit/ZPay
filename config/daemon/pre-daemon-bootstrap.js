// @flow
/**
 * Pre-Daemon Bootstrap Checker
 *
 * This module checks if blockchain data exists BEFORE starting the daemon.
 * If no blockchain data is found, it triggers the bootstrap installation
 * and only starts the daemon after bootstrap completes successfully.
 */

import path from 'path';
import fs from 'fs';
import os from 'os';
import eres from 'eres';
import { BrowserWindow, dialog } from 'electron';
import { installBootstrap, shouldRecommendBootstrap } from '../../services/bootstrap-installer';
import { log } from './logger';

// Get platform-specific Zclassic data directory
const getZclassicDataDir = (): string => {
  const platform = process.platform;

  if (platform === 'darwin') {
    return path.join(process.env.HOME || '', 'Library', 'Application Support', 'Zclassic');
  } else if (platform === 'win32') {
    return path.join(process.env.APPDATA || '', 'ZClassic');
  } else {
    return path.join(process.env.HOME || '', '.zclassic');
  }
};

/**
 * Parse debug.log to get the latest block height and date
 */
const parseDebugLogForBlockInfo = (debugLogPath: string): { height: number, date: Date } | null => {
  try {
    if (!fs.existsSync(debugLogPath)) {
      return null;
    }

    // Read last 100KB of debug.log (most recent data)
    const stats = fs.statSync(debugLogPath);
    const readSize = Math.min(stats.size, 100 * 1024); // 100KB
    const buffer = Buffer.alloc(readSize);
    const fd = fs.openSync(debugLogPath, 'r');
    fs.readSync(fd, buffer, 0, readSize, stats.size - readSize);
    fs.closeSync(fd);

    const logContent = buffer.toString('utf-8');
    const lines = logContent.split('\n');

    // Look for UpdateTip messages (indicates block height)
    // Format: "UpdateTip: new best=<hash>  height=<height>  log2_work=<work>  tx=<tx>  date=<date>"
    let latestHeight = 0;
    let latestDate = null;

    for (let i = lines.length - 1; i >= 0; i--) {
      const line = lines[i];
      if (line.includes('UpdateTip:') && line.includes('height=')) {
        const heightMatch = line.match(/height=(\d+)/);
        const dateMatch = line.match(/date=([0-9-]+ [0-9:]+)/);

        if (heightMatch) {
          latestHeight = parseInt(heightMatch[1], 10);
        }
        if (dateMatch) {
          latestDate = new Date(dateMatch[1]);
        }

        if (latestHeight > 0) {
          break;
        }
      }
    }

    if (latestHeight > 0 && latestDate) {
      return { height: latestHeight, date: latestDate };
    }

    return null;
  } catch (error) {
    log(`Error parsing debug.log: ${error.message}`);
    return null;
  }
};

/**
 * Check if blockchain data exists and is sufficient
 * Returns true if bootstrap is needed
 */
const checkBootstrapNeeded = async (): Promise<boolean> => {
  try {
    const dataDir = getZclassicDataDir();
    const blocksDir = path.join(dataDir, 'blocks');
    const debugLogPath = path.join(dataDir, 'debug.log');

    log(`Checking blockchain data in: ${dataDir}`);

    // Check if data directory exists
    if (!fs.existsSync(dataDir)) {
      log('Zclassic data directory does not exist - bootstrap needed');
      return true;
    }

    // Check if blocks directory exists
    if (!fs.existsSync(blocksDir)) {
      log('Blocks directory does not exist - bootstrap needed');
      return true;
    }

    // Check block file count
    const blockFiles = fs.readdirSync(blocksDir).filter((f) => f.startsWith('blk'));
    log(`Found ${blockFiles.length} block files`);

    // If less than 10 block files, recommend bootstrap (likely just genesis block)
    if (blockFiles.length < 10) {
      log('Insufficient block files (<10) - bootstrap recommended');
      return true;
    }

    // Check debug.log for latest block info
    if (fs.existsSync(debugLogPath)) {
      const blockInfo = parseDebugLogForBlockInfo(debugLogPath);

      if (blockInfo) {
        log(`Latest block from debug.log: height=${blockInfo.height}, date=${blockInfo.date.toISOString()}`);

        // Calculate days since last block
        const now = new Date();
        const daysSinceLastBlock = (now.getTime() - blockInfo.date.getTime()) / (1000 * 60 * 60 * 24);
        log(`Days since last block: ${daysSinceLastBlock.toFixed(1)}`);

        // If blockchain is more than 30 days old, recommend bootstrap
        if (daysSinceLastBlock > 30) {
          log(`Blockchain is ${daysSinceLastBlock.toFixed(0)} days old - bootstrap recommended`);
          return true;
        }

        // If block height is very low (< 100), recommend bootstrap
        if (blockInfo.height < 100) {
          log(`Block height is only ${blockInfo.height} - bootstrap recommended`);
          return true;
        }
      } else {
        log('Could not parse block info from debug.log - checking file count only');
      }
    }

    log('Sufficient and recent blockchain data exists - no bootstrap needed');
    return false;
  } catch (error) {
    log(`Error checking blockchain data: ${error.message}`);
    // On error, assume bootstrap is needed
    return true;
  }
};

/**
 * Show progress window during bootstrap installation
 */
let progressWindow: ?BrowserWindow = null;

const createProgressWindow = (): BrowserWindow => {
  progressWindow = new BrowserWindow({
    width: 520,
    height: 280,
    resizable: false,
    minimizable: false,
    maximizable: false,
    fullscreenable: false,
    title: 'Zipher Bootstrap Installer',
    backgroundColor: '#FFFFFF',
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  // Create Macintosh-style HTML for progress display with step-by-step log
  const progressHtml = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body {
          font-family: 'Chicago', 'Courier New', monospace;
          background: #FFFFFF;
          color: #000000;
          padding: 0;
          margin: 0;
          overflow: hidden;
        }
        .window {
          border: 2px solid #000;
          margin: 0;
          height: 100vh;
          display: flex;
          flex-direction: column;
        }
        .title-bar {
          background: #000;
          color: #FFF;
          padding: 4px 8px;
          font-size: 12px;
          font-weight: bold;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }
        .title-text {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .title-bar::before {
          content: '';
          width: 12px;
          height: 12px;
          background: repeating-linear-gradient(
            45deg,
            #FFF,
            #FFF 1px,
            #000 1px,
            #000 2px
          );
        }
        .elapsed-time {
          font-size: 11px;
          font-weight: normal;
        }
        .content {
          padding: 15px;
          flex: 1;
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }
        .current-stage {
          font-size: 13px;
          font-weight: bold;
          margin-bottom: 10px;
          text-transform: uppercase;
          border-bottom: 1px solid #000;
          padding-bottom: 5px;
        }
        .progress-container {
          border: 2px solid #000;
          background: #FFF;
          height: 20px;
          margin-bottom: 10px;
          position: relative;
        }
        .progress-bar {
          background: #000;
          height: 100%;
          width: 0%;
          transition: width 0.3s linear;
        }
        .progress-text {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          font-size: 11px;
          font-weight: bold;
          mix-blend-mode: difference;
          color: #FFF;
        }
        .steps-log {
          flex: 1;
          overflow-y: auto;
          font-size: 10px;
          line-height: 1.3;
          border: 1px solid #000;
          padding: 8px;
          background: #FFF;
        }
        .step-line {
          margin-bottom: 3px;
          display: flex;
          gap: 6px;
        }
        .step-status {
          font-weight: bold;
          min-width: 12px;
        }
        .step-completed {
          color: #000;
        }
        .step-running {
          color: #000;
        }
        .step-time {
          color: #666;
          font-size: 9px;
        }
      </style>
      <script>
        let globalStartTime = Date.now();

        function formatElapsed(ms) {
          const seconds = Math.floor(ms / 1000);
          const minutes = Math.floor(seconds / 60);
          const secs = seconds % 60;
          return minutes > 0 ? minutes + 'm ' + secs + 's' : secs + 's';
        }

        function updateGlobalTime() {
          const elapsed = Date.now() - globalStartTime;
          document.getElementById('global-time').textContent = formatElapsed(elapsed);
        }

        setInterval(updateGlobalTime, 1000);
      </script>
    </head>
    <body>
      <div class="window">
        <div class="title-bar">
          <div class="title-text">Zipher Bootstrap Installer</div>
          <div class="elapsed-time" id="global-time">0s</div>
        </div>
        <div class="content">
          <div class="current-stage" id="stage">INITIALIZING...</div>
          <div class="progress-container">
            <div class="progress-bar" id="progress-bar"></div>
            <div class="progress-text" id="progress-text">0%</div>
          </div>
          <div class="steps-log" id="steps-log"></div>
        </div>
      </div>
    </body>
    </html>
  `;

  progressWindow.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(progressHtml)}`);

  return progressWindow;
};

// Track step timing
let currentStepName = '';
let currentStepStartTime = 0;
const stepLog = [];

const updateProgress = (stage: string, progress: number, message: string) => {
  if (progressWindow && !progressWindow.isDestroyed()) {
    // Escape single quotes in message to prevent JavaScript errors
    const escapedMessage = message.replace(/'/g, "\\'");
    const escapedStage = stage.replace(/'/g, "\\'");

    // Detect step changes
    const stepKey = `${stage}:${message.split(' ')[0]}`;
    if (currentStepName !== stepKey) {
      // Complete previous step if exists
      if (currentStepName) {
        const duration = Date.now() - currentStepStartTime;
        stepLog.push({
          name: currentStepName,
          duration,
          completed: true,
        });
      }

      // Start new step
      currentStepName = stepKey;
      currentStepStartTime = Date.now();
    }

    // Build step log HTML
    const stepHtml = stepLog.map(step => {
      const minutes = Math.floor(step.duration / 60000);
      const seconds = Math.floor((step.duration % 60000) / 1000);
      const timeStr = minutes > 0 ? `${minutes}m ${seconds}s` : `${seconds}s`;
      return `<div class="step-line"><span class="step-status step-completed">✓</span><span>${step.name}</span><span class="step-time">(${timeStr})</span></div>`;
    }).join('');

    // Add current running step
    const currentDuration = Date.now() - currentStepStartTime;
    const currentMinutes = Math.floor(currentDuration / 60000);
    const currentSeconds = Math.floor((currentDuration % 60000) / 1000);
    const currentTimeStr = currentMinutes > 0 ? `${currentMinutes}m ${currentSeconds}s` : `${currentSeconds}s`;
    const currentStepHtml = `<div class="step-line"><span class="step-status step-running">▶</span><span>${escapedMessage}</span><span class="step-time">(${currentTimeStr})</span></div>`;

    progressWindow.webContents.executeJavaScript(`
      document.getElementById('stage').textContent = '${escapedStage.toUpperCase()}';
      document.getElementById('progress-bar').style.width = '${progress}%';
      document.getElementById('progress-text').textContent = '${Math.round(progress)}%';
      document.getElementById('steps-log').innerHTML = '${stepHtml}${currentStepHtml}';

      // Auto-scroll to bottom
      var log = document.getElementById('steps-log');
      log.scrollTop = log.scrollHeight;
    `);
  }
};

/**
 * Main function to check and install bootstrap if needed
 * Returns true if daemon should start, false if bootstrap failed
 */
export const checkAndInstallBootstrap = async (): Promise<boolean> => {
  try {
    // Check if bootstrap is needed
    const bootstrapNeeded = await checkBootstrapNeeded();

    if (!bootstrapNeeded) {
      log('Bootstrap not needed - proceeding with daemon startup');
      return true;
    }

    log('Bootstrap needed - prompting user');

    // Show confirmation dialog
    const choice = dialog.showMessageBoxSync({
      type: 'question',
      buttons: ['Download Bootstrap (Recommended)', 'Sync from Network (Slow)', 'Cancel'],
      defaultId: 0,
      title: 'Blockchain Data Not Found',
      message: 'Zipher needs to download blockchain data',
      detail:
        'You have two options:\n\n' +
        '1. Download Bootstrap (5-15 min): Download 7.7 GB of pre-synced blockchain data for fast setup. Time depends on your internet speed.\n\n' +
        '2. Sync from Network (2-3 days): Sync the entire blockchain from scratch over the P2P network.\n\n' +
        'Bootstrap is highly recommended for first-time setup.',
    });

    if (choice === 2) {
      // User cancelled
      log('User cancelled bootstrap installation');
      dialog.showMessageBoxSync({
        type: 'info',
        buttons: ['OK'],
        title: 'Setup Cancelled',
        message: 'Zipher setup has been cancelled. The application will now close.',
      });
      return false;
    }

    if (choice === 1) {
      // User chose to sync from network
      log('User chose to sync from network (slow)');
      dialog.showMessageBoxSync({
        type: 'info',
        buttons: ['OK'],
        title: 'Network Sync Selected',
        message: 'Zipher will now sync the blockchain from the network. This may take 2-3 days to complete.',
      });
      return true;
    }

    // User chose to download bootstrap
    log('User confirmed bootstrap installation');

    // Create progress window
    const window = createProgressWindow();

    // Install bootstrap
    const [installErr, installResult] = await eres(
      installBootstrap((stage, progress, message) => {
        log(`Bootstrap progress: ${stage} - ${progress}% - ${message}`);
        updateProgress(stage, progress, message);
      })
    );

    // Close progress window
    if (progressWindow && !progressWindow.isDestroyed()) {
      progressWindow.close();
      progressWindow = null;
    }

    if (installErr || !installResult || !installResult.success) {
      log(`Bootstrap installation failed: ${installErr?.message || installResult?.error}`);

      dialog.showMessageBoxSync({
        type: 'error',
        buttons: ['OK'],
        title: 'Bootstrap Installation Failed',
        message: 'Failed to install blockchain bootstrap',
        detail: `Error: ${installErr?.message || installResult?.error}\n\nYou can try again or choose "Sync from Network" on next launch.`,
      });

      return false;
    }

    log('Bootstrap installation completed successfully');

    dialog.showMessageBoxSync({
      type: 'info',
      buttons: ['OK'],
      title: 'Bootstrap Installed',
      message: 'Blockchain bootstrap has been installed successfully!',
      detail: 'Zipher will now start the daemon and begin syncing the remaining blocks.',
    });

    return true;
  } catch (error) {
    log(`Error in checkAndInstallBootstrap: ${error.message}`);

    dialog.showMessageBoxSync({
      type: 'error',
      buttons: ['OK'],
      title: 'Bootstrap Check Failed',
      message: 'An error occurred while checking for blockchain data',
      detail: error.message,
    });

    return false;
  }
};
