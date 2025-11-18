// @flow
import { format } from 'date-fns';
import rpc from './api';
import eres from 'eres';

const crypto = require('crypto');
const path = require('path');
const fs = require('fs');
const os = require('os');
const archiver = require('archiver');
const unzipper = require('unzipper');

// Get platform-specific backup directory
export const getBackupDirectory = async (): Promise<string> => {
  const platform = os.platform ? os.platform() : process.platform;
  let backupDir: string;

  if (platform === 'darwin') {
    const home = os.homedir ? os.homedir() : process.env.HOME;
    backupDir = path.join(home, 'Documents', 'Zipher Backups');
  } else if (platform === 'win32') {
    const userProfile = process.env.USERPROFILE || '';
    backupDir = path.join(userProfile, 'Documents', 'Zipher Backups');
  } else {
    const home = os.homedir ? os.homedir() : process.env.HOME;
    backupDir = path.join(home, 'Documents', 'zipher-backups');
  }

  // Create directory if it doesn't exist
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }

  return backupDir;
};

// Get wallet.dat location
export const getWalletPath = (): string => {
  const platform = os.platform ? os.platform() : process.platform;
  let walletPath: string;

  if (platform === 'darwin') {
    const home = os.homedir ? os.homedir() : process.env.HOME;
    walletPath = path.join(home, 'Library', 'Application Support', 'Zclassic', 'wallet.dat');
  } else if (platform === 'win32') {
    const appData = process.env.APPDATA || '';
    walletPath = path.join(appData, 'ZClassic', 'wallet.dat');
  } else {
    const home = os.homedir ? os.homedir() : process.env.HOME;
    walletPath = path.join(home, '.zclassic', 'wallet.dat');
  }

  return walletPath;
};

// Calculate SHA256 checksum
const calculateChecksum = (filePath: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const hash = crypto.createHash('sha256');
    const stream = fs.createReadStream(filePath);

    stream.on('data', (data) => hash.update(data));
    stream.on('end', () => resolve(hash.digest('hex')));
    stream.on('error', reject);
  });
};

// Generate backup filename with timestamp
export const generateBackupFilename = (): string => {
  const timestamp = format(new Date(), 'yyyyMMdd_HHmmss');
  return `wallet_fullnode_zipher_${timestamp}.zip`;
};

type BackupMetadata = {
  timestamp: string,
  version: string,
  network: string,
  checksum: string,
};

