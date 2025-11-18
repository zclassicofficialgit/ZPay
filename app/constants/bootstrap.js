// @flow
/**
 * Bootstrap Configuration
 *
 * This file contains the configuration for the Zclassic blockchain bootstrap.
 * Update these values when a new bootstrap is released.
 */

export const BOOTSTRAP_CONFIG = {
  // GitHub Release Information
  REPO: 'VictorLux/Zipher',
  TAG: 'bootstrap-YYYYMMDD_HHMMSS', // Update with actual tag after upload

  // Blockchain Metadata
  BLOCK_HEIGHT: 0, // Update with actual block height
  BEST_BLOCK_HASH: '', // Update with actual block hash
  BLOCK_TIME: 0, // Unix timestamp
  BLOCK_TIME_HUMAN: '', // Human-readable date

  // File Information
  TOTAL_SIZE_GB: 0, // Total size in GB
  TOTAL_PARTS: 5, // Number of split files

  // SHA256 Checksums (will be verified during download)
  CHECKSUMS: {
    // Format: 'filename': 'sha256hash'
    // These will be populated from bootstrap-checksums.txt
  },

  // Download Configuration
  DOWNLOAD: {
    PARALLEL: true, // Download files in parallel
    MAX_RETRIES: 3, // Number of retry attempts
    RETRY_DELAY: 5000, // Delay between retries (ms)
  },

  // Installation Thresholds
  THRESHOLDS: {
    // If blockchain is more than this many blocks behind, suggest bootstrap
    BLOCKS_BEHIND_THRESHOLD: 10000,

    // If blockchain is more than this many days old, suggest bootstrap
    DAYS_BEHIND_THRESHOLD: 30,

    // Minimum free space required (bytes)
    MIN_FREE_SPACE: 20 * 1024 * 1024 * 1024, // 20 GB
  },

  // Progress Callbacks
  STEPS: {
    CHECK_SPACE: 'Checking available disk space',
    CHECK_DAEMON: 'Checking if daemon is running',
    CHECK_HEIGHT: 'Comparing blockchain heights',
    DOWNLOAD_METADATA: 'Downloading bootstrap metadata',
    VERIFY_METADATA: 'Verifying bootstrap is newer than local blockchain',
    DOWNLOAD_PARTS: 'Downloading bootstrap files',
    VERIFY_CHECKSUMS: 'Verifying file integrity',
    COMBINE_PARTS: 'Combining archive parts',
    EXTRACT_ARCHIVE: 'Extracting blockchain data',
    CLEANUP: 'Cleaning up temporary files',
    COMPLETE: 'Bootstrap installation complete',
  },
};

/**
 * Check if bootstrap should be recommended
 * @param {number} localHeight - Current local blockchain height
 * @param {number} localTimestamp - Timestamp of latest local block
 * @returns {boolean} True if bootstrap is recommended
 */
export function shouldRecommendBootstrap(
  localHeight: number,
  localTimestamp: number,
): boolean {
  const { BLOCK_HEIGHT, BLOCK_TIME } = BOOTSTRAP_CONFIG;
  const { BLOCKS_BEHIND_THRESHOLD, DAYS_BEHIND_THRESHOLD } = BOOTSTRAP_CONFIG.THRESHOLDS;

  // If bootstrap is not configured yet, don't recommend
  if (BLOCK_HEIGHT === 0) {
    return false;
  }

  // Check if local blockchain is too far behind in height
  const blocksBehind = BLOCK_HEIGHT - localHeight;
  if (blocksBehind > BLOCKS_BEHIND_THRESHOLD) {
    return true;
  }

  // Check if local blockchain is too old in time
  const currentTime = Math.floor(Date.now() / 1000);
  const daysBehind = (currentTime - localTimestamp) / (24 * 60 * 60);
  if (daysBehind > DAYS_BEHIND_THRESHOLD) {
    return true;
  }

  return false;
}

/**
 * Check if bootstrap is newer than local blockchain
 * @param {number} localHeight - Current local blockchain height
 * @param {number} localTimestamp - Timestamp of latest local block
 * @returns {boolean} True if bootstrap is newer
 */
export function isBootstrapNewer(
  localHeight: number,
  localTimestamp: number,
): boolean {
  const { BLOCK_HEIGHT, BLOCK_TIME } = BOOTSTRAP_CONFIG;

  // Bootstrap must be newer in both height AND time
  return BLOCK_HEIGHT > localHeight && BLOCK_TIME > localTimestamp;
}

/**
 * Get estimated download time based on connection speed
 * @param {number} speedMBps - Download speed in MB/s
 * @returns {string} Estimated time (e.g., "5 minutes")
 */
export function getEstimatedDownloadTime(speedMBps: number): string {
  const { TOTAL_SIZE_GB } = BOOTSTRAP_CONFIG;
  const totalMB = TOTAL_SIZE_GB * 1024;
  const seconds = totalMB / speedMBps;

  if (seconds < 60) {
    return `${Math.ceil(seconds)} seconds`;
  }

  const minutes = Math.ceil(seconds / 60);
  if (minutes < 60) {
    return `${minutes} minute${minutes > 1 ? 's' : ''}`;
  }

  const hours = Math.ceil(minutes / 60);
  return `${hours} hour${hours > 1 ? 's' : ''}`;
}

/**
 * Get file list for download
 * @returns {Array<string>} List of files to download
 */
export function getDownloadFileList(): Array<string> {
  const { TAG, TOTAL_PARTS } = BOOTSTRAP_CONFIG;
  const baseName = `zclassic-bootstrap-${TAG.replace('bootstrap-', '')}`;

  const files = [];

  // Add part files
  for (let i = 1; i <= TOTAL_PARTS; i++) {
    const partNum = String(i).padStart(2, '0');
    files.push(`${baseName}-part-${partNum}.part`);
  }

  // Add metadata files
  files.push('bootstrap-checksums.txt');
  files.push('BOOTSTRAP_README.md');

  return files;
}

export default BOOTSTRAP_CONFIG;
