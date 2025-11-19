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
const http = require('http');
const urlParser = require('url');
const dns = require('dns');
const { spawn } = require('child_process');
const zstd = require('@mongodb-js/zstd');
const tar = require('tar-stream');

type ProgressCallback = (stage: string, progress: number, message: string) => void;

// Get platform-specific Zclassic data directory
const getZclassicDataDir = (): string => {
  const platform = process.platform;

  if (platform === 'darwin') {
    return path.join(process.env.HOME || '', 'Library', 'Application Support', 'Zclassic');
  } if (platform === 'win32') {
    return path.join(process.env.APPDATA || '', 'ZClassic');
  }
  return path.join(process.env.HOME || '', '.zclassic');
};

// Fetch bootstrap metadata from BOOTSTRAP_CONFIG
export const fetchBootstrapMetadata = async (): Promise<{
  success: boolean,
  metadata?: any,
  error?: string,
}> => {
  try {
    const {
      REPO, TAG, BLOCK_HEIGHT, BEST_BLOCK_HASH, BLOCK_TIME, BLOCK_TIME_HUMAN, TOTAL_SIZE_GB, TOTAL_PARTS,
    } = BOOTSTRAP_CONFIG;

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

// Download file with progress tracking (follows redirects)
const downloadFile = (
  url: string,
  destPath: string,
  progressCallback?: ProgressCallback,
  maxRedirects: number = 5,
): Promise<{ success: boolean, error?: string }> => new Promise((resolve) => {
  // Delete existing file if it exists (from interrupted download)
  if (fs.existsSync(destPath)) {
    try {
      fs.unlinkSync(destPath);
    } catch (e) {
      // Ignore errors
    }
  }

  let file;
  try {
    file = fs.createWriteStream(destPath);
  } catch (err) {
    resolve({ success: false, error: `Cannot create file: ${err.message}` });
    return;
  }

  let downloadedBytes = 0;
  let totalBytes = 0;

  const handleResponse = (response, redirectCount = 0) => {
    // Handle redirects (301, 302, 307, 308)
    if ([301, 302, 307, 308].includes(response.statusCode)) {
      if (redirectCount >= maxRedirects) {
        file.end();
        resolve({ success: false, error: `Too many redirects (${redirectCount})` });
        return;
      }

      const redirectUrl = response.headers.location;
      if (!redirectUrl) {
        file.end();
        resolve({ success: false, error: 'Redirect without location header' });
        return;
      }

      // Parse redirect URL to determine protocol
      const parsedUrl = urlParser.parse(redirectUrl);
      const protocol = parsedUrl.protocol === 'https:' ? https : http;

      // Pre-resolve DNS to avoid DNS resolution timeouts
      dns.resolve4(parsedUrl.hostname, (dnsErr, addresses) => {
        if (dnsErr) {
          // DNS resolution failed - try the request anyway, Node.js will do its own resolution
          console.log(`DNS pre-resolution failed for ${parsedUrl.hostname}: ${dnsErr.message}, attempting request anyway`);
        } else {
          console.log(`DNS resolved ${parsedUrl.hostname} to ${addresses[0]}`);
        }

        // Follow redirect with appropriate protocol and timeout
        const request = protocol.get(redirectUrl, {
          timeout: 60000, // 60 second timeout
        }, (redirectResponse) => {
          handleResponse(redirectResponse, redirectCount + 1);
        });

        request.on('timeout', () => {
          request.destroy();
          file.end();
          resolve({ success: false, error: `Request timeout for ${parsedUrl.hostname}` });
        });

        request.on('error', (error) => {
          file.end();
          resolve({ success: false, error: `Redirect to ${parsedUrl.hostname} failed: ${error.message}` });
        });
      });
      return;
    }

    // Check for success
    if (response.statusCode !== 200) {
      file.end();
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
          `Downloaded ${mbDownloaded} MB / ${mbTotal} MB`,
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
  };

  https
    .get(url, handleResponse)
    .on('error', (error) => {
      file.end();
      resolve({ success: false, error: error.message });
    });
});

// Combine split part files into single archive
const combineParts = (
  partFiles: Array<string>,
  outputPath: string,
  progressCallback?: ProgressCallback,
): Promise<{ success: boolean, error?: string }> => new Promise((resolve) => {
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
            `Combining part ${index + 1}/${partFiles.length}...`,
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

// Verify file checksum
const verifyChecksum = async (
  filePath: string,
  expectedSha256: string,
  progressCallback?: ProgressCallback,
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
  progressCallback?: ProgressCallback,
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

// Extract bootstrap with progress (uses system tar command due to file size >2GB limitation)
const extractBootstrap = (
  archivePath: string,
  destDir: string,
  progressCallback?: ProgressCallback,
): Promise<{ success: boolean, error?: string }> => new Promise((resolve) => {
  try {
    if (progressCallback) {
      progressCallback('extract', 0, 'Preparing extraction...');
    }

    // Ensure destination directory exists
    if (!fs.existsSync(destDir)) {
      fs.mkdirSync(destDir, { recursive: true });
    }

    const fileSize = fs.statSync(archivePath).size;
    if (progressCallback) {
      progressCallback('extract', 5, `Extracting ${(fileSize / 1024 / 1024 / 1024).toFixed(2)} GB archive...`);
    }

    // Use zstd to decompress and pipe to tar (works with large files)
    // Try bundled binary first, fallback to system zstd
    const { spawn } = require('child_process');
    const platform = process.platform;

    // Determine bundled zstd path
    // In production (app.asar), binaries are unpacked to app.asar.unpacked
    // In development, they're in the source directory
    let bundledZstd;
    let zstdCommand;

    // Try to find the bundled binary in the unpacked resources first (production)
    const resourcesPath = process.resourcesPath || path.join(__dirname, '..');
    const unpackedPath = path.join(resourcesPath, 'app.asar.unpacked', 'bin', 'zstd');
    const devPath = path.join(__dirname, '../bin/zstd');

    if (platform === 'darwin') {
      bundledZstd = path.join(unpackedPath, 'mac/zstd');
      if (!fs.existsSync(bundledZstd)) {
        bundledZstd = path.join(devPath, 'mac/zstd');
      }
    } else if (platform === 'win32') {
      bundledZstd = path.join(unpackedPath, 'win/zstd.exe');
      if (!fs.existsSync(bundledZstd)) {
        bundledZstd = path.join(devPath, 'win/zstd.exe');
      }
    } else {
      bundledZstd = path.join(unpackedPath, 'linux/zstd');
      if (!fs.existsSync(bundledZstd)) {
        bundledZstd = path.join(devPath, 'linux/zstd');
      }
    }

    // Check if bundled binary exists, otherwise use system zstd
    if (fs.existsSync(bundledZstd)) {
      zstdCommand = bundledZstd;
      if (progressCallback) {
        progressCallback('extract', 3, 'Using bundled zstd binary...');
      }
    } else {
      zstdCommand = 'zstd';
      if (progressCallback) {
        progressCallback('extract', 3, 'Using system zstd command...');
      }
    }

    let shell, shellFlag, command;

    if (platform === 'win32') {
      // Windows: use cmd.exe
      shell = 'cmd.exe';
      shellFlag = '/c';
      command = `"${zstdCommand}" -dc "${archivePath}" | tar -x -C "${destDir}" --strip-components=1`;
    } else {
      // macOS/Linux: use sh
      shell = 'sh';
      shellFlag = '-c';
      command = `${zstdCommand} -dc "${archivePath}" | tar -x -C "${destDir}" --strip-components=1`;
    }

    const extractProcess = spawn(shell, [shellFlag, command], {
      stdio: ['ignore', 'pipe', 'pipe'],
    });

    let filesExtracted = 0;
    let lastUpdate = Date.now();
    let stderrOutput = '';

    // Monitor stderr for progress (tar outputs file names to stderr)
    extractProcess.stderr.on('data', (data) => {
      const dataStr = data.toString();
      stderrOutput += dataStr;
      const lines = dataStr.split('\n');
      filesExtracted += lines.length;

      // Update progress every 2 seconds
      const now = Date.now();
      if (now - lastUpdate > 2000 && progressCallback) {
        const estimatedProgress = Math.min(95, 10 + (filesExtracted / 1000) * 85);
        progressCallback('extract', estimatedProgress, `Extracted ${filesExtracted.toLocaleString()} files...`);
        lastUpdate = now;
      }
    });

    extractProcess.on('close', (code) => {
      if (code === 0) {
        if (progressCallback) {
          progressCallback('extract', 100, `Extraction complete - ${filesExtracted.toLocaleString()} files extracted`);
        }
        resolve({ success: true });
      } else {
        // Include stderr output in error message
        const errorDetails = stderrOutput ? `\nDetails: ${stderrOutput.slice(0, 500)}` : '';
        resolve({ success: false, error: `Extraction failed with code ${code}${errorDetails}` });
      }
    });

    extractProcess.on('error', (error) => {
      let errorMessage = `Extraction error: ${error.message}`;

      // Check if zstd is not installed
      if (error.code === 'ENOENT') {
        errorMessage = 'zstd command not found. Please install zstd:\n';
        if (platform === 'darwin') {
          errorMessage += 'macOS: brew install zstd';
        } else if (platform === 'win32') {
          errorMessage += 'Windows: choco install zstd or scoop install zstd';
        } else {
          errorMessage += 'Linux: sudo apt install zstd or sudo yum install zstd';
        }
      }

      resolve({ success: false, error: errorMessage });
    });
  } catch (error) {
    resolve({ success: false, error: `Extraction error: ${error.message}` });
  }
});

// Remove existing blockchain data
const removeOldBlockchain = async (
  progressCallback?: ProgressCallback,
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
  progressCallback?: ProgressCallback,
): Promise<{ success: boolean, error?: string }> => {
  const downloadDir = path.join(
    process.env.HOME || process.env.USERPROFILE || '',
    'Downloads',
    'zipher-bootstrap-temp',
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
    const {
      repo, tag, total_size_gb, total_parts, base_url,
    } = metadata;

    if (progressCallback) {
      progressCallback(
        'init',
        100,
        `Found bootstrap: ${total_size_gb} GB (${total_parts} parts)`,
      );
    }

    // Step 2: Create wallet backup
    const [backupErr, backupResult] = await eres(createWalletBackup(progressCallback));

    if (backupErr || !backupResult || !backupResult.success) {
      return { success: false, error: 'Failed to create wallet backup' };
    }

    // Step 3: Create temp download directory (clean up any previous attempts)
    if (fs.existsSync(downloadDir)) {
      // Remove old incomplete downloads
      try {
        fs.rmSync(downloadDir, { recursive: true, force: true });
      } catch (cleanupError) {
        // If cleanup fails, try to continue anyway
        log(`Warning: Could not clean up old download directory: ${cleanupError.message}`);
      }
    }

    fs.mkdirSync(downloadDir, { recursive: true });

    // Step 4: Download all parts IN PARALLEL for faster speeds
    const baseName = `zclassic-bootstrap-${tag.replace('bootstrap-', '')}`;
    const partFiles = [];

    // Track progress for all parts
    const partProgress = {};
    for (let i = 1; i <= total_parts; i++) {
      partProgress[i] = 0;
    }

    // Create download promises for all parts
    const downloadPromises = [];
    for (let i = 1; i <= total_parts; i++) {
      const partNum = String(i).padStart(2, '0');
      const partFilename = `${baseName}-part-${partNum}.part`;
      const partUrl = `${base_url}/${partFilename}`;
      const partPath = path.join(downloadDir, partFilename);

      partFiles.push(partPath);

      // Create download promise
      const downloadPromise = downloadFile(partUrl, partPath, (stage, progress, message) => {
        // Update progress for this part
        partProgress[i] = progress;

        // Calculate overall progress (average of all parts)
        const totalProgress = Object.values(partProgress).reduce((sum, p) => sum + p, 0) / total_parts;

        // Count completed parts
        const completedParts = Object.values(partProgress).filter(p => p >= 100).length;

        if (progressCallback) {
          progressCallback(
            'download',
            totalProgress,
            `Downloading ${completedParts}/${total_parts} parts complete (${totalProgress.toFixed(0)}%)`,
          );
        }
      }).then(result => ({ partNum: i, result }));

      downloadPromises.push(downloadPromise);
    }

    if (progressCallback) {
      progressCallback('download', 0, `Starting parallel download of ${total_parts} parts...`);
    }

    // Download all parts in parallel
    const downloadResults = await Promise.all(downloadPromises);

    // Check if all downloads succeeded
    for (const { partNum, result } of downloadResults) {
      if (!result.success) {
        return { success: false, error: `Failed to download part ${partNum}: ${result.error}` };
      }
    }

    if (progressCallback) {
      progressCallback('download', 100, `All ${total_parts} parts downloaded successfully!`);
    }

    // Step 5: Combine parts into single archive
    const combinedPath = path.join(downloadDir, `${baseName}.tar.zst`);
    const [combineErr, combineResult] = await eres(
      combineParts(partFiles, combinedPath, progressCallback),
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
      extractBootstrap(combinedPath, dataDir, progressCallback),
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

      // Remove temp directory and all its contents
      if (fs.existsSync(downloadDir)) {
        fs.rmSync(downloadDir, { recursive: true, force: true });
      }
    } catch (e) {
      // Non-critical error - log but continue
      console.error('Cleanup error:', e.message);
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
    const blockFiles = fs.readdirSync(blocksDir).filter(f => f.startsWith('blk'));

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
