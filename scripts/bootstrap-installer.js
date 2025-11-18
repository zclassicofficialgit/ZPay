/**
 * Zipher Bootstrap Installer
 * Automatically downloads and extracts blockchain bootstrap for fast setup
 * Target: < 30 minutes total setup time
 */

const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');
const { spawn, exec } = require('child_process');
const crypto = require('crypto');
const os = require('os');
const { app } = require('electron');

class BootstrapInstaller {
  constructor() {
    // Bootstrap configuration
    // Source: https://github.com/VictorLux/zclassic-bootstrap
    this.config = {
      // Primary download source (Archive.org)
      downloadUrl: 'https://archive.org/download/zclassic-bootstrap-20251112.tar/zclassic-bootstrap-20251112.tar.gz',

      // Mirror sources (fallback)
      mirrors: [
        'https://zclassic.org/downloads/bootstrap-latest.tar.gz',
        // Add more mirrors as they become available
      ],

      // File info
      expectedSize: 8.3 * 1024 * 1024 * 1024, // 8.3 GB (compressed)
      expectedHash: '3b0aef51045921f3f55de7b0139b5e0b9955c08d9ede236d36db53e6e87a07cf', // SHA256 checksum

      // Paths
      dataDir: this.getDataDirectory(),
      tempDir: path.join(os.tmpdir(), 'zipher-bootstrap'),

      // Progress tracking
      downloadProgress: 0,
      extractProgress: 0,
      totalSteps: 5 // download, verify hash, extract, cleanup, complete
    };

    this.callbacks = {
      onProgress: null,
      onComplete: null,
      onError: null
    };
  }

  /**
   * Get platform-specific data directory
   */
  getDataDirectory() {
    const platform = os.platform();
    const home = os.homedir();

    switch (platform) {
      case 'darwin': // macOS
        return path.join(home, 'Library', 'Application Support', 'Zclassic');
      case 'win32': // Windows
        return path.join(process.env.APPDATA || path.join(home, 'AppData', 'Roaming'), 'Zclassic');
      case 'linux': // Linux
        return path.join(home, '.zclassic');
      default:
        return path.join(home, '.zclassic');
    }
  }

  /**
   * Check if zclassicd is running
   */
  async isDaemonRunning() {
    return new Promise((resolve) => {
      exec('pgrep -x zclassicd', (error, stdout) => {
        resolve(stdout.trim().length > 0);
      });
    });
  }

  /**
   * Stop the zclassicd daemon gracefully
   */
  async stopDaemon() {
    return new Promise((resolve, reject) => {
      console.log('Stopping zclassicd daemon...');

      // First, try graceful shutdown with zclassic-cli
      exec('zclassic-cli stop', (error, stdout, stderr) => {
        if (!error) {
          console.log('✅ Daemon stop command sent successfully');

          // Wait for daemon to actually stop (max 30 seconds)
          let attempts = 0;
          const maxAttempts = 30;

          const checkStopped = setInterval(async () => {
            attempts++;
            const isRunning = await this.isDaemonRunning();

            if (!isRunning) {
              clearInterval(checkStopped);
              console.log('✅ Daemon stopped successfully');
              resolve(true);
            } else if (attempts >= maxAttempts) {
              clearInterval(checkStopped);
              console.warn('⚠️ Daemon did not stop gracefully, forcing shutdown...');

              // Force kill if graceful shutdown failed
              exec('pkill -9 zclassicd', (killError) => {
                if (killError) {
                  reject(new Error('Failed to stop daemon'));
                } else {
                  console.log('✅ Daemon forcefully stopped');
                  resolve(true);
                }
              });
            }
          }, 1000); // Check every second
        } else {
          // If zclassic-cli stop failed, try force kill
          console.warn('⚠️ zclassic-cli stop failed, forcing shutdown...');
          exec('pkill -9 zclassicd', (killError) => {
            if (killError) {
              reject(new Error('Failed to stop daemon'));
            } else {
              console.log('✅ Daemon forcefully stopped');
              resolve(true);
            }
          });
        }
      });
    });
  }

  /**
   * Get current blockchain height from running daemon
   */
  async getCurrentBlockHeight() {
    return new Promise((resolve) => {
      exec('zclassic-cli getblockcount', (error, stdout) => {
        if (error) {
          resolve(null);
        } else {
          const height = parseInt(stdout.trim(), 10);
          resolve(isNaN(height) ? null : height);
        }
      });
    });
  }

