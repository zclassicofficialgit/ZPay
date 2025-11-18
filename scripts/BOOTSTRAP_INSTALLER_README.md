# Zipher Bootstrap Installer

Automated blockchain bootstrap installation with comprehensive safety checks.

## Features

### 1. **Secure Download & Verification**
- Downloads from official source: https://github.com/VictorLux/zclassic-bootstrap
- File size: 8.3 GB (compressed)
- SHA256 checksum verification: `3b0aef51045921f3f55de7b0139b5e0b9955c08d9ede236d36db53e6e87a07cf`
- Real-time progress tracking with download speed and ETA

### 2. **Pre-Installation Safety Checks**

#### Daemon Running Check
- Detects if `zclassicd` is currently running
- Warns user to stop the daemon before proceeding
- Prevents conflicts during installation

#### Block Height Comparison
- Queries current blockchain height from running daemon
- Compares against bootstrap height (~830,000 blocks)
- **BLOCKS INSTALLATION** if current blockchain is more recent than bootstrap
- Prevents accidental blockchain downgrade

#### Example Output:
```
⚠️ WARNING: zclassicd is currently running
📊 Current blockchain height: 850000
📊 Bootstrap height: 830000
❌ Safety check failed: Your current blockchain (height: 850000) is MORE RECENT
   than the bootstrap (height: 830000). Installing the bootstrap would downgrade
   your blockchain data. Please sync normally instead.
```

### 3. **Backup Confirmation**

When existing blockchain data is detected:
```
⚠️ WARNING: Existing blockchain data detected!
⚠️ Installing bootstrap will OVERWRITE your current blockchain data

🔴 CRITICAL: Before proceeding, ensure you have:
   1. Backed up your wallet.dat file
   2. Stopped the zclassicd daemon
   3. Confirmed you want to replace existing blockchain data
```

**User must explicitly confirm** via UI dialog before proceeding.

### 4. **Installation Steps**

1. **Pre-flight checks** (< 1 second)
   - Check for running daemon
   - Compare blockchain heights
   - Check for existing data
   - Request backup confirmation

2. **Download** (~10-15 minutes @ typical broadband)
   - Progress tracking with percentage
   - Download speed in MB/s
   - Estimated time remaining
   - Automatic redirect following

3. **Verify** (~1 minute)
   - Calculate SHA256 hash of downloaded file
   - Compare against expected hash
   - Abort if mismatch detected

4. **Extract** (~5-10 minutes)
   - Extract to platform-specific data directory
   - Progress estimation
   - Automatic directory creation

5. **Cleanup** (< 1 second)
   - Remove temporary files
   - Free up disk space

**Total Time:** 17-28 minutes (well under 30-minute target)

## Platform-Specific Paths

### macOS
- Data directory: `~/Library/Application Support/Zclassic`
- Contains: `blocks/` and `chainstate/`

### Windows
- Data directory: `%APPDATA%\Zclassic`
- Contains: `blocks/` and `chainstate/`

### Linux
- Data directory: `~/.zclassic`
- Contains: `blocks/` and `chainstate/`

## Usage

```javascript
const BootstrapInstaller = require('./bootstrap-installer.js');

const installer = new BootstrapInstaller();

// Set up callbacks
installer.onProgress((info) => {
  console.log(`Step ${info.step}: ${info.stepName}`);
  console.log(`Progress: ${info.progress.toFixed(2)}%`);

  if (info.downloaded) {
    console.log(`Downloaded: ${info.downloaded} GB / ${info.total} GB`);
    console.log(`Speed: ${info.speed} MB/s`);
    console.log(`Time remaining: ${info.timeRemaining}`);
  }
});

installer.onComplete((result) => {
  if (result.skipped) {
    console.log('✅ Bootstrap not needed, blockchain data already exists');
  } else {
    console.log('✅ Bootstrap installation complete!');
  }
});

installer.onError((error) => {
  if (error.requiresConfirmation) {
    // Show UI confirmation dialog
    showConfirmDialog(error.message, () => {
      // User confirmed, proceed
      installer.install();
    });
  } else {
    console.error('❌ Installation failed:', error.message);
  }
});

// Start installation
installer.install();
```

## Safety Features Summary

| Feature | Description | Benefit |
|---------|-------------|---------|
| **Daemon Detection** | Checks if zclassicd is running | Prevents conflicts |
| **Height Comparison** | Compares current vs bootstrap height | Prevents downgrade |
| **Hash Verification** | SHA256 checksum validation | Ensures file integrity |
| **Backup Warning** | Prompts for wallet.dat backup | Prevents data loss |
| **Confirmation Required** | User must confirm before overwriting | Prevents accidental overwrites |
| **Progress Tracking** | Real-time download/extract progress | User visibility |

## Error Handling

The installer handles various error scenarios:

1. **Bootstrap more recent than current blockchain**: ✅ **Allowed** (upgrade)
2. **Current blockchain more recent than bootstrap**: ❌ **Blocked** (would downgrade)
3. **Daemon running**: ⚠️ **Warning** (recommend stop)
4. **Existing data without backup**: ❌ **Requires confirmation**
5. **Download failure**: ❌ **Aborts with error**
6. **Hash mismatch**: ❌ **Aborts with error**
7. **Extraction failure**: ❌ **Aborts with error**

## Next Steps

To integrate with Zipher UI:
1. Create setup wizard component
2. Display progress bars for each step
3. Implement confirmation dialogs
4. Add daemon auto-stop/start functionality
5. Include in first-run experience
