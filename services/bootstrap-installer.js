// @flow
/**
 * Bootstrap Installer Service for Zipher
 * Provides smooth, progress-tracked bootstrap installation
 * Target: < 15 minutes total sync time for end users
 */

import eres from 'eres';

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const https = require('https');
const { spawn } = require('child_process');

type BootstrapMetadata = {
  version: string,
  bootstrap: {
    filename: string,
    created: string,
    block_height_estimate: number,
    block_count: number,
    size_bytes: number,
    size_human: string,
    sha256: string,
    download_url: string,
    format: string,
    compression: string,
  },
  installation: {
    estimated_download_time_minutes: number,
    estimated_extraction_time_minutes: number,
    estimated_index_rebuild_minutes: number,
    total_estimated_minutes: number,
  },
  verification: {
    sha256_checksum: string,
    checksum_file_included: boolean,
    gpg_signature: boolean,
  },
};

type ProgressCallback = (stage: string, progress: number, message: string) => void;

const BOOTSTRAP_LATEST_URL =
  'https://archive.org/download/zclassic-bootstrap-zipher/latest.json';

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

// Fetch latest bootstrap metadata from archive.org
export const fetchBootstrapMetadata = async (): Promise<{
  success: boolean,
  metadata?: BootstrapMetadata,
  error?: string,
}> => {
  try {
    const response = await fetch(BOOTSTRAP_LATEST_URL);

    if (!response.ok) {
      return { success: false, error: 'Failed to fetch bootstrap metadata' };
    }

    const latest = await response.json();

    // Fetch full metadata
    const metadataUrl = `https://archive.org/download/zclassic-bootstrap-zipher/${latest.latest_metadata}`;
    const metadataResponse = await fetch(metadataUrl);

    if (!metadataResponse.ok) {
      return { success: false, error: 'Failed to fetch full metadata' };
    }

    const metadata: BootstrapMetadata = await metadataResponse.json();

    return { success: true, metadata };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Download file with progress tracking
const downloadFile = (
  url: string,
  destPath: string,
  progressCallback?: ProgressCallback
): Promise<{ success: boolean, error?: string }> => {
  return new Promise((resolve) => {
    const file = fs.createWriteStream(destPath);
    let downloadedBytes = 0;
    let totalBytes = 0;

    https
      .get(url, (response) => {
        if (response.statusCode !== 200) {
          resolve({ success: false, error: `HTTP ${response.statusCode}` });
          return;
        }

        totalBytes = parseInt(response.headers['content-length'] || '0', 10);

        response.on('data', (chunk) => {
          downloadedBytes += chunk.length;
          file.write(chunk);

          if (progressCallback && totalBytes > 0) {
            const progress = (downloadedBytes / totalBytes) * 100;
            const mbDownloaded = (downloadedBytes / 1024 / 1024).toFixed(1);
            const mbTotal = (totalBytes / 1024 / 1024).toFixed(1);
            progressCallback(
              'download',
              progress,
              `Downloaded ${mbDownloaded} MB / ${mbTotal} MB`
            );
          }
        });

        response.on('end', () => {
          file.end();
          resolve({ success: true });
        });

        response.on('error', (error) => {
          file.end();
          resolve({ success: false, error: error.message });
        });
      })
      .on('error', (error) => {
        file.end();
        resolve({ success: false, error: error.message });
      });
  });
};

// Verify file checksum
const verifyChecksum = async (
  filePath: string,
  expectedSha256: string,
  progressCallback?: ProgressCallback
): Promise<{ valid: boolean, error?: string }> => {
  try {
    if (progressCallback) {
      progressCallback('verify', 0, 'Calculating checksum...');
    }

    const hash = crypto.createHash('sha256');
    const stream = fs.createReadStream(filePath);
    const fileSize = fs.statSync(filePath).size;
    let processedBytes = 0;

    return new Promise((resolve) => {
      stream.on('data', (data) => {
        hash.update(data);
        processedBytes += data.length;

        if (progressCallback && fileSize > 0) {
          const progress = (processedBytes / fileSize) * 100;
          progressCallback('verify', progress, 'Verifying download integrity...');
        }
      });

      stream.on('end', () => {
        const calculatedHash = hash.digest('hex');
        const valid = calculatedHash === expectedSha256;

        if (valid && progressCallback) {
          progressCallback('verify', 100, 'Download verified successfully');
        }

        resolve({ valid });
      });

      stream.on('error', (error) => {
        resolve({ valid: false, error: error.message });
      });
    });
  } catch (error) {
    return { valid: false, error: error.message };
  }
};

// Create wallet backup before bootstrap installation
const createWalletBackup = async (
  progressCallback?: ProgressCallback
): Promise<{ success: boolean, backupPath?: string, error?: string }> => {
  try {
    if (progressCallback) {
      progressCallback('backup', 0, 'Creating wallet backup...');
    }

    const dataDir = getZclassicDataDir();
    const walletPath = path.join(dataDir, 'wallet.dat');

    if (!fs.existsSync(walletPath)) {
      // No wallet to backup
      return { success: true };
    }

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupPath = path.join(dataDir, `wallet-backup-before-bootstrap-${timestamp}.dat`);

    fs.copyFileSync(walletPath, backupPath);

    if (progressCallback) {
      progressCallback('backup', 100, `Wallet backed up to ${path.basename(backupPath)}`);
    }

    return { success: true, backupPath };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Extract bootstrap with progress
const extractBootstrap = (
  archivePath: string,
  destDir: string,
  progressCallback?: ProgressCallback
): Promise<{ success: boolean, error?: string }> => {
  return new Promise((resolve) => {
    if (progressCallback) {
      progressCallback('extract', 0, 'Extracting bootstrap...');
    }

    // Use tar command with progress estimation
    const tar = spawn('tar', ['-xzf', archivePath, '-C', destDir, '--strip-components=1']);

    let lastProgress = 0;

    // Estimate progress based on time (tar doesn't provide real progress)
    const progressInterval = setInterval(() => {
      lastProgress = Math.min(lastProgress + 5, 95);
      if (progressCallback) {
        progressCallback('extract', lastProgress, 'Extracting blockchain data...');
      }
    }, 2000);

    tar.on('close', (code) => {
      clearInterval(progressInterval);

      if (code === 0) {
        if (progressCallback) {
          progressCallback('extract', 100, 'Extraction complete');
        }
        resolve({ success: true });
      } else {
        resolve({ success: false, error: `Extraction failed with code ${code}` });
      }
    });

    tar.on('error', (error) => {
      clearInterval(progressInterval);
      resolve({ success: false, error: error.message });
    });
  });
};

// Remove existing blockchain data
const removeOldBlockchain = async (
  progressCallback?: ProgressCallback
): Promise<{ success: boolean, error?: string }> => {
  try {
    if (progressCallback) {
      progressCallback('cleanup', 0, 'Removing old blockchain data...');
    }

    const dataDir = getZclassicDataDir();
    const blocksDir = path.join(dataDir, 'blocks');
    const chainstateDir = path.join(dataDir, 'chainstate');

    // Remove blocks directory
    if (fs.existsSync(blocksDir)) {
      fs.rmSync(blocksDir, { recursive: true, force: true });
    }

    // Remove chainstate directory
    if (fs.existsSync(chainstateDir)) {
      fs.rmSync(chainstateDir, { recursive: true, force: true });
    }

    if (progressCallback) {
      progressCallback('cleanup', 100, 'Old blockchain data removed');
    }

    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Main bootstrap installation function
export const installBootstrap = async (
  progressCallback?: ProgressCallback
): Promise<{ success: boolean, error?: string }> => {
  try {
    // Step 1: Fetch metadata
    if (progressCallback) {
      progressCallback('init', 0, 'Fetching bootstrap information...');
    }

    const [metaErr, metaResult] = await eres(fetchBootstrapMetadata());

    if (metaErr || !metaResult || !metaResult.success || !metaResult.metadata) {
      return { success: false, error: 'Failed to fetch bootstrap metadata' };
    }

    const metadata = metaResult.metadata;

    if (progressCallback) {
      progressCallback(
        'init',
        100,
        `Found bootstrap: ${metadata.bootstrap.size_human} (${metadata.bootstrap.block_count} blocks)`
      );
    }

    // Step 2: Create wallet backup
    const [backupErr, backupResult] = await eres(createWalletBackup(progressCallback));

    if (backupErr || !backupResult || !backupResult.success) {
      return { success: false, error: 'Failed to create wallet backup' };
    }

    // Step 3: Download bootstrap
    const downloadDir = path.join(
      process.env.HOME || process.env.USERPROFILE || '',
      'Downloads'
    );
    const downloadPath = path.join(downloadDir, metadata.bootstrap.filename);

    const [downloadErr, downloadResult] = await eres(
      downloadFile(metadata.bootstrap.download_url, downloadPath, progressCallback)
    );

    if (downloadErr || !downloadResult || !downloadResult.success) {
      return { success: false, error: downloadResult?.error || 'Download failed' };
    }

    // Step 4: Verify checksum
    const [verifyErr, verifyResult] = await eres(
      verifyChecksum(downloadPath, metadata.bootstrap.sha256, progressCallback)
    );

    if (verifyErr || !verifyResult || !verifyResult.valid) {
      return {
        success: false,
        error: verifyResult?.error || 'Checksum verification failed',
      };
    }

    // Step 5: Remove old blockchain
    const [cleanupErr, cleanupResult] = await eres(removeOldBlockchain(progressCallback));

    if (cleanupErr || !cleanupResult || !cleanupResult.success) {
      return { success: false, error: 'Failed to remove old blockchain' };
    }

    // Step 6: Extract bootstrap
    const dataDir = getZclassicDataDir();
    const [extractErr, extractResult] = await eres(
      extractBootstrap(downloadPath, dataDir, progressCallback)
    );

    if (extractErr || !extractResult || !extractResult.success) {
      return { success: false, error: extractResult?.error || 'Extraction failed' };
    }

    // Step 7: Cleanup downloaded archive
    if (progressCallback) {
      progressCallback('cleanup', 50, 'Cleaning up download...');
    }

    try {
      fs.unlinkSync(downloadPath);
    } catch (e) {
      // Non-critical error
    }

    if (progressCallback) {
      progressCallback('complete', 100, 'Bootstrap installed successfully!');
    }

    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Check if bootstrap installation is recommended
export const shouldRecommendBootstrap = async (): Promise<boolean> => {
  try {
    const dataDir = getZclassicDataDir();
    const blocksDir = path.join(dataDir, 'blocks');

    // Check if blockchain data exists
    if (!fs.existsSync(blocksDir)) {
      return true; // No blockchain data, recommend bootstrap
    }

    // Check block count
    const blockFiles = fs.readdirSync(blocksDir).filter((f) => f.startsWith('blk'));

    // If less than 10 block files, recommend bootstrap
    return blockFiles.length < 10;
  } catch (error) {
    return true; // On error, recommend bootstrap to be safe
  }
};

// Get estimated total time for bootstrap installation
export const getEstimatedInstallTime = async (): Promise<number> => {
  const [err, result] = await eres(fetchBootstrapMetadata());

  if (err || !result || !result.success || !result.metadata) {
    return 35; // Default estimate: 35 minutes
  }

  return result.metadata.installation.total_estimated_minutes;
};