  /**
   * Get bootstrap block height (from filename or hardcoded)
   * Bootstrap: zclassic-bootstrap-20251112.tar.gz is at block ~830,000
   */
  getBootstrapBlockHeight() {
    // Extract date from URL: zclassic-bootstrap-20251112
    // November 12, 2025 bootstrap is approximately at block 830,000
    return 830000; // Update this when using a newer bootstrap
  }

  /**
   * Check if blockchain data already exists
   */
  needsBootstrap() {
    const blocksDir = path.join(this.config.dataDir, 'blocks');
    const chainstateDir = path.join(this.config.dataDir, 'chainstate');

    // Check if directories exist and have content
    if (fs.existsSync(blocksDir) && fs.existsSync(chainstateDir)) {
      const blocksFiles = fs.readdirSync(blocksDir);
      const chainstateFiles = fs.readdirSync(chainstateDir);

      // If we have a significant number of files, assume bootstrap not needed
      if (blocksFiles.length > 100 && chainstateFiles.length > 10) {
        return false;
      }
    }

    return true;
  }

  /**
   * Perform pre-installation safety checks
   * Returns: { safe: boolean, reason: string, currentHeight: number|null }
   */
  async performSafetyChecks() {
    const result = {
      safe: true,
      reason: '',
      currentHeight: null,
      daemonRunning: false
    };

    // Check if daemon is running
    const isRunning = await this.isDaemonRunning();
    result.daemonRunning = isRunning;

    if (isRunning) {
      console.log('⚠️ zclassicd is currently running');

      // Get current block height
      const currentHeight = await this.getCurrentBlockHeight();
      result.currentHeight = currentHeight;

      if (currentHeight !== null) {
        const bootstrapHeight = this.getBootstrapBlockHeight();

        console.log(`Current blockchain height: ${currentHeight}`);
        console.log(`Bootstrap height: ${bootstrapHeight}`);

        // If current blockchain is ahead of bootstrap, warn user
        if (currentHeight > bootstrapHeight) {
          result.safe = false;
          result.reason = `Your current blockchain (height: ${currentHeight}) is MORE RECENT than the bootstrap (height: ${bootstrapHeight}). Installing the bootstrap would downgrade your blockchain data. Please sync normally instead.`;
          return result;
        }
      }
    }

    return result;
  }

  /**
   * Get download speed in MB/s
   */
  getDownloadSpeed(bytesDownloaded, startTime) {
    const elapsedSeconds = (Date.now() - startTime) / 1000;
    const bytesPerSecond = bytesDownloaded / elapsedSeconds;
    return (bytesPerSecond / 1024 / 1024).toFixed(2); // MB/s
  }