// Create compressed backup
export const createBackup = async (
  customPath?: string
): Promise<{ success: boolean, path?: string, error?: string }> => {
  try {
    const backupDir = customPath ? path.dirname(customPath) : await getBackupDirectory();
    const backupFilename = customPath ? path.basename(customPath) : generateBackupFilename();
    const backupPath = path.join(backupDir, backupFilename);
    const walletPath = getWalletPath();

    // Check if wallet.dat exists
    if (!fs.existsSync(walletPath)) {
      return { success: false, error: 'Wallet file not found' };
    }

    // Use RPC backupwallet to create a temporary backup
    const tempBackupPath = path.join(backupDir, 'temp_wallet_backup.dat');
    const [backupErr] = await eres(rpc.backupwallet(tempBackupPath));

    if (backupErr) {
      // Fallback to direct file copy if RPC fails
      fs.copyFileSync(walletPath, tempBackupPath);
    }

    // Calculate checksum
    const checksum = await calculateChecksum(tempBackupPath);

    // Create metadata
    const metadata: BackupMetadata = {
      timestamp: new Date().toISOString(),
      version: '1.0',
      network: 'mainnet',
      checksum,
    };

    // Create ZIP archive
    await new Promise((resolve, reject) => {
      const output = fs.createWriteStream(backupPath);
      const archive = archiver('zip', { zlib: { level: 9 } });

      output.on('close', resolve);
      archive.on('error', reject);

      archive.pipe(output);

      // Add wallet.dat to archive
      archive.file(tempBackupPath, { name: 'wallet.dat' });

      // Add metadata
      archive.append(JSON.stringify(metadata, null, 2), { name: 'metadata.json' });

      // Add checksum file
      archive.append(checksum, { name: 'checksum.txt' });

      archive.finalize();
    });

    // Clean up temp file
    if (fs.existsSync(tempBackupPath)) {
      fs.unlinkSync(tempBackupPath);
    }

    return { success: true, path: backupPath };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

type BackupInfo = {
  filename: string,
  path: string,
  timestamp: Date,
  size: number,
  verified: boolean,
};

// List all backups in the backup directory
export const listBackups = async (): Promise<BackupInfo[]> => {
  try {
    const backupDir = await getBackupDirectory();
    const files = fs.readdirSync(backupDir);

    const backups = files
      .filter(file => file.startsWith('wallet_fullnode_zipher_') && file.endsWith('.zip'))
      .map(file => {
        const filePath = path.join(backupDir, file);
        const stats = fs.statSync(filePath);

        // Extract timestamp from filename
        const timestampMatch = file.match(/wallet_fullnode_zipher_(\d{8})_(\d{6})\.zip/);
        let timestamp = stats.mtime;

        if (timestampMatch) {
          const [, date, time] = timestampMatch;
          const year = date.substring(0, 4);
          const month = date.substring(4, 6);
          const day = date.substring(6, 8);
          const hour = time.substring(0, 2);
          const minute = time.substring(2, 4);
          const second = time.substring(4, 6);
          timestamp = new Date(`${year}-${month}-${day}T${hour}:${minute}:${second}`);
        }

        return {
          filename: file,
          path: filePath,
          timestamp,
          size: stats.size,
          verified: false, // Will be verified on demand
        };
      })
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    return backups;
  } catch (error) {
    console.error('Error listing backups:', error);
    return [];
  }
};

// Verify backup integrity
export const verifyBackup = async (backupPath: string): Promise<{ valid: boolean, error?: string }> => {
  try {
    // Read zip file and check contents
    const directory = await unzipper.Open.file(backupPath);
    const files = directory.files;

    // Check if required files exist
    const hasWallet = files.some(file => file.path === 'wallet.dat');
    const hasChecksum = files.some(file => file.path === 'checksum.txt');

    if (!hasWallet) {
      return { valid: false, error: 'Missing wallet.dat' };
    }

    if (hasChecksum) {
      // Extract wallet.dat to temp location
      const tempDir = path.join(await getBackupDirectory(), 'temp_verify');
      if (!fs.existsSync(tempDir)) {
        fs.mkdirSync(tempDir, { recursive: true });
      }

      const tempWalletPath = path.join(tempDir, 'wallet.dat');

      // Extract wallet.dat
      const walletFile = files.find(file => file.path === 'wallet.dat');
      if (walletFile) {
        const buffer = await walletFile.buffer();
        fs.writeFileSync(tempWalletPath, buffer);
      }

      // Read checksum
      const checksumFile = files.find(file => file.path === 'checksum.txt');
      let storedChecksum = '';
      if (checksumFile) {
        const buffer = await checksumFile.buffer();
        storedChecksum = buffer.toString('utf8').trim();
      }

      // Verify checksum
      const calculatedChecksum = await calculateChecksum(tempWalletPath);

      // Clean up
      if (fs.existsSync(tempWalletPath)) {
        fs.unlinkSync(tempWalletPath);
      }
      if (fs.existsSync(tempDir)) {
        fs.rmdirSync(tempDir);
      }

      if (storedChecksum !== calculatedChecksum) {
        return { valid: false, error: 'Checksum mismatch' };
      }
    }

    return { valid: true };
  } catch (error) {
    return { valid: false, error: error.message };
  }
};

// Restore backup
export const restoreBackup = async (
  backupPath: string
): Promise<{ success: boolean, error?: string }> => {
  try {
    // First verify the backup
    const verification = await verifyBackup(backupPath);
    if (!verification.valid) {
      return { success: false, error: verification.error || 'Backup verification failed' };
    }

    const walletPath = getWalletPath();
    const walletDir = path.dirname(walletPath);

    // Create backup of current wallet before restoring
    const currentBackupPath = path.join(walletDir, `wallet.dat.before-restore-${Date.now()}`);
    if (fs.existsSync(walletPath)) {
      fs.copyFileSync(walletPath, currentBackupPath);
    }

    // Extract wallet.dat from ZIP
    const tempDir = path.join(await getBackupDirectory(), 'temp_restore');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    // Extract using unzipper
    const directory = await unzipper.Open.file(backupPath);
    const walletFile = directory.files.find(file => file.path === 'wallet.dat');

    if (!walletFile) {
      return { success: false, error: 'wallet.dat not found in backup' };
    }

    const restoredWalletPath = path.join(tempDir, 'wallet.dat');
    const buffer = await walletFile.buffer();
    fs.writeFileSync(restoredWalletPath, buffer);

    // Copy to wallet location
    fs.copyFileSync(restoredWalletPath, walletPath);

    // Clean up
    if (fs.existsSync(restoredWalletPath)) {
      fs.unlinkSync(restoredWalletPath);
    }
    if (fs.existsSync(tempDir)) {
      fs.rmdirSync(tempDir);
    }

    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Delete backup
export const deleteBackup = async (backupPath: string): Promise<{ success: boolean, error?: string }> => {
  try {
    if (fs.existsSync(backupPath)) {
      fs.unlinkSync(backupPath);
      return { success: true };
    }
    return { success: false, error: 'Backup file not found' };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Export backup to external location
export const exportBackup = async (
  backupPath: string,
  destinationPath: string
): Promise<{ success: boolean, error?: string }> => {
  try {
    fs.copyFileSync(backupPath, destinationPath);
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};
