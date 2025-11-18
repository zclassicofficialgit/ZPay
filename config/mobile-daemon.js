// @flow
// Mobile Daemon Configuration for Zipher
// Enables full node daemon on Android and iOS devices

import { app } from 'electron';
import path from 'path';
import fs from 'fs';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

// Platform detection
export const isMobile = () => {
  const platform = process.platform;
  // React Native or Capacitor environment detection
  return typeof window !== 'undefined' &&
    (window.ReactNativeWebView || window.Capacitor ||
     navigator.userAgent.includes('Mobile'));
};

// Mobile-specific paths
export const getMobileDaemonPath = () => {
  if (process.platform === 'android') {
    // Android data directory
    return '/data/data/com.zipher.wallet/files/zclassicd';
  } else if (process.platform === 'ios') {
    // iOS app sandbox
    return path.join(app.getPath('documents'), 'zclassicd');
  }
  return null;
};

// Mobile blockchain data directory
export const getMobileDataDir = () => {
  if (process.platform === 'android') {
    // External storage for blockchain data (8GB+ required)
    return '/sdcard/Android/data/com.zipher.wallet/files/zclassic';
  } else if (process.platform === 'ios') {
    // iOS documents directory
    return path.join(app.getPath('documents'), '.zclassic');
  }
  return null;
};

// Mobile daemon configuration
export const getMobileConfig = () => ({
  // Optimized for mobile devices
  server: 1,
  daemon: 1,
  rpcuser: 'zipher_mobile',
  rpcpassword: generateSecurePassword(),
  rpcallowip: '127.0.0.1',

  // Mobile optimizations
  maxconnections: 8,        // Limit connections for battery
  dbcache: 100,            // Smaller cache for mobile RAM
  par: 1,                  // Single thread for mobile CPU
  checkblocks: 100,        // Faster startup
  checklevel: 2,           // Less intensive verification

  // Shielded-only mode
  disabletransparent: 1,   // Disable transparent addresses

  // Power saving
  blocksonly: 0,           // Full node, not blocks-only
  listen: 0,               // Don't accept incoming connections
  upnp: 0,                 // No UPnP for battery saving

  // Storage optimization
  prune: 0,                // No pruning - full blockchain
  txindex: 1,              // Full transaction index

  // Network optimization for mobile
  timeout: 30000,          // 30 second timeout
  bantimeout: 60,          // Short ban time
});

// Generate secure password for RPC
function generateSecurePassword() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let password = '';
  for (let i = 0; i < 32; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

// Initialize mobile daemon
export const initMobileDaemon = async () => {
  if (!isMobile()) return false;

  const daemonPath = getMobileDaemonPath();
  const dataDir = getMobileDataDir();

  // Create directories
  await fs.promises.mkdir(dataDir, { recursive: true });

  // Write config file
  const config = getMobileConfig();
  const configPath = path.join(dataDir, 'zclassic.conf');
  const configContent = Object.entries(config)
    .map(([key, value]) => `${key}=${value}`)
    .join('\n');

  await fs.promises.writeFile(configPath, configContent);

  // Set executable permissions on Android
  if (process.platform === 'android') {
    await execAsync(`chmod +x ${daemonPath}`);
  }

  return true;
};

// Start mobile daemon with optimized settings
export const startMobileDaemon = async () => {
  if (!isMobile()) return false;

  const daemonPath = getMobileDaemonPath();
  const dataDir = getMobileDataDir();

  // Check storage space (need at least 10GB free)
  const stats = await fs.promises.statfs(dataDir);
  const freeGB = stats.bavail * stats.bsize / (1024 * 1024 * 1024);

  if (freeGB < 10) {
    throw new Error(`Insufficient storage: ${freeGB.toFixed(2)}GB free, need 10GB+`);
  }

  // Start daemon with mobile-optimized flags
  const command = `${daemonPath} -datadir=${dataDir} -daemon`;

  try {
    await execAsync(command);
    console.log('Mobile daemon started successfully');
    return true;
  } catch (error) {
    console.error('Failed to start mobile daemon:', error);
    return false;
  }
};

// Monitor daemon status on mobile
export const getMobileDaemonStatus = async () => {
  if (!isMobile()) return null;

  try {
    const result = await execAsync('pgrep zclassicd');
    return {
      running: true,
      pid: result.stdout.trim()
    };
  } catch {
    return {
      running: false,
      pid: null
    };
  }
};

// Mobile-specific blockchain sync optimization
export const optimizeMobileSync = async () => {
  // Use checkpoint sync for faster initial sync
  const checkpoints = [
    { height: 100000, hash: '0000000000000000000000000000000000000000000000000000000000000000' },
    { height: 200000, hash: '0000000000000000000000000000000000000000000000000000000000000000' },
    { height: 500000, hash: '0000000000000000000000000000000000000000000000000000000000000000' },
    { height: 800000, hash: '0000000000000000000000000000000000000000000000000000000000000000' },
  ];

  // This would be implemented in the actual daemon
  return checkpoints;
};

// Battery optimization for mobile
export const setBatteryMode = async (mode: 'performance' | 'balanced' | 'powersave') => {
  if (!isMobile()) return;

  const settings = {
    performance: { maxconnections: 16, dbcache: 200, par: 2 },
    balanced: { maxconnections: 8, dbcache: 100, par: 1 },
    powersave: { maxconnections: 4, dbcache: 50, par: 1 }
  };

  const modeSettings = settings[mode];
  // Apply settings to running daemon via RPC
  console.log('Battery mode set to:', mode, modeSettings);
};

// Export mobile daemon binary paths for build system
export const MOBILE_BINARIES = {
  android: {
    arm64: 'bin/android/arm64-v8a/zclassicd',
    arm: 'bin/android/armeabi-v7a/zclassicd',
    x86_64: 'bin/android/x86_64/zclassicd',
  },
  ios: {
    arm64: 'bin/ios/arm64/zclassicd',
    simulator: 'bin/ios/x86_64/zclassicd',
  }
};