  /**
   * Estimate time remaining
   */
  estimateTimeRemaining(bytesDownloaded, totalBytes, startTime) {
    const elapsedSeconds = (Date.now() - startTime) / 1000;
    const bytesPerSecond = bytesDownloaded / elapsedSeconds;
    const remainingBytes = totalBytes - bytesDownloaded;
    const remainingSeconds = remainingBytes / bytesPerSecond;

    // Format as MM:SS
    const minutes = Math.floor(remainingSeconds / 60);
    const seconds = Math.floor(remainingSeconds % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }

  /**
   * Download bootstrap with progress tracking
   */
  async downloadBootstrap(url = this.config.downloadUrl) {
    return new Promise((resolve, reject) => {
      // Ensure temp directory exists
      if (!fs.existsSync(this.config.tempDir)) {
        fs.mkdirSync(this.config.tempDir, { recursive: true });
      }

      const downloadPath = path.join(this.config.tempDir, 'bootstrap.tar.gz');
      const file = fs.createWriteStream(downloadPath);

      const startTime = Date.now();
      let downloadedBytes = 0;

      const protocol = url.startsWith('https') ? https : http;

      const request = protocol.get(url, (response) => {
        if (response.statusCode === 302 || response.statusCode === 301) {
          // Follow redirect
          return this.downloadBootstrap(response.headers.location)
            .then(resolve)
            .catch(reject);
        }

        if (response.statusCode !== 200) {
          reject(new Error(`Failed to download: HTTP ${response.statusCode}`));
          return;
        }

        const totalBytes = parseInt(response.headers['content-length'], 10);

        response.on('data', (chunk) => {
          downloadedBytes += chunk.length;
          this.config.downloadProgress = (downloadedBytes / totalBytes) * 100;

          if (this.callbacks.onProgress) {
            this.callbacks.onProgress({
              step: 1,
              stepName: 'Downloading blockchain data',
              progress: this.config.downloadProgress,
              downloaded: (downloadedBytes / 1024 / 1024 / 1024).toFixed(2), // GB
              total: (totalBytes / 1024 / 1024 / 1024).toFixed(2), // GB
              speed: this.getDownloadSpeed(downloadedBytes, startTime),
              timeRemaining: this.estimateTimeRemaining(downloadedBytes, totalBytes, startTime)
            });
          }
        });

        response.pipe(file);

        file.on('finish', () => {
          file.close();
          console.log('Bootstrap download complete');
          resolve(downloadPath);
        });
      });

      request.on('error', (err) => {
        fs.unlink(downloadPath, () => {}); // Delete partial file
        reject(err);
      });

      file.on('error', (err) => {
        fs.unlink(downloadPath, () => {}); // Delete partial file
        reject(err);
      });
    });
  }

  /**
   * Verify downloaded file hash
   */
  async verifyHash(filePath) {
    return new Promise((resolve, reject) => {
      if (!this.config.expectedHash) {
        console.log('No hash configured, skipping verification');
        resolve(true);
        return;
      }

      if (this.callbacks.onProgress) {
        this.callbacks.onProgress({
          step: 2,
          stepName: 'Verifying file integrity',
          progress: 0
        });
      }

      const hash = crypto.createHash('sha256');
      const stream = fs.createReadStream(filePath);

      stream.on('data', (data) => {
        hash.update(data);
      });

      stream.on('end', () => {
        const fileHash = hash.digest('hex');

        if (fileHash === this.config.expectedHash) {
          console.log('✅ Hash verification passed');
          if (this.callbacks.onProgress) {
            this.callbacks.onProgress({
              step: 2,
              stepName: 'Verifying file integrity',
              progress: 100
            });
          }
          resolve(true);
        } else {
          console.error('❌ Hash verification failed!');
          console.error(`Expected: ${this.config.expectedHash}`);
          console.error(`Got:      ${fileHash}`);
          reject(new Error('Hash verification failed'));
        }
      });

      stream.on('error', (err) => {
        reject(err);
      });
    });
  }

  /**
   * Extract bootstrap archive
   */
  async extractBootstrap(archivePath) {
    return new Promise((resolve, reject) => {
      // Ensure data directory exists
      if (!fs.existsSync(this.config.dataDir)) {
        fs.mkdirSync(this.config.dataDir, { recursive: true });
      }

      const platform = os.platform();
      let extractCommand;

      if (platform === 'win32') {
        // Windows: Use 7-Zip or tar if available
        extractCommand = `tar -xzf "${archivePath}" -C "${this.config.dataDir}"`;
      } else {
        // macOS/Linux: Use native tar
        extractCommand = `tar -xzf "${archivePath}" -C "${this.config.dataDir}" --strip-components=0`;
      }

      if (this.callbacks.onProgress) {
        this.callbacks.onProgress({
          step: 3,
          stepName: 'Extracting blockchain data',
          progress: 0
        });
      }

      const extraction = exec(extractCommand, { maxBuffer: 1024 * 1024 * 100 }, (error, stdout, stderr) => {
        if (error) {
          console.error('Extraction error:', error);
          reject(error);
          return;
        }

        if (this.callbacks.onProgress) {
          this.callbacks.onProgress({
            step: 3,
            stepName: 'Extracting blockchain data',
            progress: 100
          });
        }

        console.log('Bootstrap extraction complete');
        resolve();
      });

      // Monitor extraction progress (approximate)
      let estimatedProgress = 0;
      const progressInterval = setInterval(() => {
        estimatedProgress += 2; // Increment by 2% every interval
        if (estimatedProgress >= 100) {
          estimatedProgress = 99; // Cap at 99% until completion
          clearInterval(progressInterval);
        }

        if (this.callbacks.onProgress) {
          this.callbacks.onProgress({
            step: 3,
            stepName: 'Extracting blockchain data',
            progress: estimatedProgress
          });
        }
      }, 3000); // Update every 3 seconds
    });
  }

  /**
   * Cleanup temporary files
   */
  async cleanup() {
    if (this.callbacks.onProgress) {
      this.callbacks.onProgress({
        step: 5,
        stepName: 'Cleaning up',
        progress: 0
      });
    }

    // Delete temp directory
    if (fs.existsSync(this.config.tempDir)) {
      fs.rmSync(this.config.tempDir, { recursive: true, force: true });
    }

    if (this.callbacks.onProgress) {
      this.callbacks.onProgress({
        step: 5,
        stepName: 'Cleaning up',
        progress: 100
      });
    }
  }

  /**
   * Main installation flow
   */
  async install() {
    try {
      console.log('Starting bootstrap installation process...');

      // Step 0: Perform safety checks
      console.log('Performing pre-installation safety checks...');
      const safetyCheck = await this.performSafetyChecks();

      if (!safetyCheck.safe) {
        console.error('❌ Safety check failed:', safetyCheck.reason);
        if (this.callbacks.onError) {
          this.callbacks.onError(new Error(safetyCheck.reason));
        }
        throw new Error(safetyCheck.reason);
      }

      // Handle daemon running - MUST stop before proceeding
      if (safetyCheck.daemonRunning) {
        console.error('🔴 CANNOT CONTINUE: zclassicd is currently running');
        console.error('🔴 The daemon must be stopped before installing bootstrap');
        console.error('');

        if (safetyCheck.currentHeight !== null) {
          console.log(`📊 Current blockchain height: ${safetyCheck.currentHeight}`);
          console.log(`📊 Bootstrap height: ${this.getBootstrapBlockHeight()}`);
          console.log('');
        }

        // This should trigger a UI confirmation dialog offering to stop the daemon
        if (this.callbacks.onError) {
          this.callbacks.onError({
            requiresDaemonStop: true,
            message: 'zclassicd is currently running and must be stopped to proceed with bootstrap installation.',
            currentHeight: safetyCheck.currentHeight,
            bootstrapHeight: this.getBootstrapBlockHeight(),
            canAutoStop: true
          });
        }

        // If we get here without callback handling, abort
        throw new Error('Cannot install bootstrap while zclassicd is running. Please stop the daemon first.');
      }

      // Check if existing data will be overwritten
      const hasExistingData = !this.needsBootstrap();
      if (hasExistingData) {
        console.warn('⚠️ WARNING: Existing blockchain data detected!');
        console.warn('⚠️ Installing bootstrap will OVERWRITE your current blockchain data');
        console.warn('');
        console.warn('🔴 CRITICAL: Before proceeding, ensure you have:');
        console.warn('   1. Backed up your wallet.dat file');
        console.warn('   2. Stopped the zclassicd daemon');
        console.warn('   3. Confirmed you want to replace existing blockchain data');
        console.warn('');

        // This should trigger a user confirmation dialog in the UI
        if (this.callbacks.onError) {
          this.callbacks.onError({
            requiresConfirmation: true,
            message: 'Existing blockchain data will be overwritten. Have you backed up your wallet.dat?',
            currentHeight: safetyCheck.currentHeight,
            bootstrapHeight: this.getBootstrapBlockHeight()
          });
        }

        // If we get here without error callback handling, abort
        throw new Error('User confirmation required before overwriting blockchain data');
      }

      console.log('✅ Safety checks passed');
      console.log('Starting bootstrap installation...');

      // Step 1: Download bootstrap
      const archivePath = await this.downloadBootstrap();

      // Step 2: Verify file integrity
      await this.verifyHash(archivePath);

      // Step 3: Extract bootstrap
      await this.extractBootstrap(archivePath);

      // Step 4: Cleanup
      await this.cleanup();

      console.log('Bootstrap installation complete!');

      if (this.callbacks.onComplete) {
        this.callbacks.onComplete({ success: true });
      }

    } catch (error) {
      console.error('Bootstrap installation failed:', error);

      if (this.callbacks.onError) {
        this.callbacks.onError(error);
      }

      throw error;
    }
  }

  /**
   * Set progress callback
   */
  onProgress(callback) {
    this.callbacks.onProgress = callback;
  }

  /**
   * Set completion callback
   */
  onComplete(callback) {
    this.callbacks.onComplete = callback;
  }

  /**
   * Set error callback
   */
  onError(callback) {
    this.callbacks.onError = callback;
  }
}

module.exports = BootstrapInstaller;
