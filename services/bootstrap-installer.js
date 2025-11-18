// @flow
/**
 * Bootstrap Installer Service for Zipher
 * Downloads and installs blockchain bootstrap from GitHub releases
 * Uses split files to work around GitHub's 2GB file size limit
 */

import eres from 'eres';
import BOOTSTRAP_CONFIG from '../app/constants/bootstrap';

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const https = require('https');
const { spawn } = require('child_process');

type ProgressCallback = (stage: string, progress: number, message: string) => void;

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

// Fetch bootstrap metadata from BOOTSTRAP_CONFIG
export const fetchBootstrapMetadata = async (): Promise<{
  success: boolean,
  metadata?: any,
  error?: string,
}> => {
  try {
    const { REPO, TAG, BLOCK_HEIGHT, BEST_BLOCK_HASH, BLOCK_TIME, BLOCK_TIME_HUMAN, TOTAL_SIZE_GB, TOTAL_PARTS } = BOOTSTRAP_CONFIG;

    // Construct metadata from config
    const metadata = {
      repo: REPO,
      tag: TAG,
      block_height: BLOCK_HEIGHT,
      best_block_hash: BEST_BLOCK_HASH,
      block_time: BLOCK_TIME,
      block_time_human: BLOCK_TIME_HUMAN,
      total_size_gb: TOTAL_SIZE_GB,
      total_parts: TOTAL_PARTS,
      base_url: `https://github.com/${REPO}/releases/download/${TAG}`,
    };

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

// Combine split part files into single archive
const combineParts = (
  partFiles: Array<string>,
  outputPath: string,
  progressCallback?: ProgressCallback
): Promise<{ success: boolean, error?: string }> => {
  return new Promise((resolve) => {
    try {
      if (progressCallback) {
        progressCallback('combine', 0, 'Combining archive parts...');
      }

      // Create output stream
      const output = fs.createWriteStream(outputPath);
      let currentPart = 0;
      let totalBytes = 0;
      let processedBytes = 0;

      // Calculate total size
      partFiles.forEach((partFile) => {
        totalBytes += fs.statSync(partFile).size;
      });

      // Combine parts sequentially
      const combinePart = (index: number) => {
        if (index >= partFiles.length) {
          output.end();
          if (progressCallback) {
            progressCallback('combine', 100, 'Parts combined successfully');
          }
          resolve({ success: true });
          return;
        }

        const partFile = partFiles[index];
        const input = fs.createReadStream(partFile);

        input.on('data', (chunk) => {
          output.write(chunk);
          processedBytes += chunk.length;

          if (progressCallback && totalBytes > 0) {
            const progress = (processedBytes / totalBytes) * 100;
            progressCallback(
              'combine',
              progress,
              `Combining part ${index + 1}/${partFiles.length}...`
            );
          }
        });

        input.on('end', () => {
          currentPart++;
          combinePart(currentPart);
        });

        input.on('error', (error) => {
          output.end();
          resolve({ success: false, error: error.message });
        });
      };

      combinePart(0);

      output.on('error', (error) => {
        resolve({ success: false, error: error.message });
      });
    } catch (error) {
      resolve({ success: false, error: error.message });
    }
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

// Extract bootstrap with progress (uses zstd compression)
const extractBootstrap = (
  archivePath: string,
  destDir: string,
  progressCallback?: ProgressCallback
): Promise<{ success: boolean, error?: string }> => {
  return new Promise((resolve) => {
    if (progressCallback) {
      progressCallback('extract', 0, 'Extracting bootstrap...');
    }

    // Use tar with zstd decompression
    const tar = spawn('tar', [
      '--use-compress-program=zstd',
      '-xf',
      archivePath,
      '-C',
      destDir,
      '--strip-components=1',
    ]);

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
  const downloadDir = path.join(
    process.env.HOME || process.env.USERPROFILE || '',
    'Downloads',
    'zipher-bootstrap-temp'
  );

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
    const { repo, tag, total_size_gb, total_parts, base_url } = metadata;

    if (progressCallback) {
      progressCallback(
        'init',
        100,
        `Found bootstrap: ${total_size_gb} GB (${total_parts} parts)`
      );
    }

    // Step 2: Create wallet backup
    const [backupErr, backupResult] = await eres(createWalletBackup(progressCallback));

    if (backupErr || !backupResult || !backupResult.success) {
      return { success: false, error: 'Failed to create wallet backup' };
    }

    // Step 3: Create temp download directory
    if (!fs.existsSync(downloadDir)) {
      fs.mkdirSync(downloadDir, { recursive: true });
    }

    // Step 4: Download all parts
    const baseName = `zclassic-bootstrap-${tag.replace('bootstrap-', '')}`;
    const partFiles = [];

    for (let i = 1; i <= total_parts; i++) {
      const partNum = String(i).padStart(2, '0');
      const partFilename = `${baseName}-part-${partNum}.part`;
      const partUrl = `${base_url}/${partFilename}`;
      const partPath = path.join(downloadDir, partFilename);

      if (progressCallback) {
        progressCallback(
          'download',
          0,
          `Downloading part ${i}/${total_parts}...`
        );
      }

      const [downloadErr, downloadResult] = await eres(
        downloadFile(partUrl, partPath, (stage, progress, message) => {
          if (progressCallback) {
            progressCallback(stage, progress, `Part ${i}/${total_parts}: ${message}`);
          }
        })
      );

      if (downloadErr || !downloadResult || !downloadResult.success) {
        return { success: false, error: `Failed to download part ${i}: ${downloadResult?.error}` };
      }

      partFiles.push(partPath);
    }

    // Step 5: Combine parts into single archive
    const combinedPath = path.join(downloadDir, `${baseName}.tar.zst`);
    const [combineErr, combineResult] = await eres(
      combineParts(partFiles, combinedPath, progressCallback)
    );

    if (combineErr || !combineResult || !combineResult.success) {
      return { success: false, error: combineResult?.error || 'Failed to combine parts' };
    }

    // Step 6: Download and verify checksums (optional but recommended)
    // TODO: Download bootstrap-checksums.txt and verify combined archive

    // Step 7: Remove old blockchain
    const [cleanupErr, cleanupResult] = await eres(removeOldBlockchain(progressCallback));

    if (cleanupErr || !cleanupResult || !cleanupResult.success) {
      return { success: false, error: 'Failed to remove old blockchain' };
    }

    // Step 8: Extract bootstrap
    const dataDir = getZclassicDataDir();
    const [extractErr, extractResult] = await eres(
      extractBootstrap(combinedPath, dataDir, progressCallback)
    );

    if (extractErr || !extractResult || !extractResult.success) {
      return { success: false, error: extractResult?.error || 'Extraction failed' };
    }

    // Step 9: Cleanup downloaded files
    if (progressCallback) {
      progressCallback('cleanup', 50, 'Cleaning up download...');
    }

    try {
      // Remove part files
      partFiles.forEach((partFile) => {
        if (fs.existsSync(partFile)) {
          fs.unlinkSync(partFile);
        }
      });

      // Remove combined archive
      if (fs.existsSync(combinedPath)) {
        fs.unlinkSync(combinedPath);
      }

      // Remove temp directory
      if (fs.existsSync(downloadDir)) {
        fs.rmdirSync(downloadDir);
      }
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
