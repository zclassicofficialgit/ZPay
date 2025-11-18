# Zipher Bootstrap System - Complete Guide

## Overview

The Zipher Bootstrap System provides an automated way to distribute and install Zclassic blockchain data, reducing initial sync time from days to minutes.

## System Components

### 1. Bootstrap Creation (`create-production-bootstrap.sh`)

Creates a production-ready bootstrap with full metadata.

**Features:**
- ✅ Extracts live blockchain metadata (height, hash, timestamp)
- ✅ zstd level 19 compression (30% smaller than gzip, 3x faster decompression)
- ✅ Automatic file splitting for GitHub 2GB limit
- ✅ SHA256 checksums for all files
- ✅ metadata.json with complete blockchain information
- ✅ Detailed README for users

**Output Files:**
```
~/Downloads/zipher-bootstrap/
├── zclassic-bootstrap-YYYYMMDD_HHMMSS.tar.zst (original archive)
├── zclassic-bootstrap-YYYYMMDD_HHMMSS-part-01.part
├── zclassic-bootstrap-YYYYMMDD_HHMMSS-part-02.part
├── zclassic-bootstrap-YYYYMMDD_HHMMSS-part-03.part
├── zclassic-bootstrap-YYYYMMDD_HHMMSS-part-04.part
├── zclassic-bootstrap-YYYYMMDD_HHMMSS-part-05.part
├── bootstrap-checksums.txt
├── download-and-combine.sh
└── BOOTSTRAP_README.md
```

**Usage:**
```bash
cd /path/to/Zipher
./scripts/create-production-bootstrap.sh
```

**Time:** ~15-25 minutes (depending on blockchain size)

**Steps:**
1. Check daemon status (must be stopped)
2. Verify blockchain data exists
3. Start daemon to extract metadata
4. Calculate blockchain size
5. Copy blocks and chainstate (excluding index)
6. Create metadata.json
7. Create README.md
8. Compress with zstd level 19
9. Split into 1.9GB parts
10. Calculate SHA256 checksums
11. Create user download script

### 2. Production Upload (`github-release-upload-production.sh`)

Uploads bootstrap to GitHub Releases with full metadata.

**Features:**
- ✅ Parallel upload (all files simultaneously)
- ✅ Automatic metadata extraction from archive
- ✅ Public release with detailed notes
- ✅ File verification after upload
- ✅ Generated download script with actual release tag

**Usage:**
```bash
cd /path/to/Zipher
./scripts/github-release-upload-production.sh
```

**Time:** ~5-8 minutes (parallel upload at ~26 MB/s)

**Output:**
- GitHub Release URL
- Updated download script with actual tag
- Upload performance summary

### 3. Bootstrap Configuration (`app/constants/bootstrap.js`)

JavaScript configuration for Zipher app integration.

**Key Functions:**
- `shouldRecommendBootstrap()` - Determines if bootstrap should be suggested
- `isBootstrapNewer()` - Checks if bootstrap is newer than local blockchain
- `getEstimatedDownloadTime()` - Calculates estimated download time
- `getDownloadFileList()` - Returns list of files to download

**Update After Upload:**
```javascript
export const BOOTSTRAP_CONFIG = {
  TAG: 'bootstrap-20251118_105417',  // From upload script
  BLOCK_HEIGHT: 830123,               // From metadata
  BEST_BLOCK_HASH: '0000...abc',      // From metadata
  BLOCK_TIME: 1700000000,             // From metadata
  BLOCK_TIME_HUMAN: '2025-11-18 10:54:17',
  TOTAL_SIZE_GB: 7.74,                // From upload summary
  TOTAL_PARTS: 5,                     // Number of split files
};
```

### 4. Bootstrap Installer (`scripts/bootstrap-installer.js`)

Node.js module for automated bootstrap installation.

**Features:**
- ✅ Pre-flight safety checks (daemon running, height comparison)
- ✅ Parallel download with progress tracking
- ✅ SHA256 checksum verification
- ✅ Automatic file combination
- ✅ Extract to platform-specific data directory
- ✅ Cleanup temporary files

**Integration:**
```javascript
const BootstrapInstaller = require('./bootstrap-installer.js');

const installer = new BootstrapInstaller();

installer.onProgress((info) => {
  console.log(`Step ${info.step}: ${info.stepName}`);
  console.log(`Progress: ${info.progress}%`);
});

installer.onComplete((result) => {
  console.log('Bootstrap installed successfully!');
});

installer.onError((error) => {
  console.error('Installation failed:', error.message);
});

installer.install();
```

## Complete Workflow

### A. Creating and Uploading a New Bootstrap

```bash
# 1. Stop Zipher app (daemon must not be running)
# Close Zipher application

# 2. Create bootstrap
cd /path/to/Zipher
./scripts/create-production-bootstrap.sh

# Output:
#   Block Height: 830123
#   Block Hash: 0000...abc
#   Archive: 7.74 GB
#   Split into: 5 parts

# 3. Upload to GitHub
./scripts/github-release-upload-production.sh

# Output:
#   Release URL: https://github.com/VictorLux/Zipher/releases/tag/bootstrap-20251118_105417
#   Upload time: 5m 4s

# 4. Update Zipher app configuration
# Edit: app/constants/bootstrap.js
# Set TAG, BLOCK_HEIGHT, BEST_BLOCK_HASH, etc.

# 5. Test download
cd ~/Downloads/zipher-bootstrap
./download-and-combine-bootstrap-20251118_105417.sh

# 6. Rebuild Zipher app
cd /path/to/Zipher
yarn build  # Or yarn dev for development
```

### B. User Experience (Automatic)

When a user launches Zipher:

```
1. Zipher starts
2. Checks for zclassicd daemon
   ├─ If not found → Suggest bootstrap
   └─ If found → Check blockchain height
       ├─ If too far behind → Suggest bootstrap
       └─ If up to date → Normal operation

3. User accepts bootstrap
4. Bootstrap installer runs:
   ├─ Check daemon is stopped
   ├─ Check blockchain height (prevent downgrade)
   ├─ Download all files in parallel (~3 minutes)
   ├─ Verify checksums
   ├─ Combine parts
   ├─ Extract to data directory
   └─ Cleanup

5. Zipher starts daemon
6. Daemon rebuilds index (10-30 minutes)
7. User can use wallet while index rebuilds
```

## Performance Metrics

### Bootstrap Creation
- **Time**: 15-25 minutes
- **Compression**: zstd level 19
- **Size Reduction**: ~70% (from ~24 GB to ~7.7 GB)

### Upload (Parallel)
- **Time**: 5m 4s
- **Speed**: 26.08 MB/s average
- **Files**: 8 files (5 parts + 3 metadata files)
- **Total Size**: 7.74 GB

### Download (Parallel)
- **Time**: 3m 0s
- **Speed**: 44.05 MB/s average
- **Files**: 6 files (5 parts + checksums)

### Total User Experience
- **Download**: 3m 0s
- **Verify**: 28s
- **Combine**: 8s
- **Extract**: ~5-10 minutes
- **Index Rebuild**: 10-30 minutes
- **TOTAL**: ~20-45 minutes vs. days of syncing

## Safety Features

### 1. Daemon Running Check
Prevents conflicts during bootstrap installation.

### 2. Height Comparison
```javascript
if (bootstrapHeight < localHeight) {
  throw new Error('Bootstrap is older than local blockchain - would downgrade');
}
```

### 3. Checksum Verification
All files verified with SHA256 before extraction.

### 4. Backup Warning
User must confirm they have:
- ✅ Backed up wallet.dat
- ✅ Stopped the daemon
- ✅ Confirmed they want to replace blockchain data

### 5. Atomic Installation
- Downloads to temporary directory
- Only moves to data directory after verification
- Cleanup on error

## Metadata Structure

### metadata.json
```json
{
  "version": "1.0",
  "created_at": "2025-11-18T10:54:17Z",
  "created_timestamp": 1700308457,
  "blockchain": {
    "height": 830123,
    "best_block_hash": "0000...abc",
    "block_time": 1700000000,
    "block_time_human": "2025-11-18 10:54:17",
    "chain": "main",
    "difficulty": 12345.67,
    "block_count": 830
  },
  "files": {
    "blocks_size": "18.5 GB",
    "chainstate_size": "5.3 GB",
    "blocks_size_bytes": 19864125440,
    "chainstate_size_bytes": 5690552320
  },
  "compression": {
    "algorithm": "zstd",
    "level": 19
  },
  "installation": {
    "platforms": ["macOS", "Linux", "Windows"],
    "index_rebuild_time_estimate": "10-30 minutes",
    "requires_daemon_stop": true
  }
}
```

## Troubleshooting

### Bootstrap Creation Fails

**Problem**: "No blockchain data found"
```bash
# Solution: Ensure daemon has synced blockchain data
ls -lh ~/Library/Application\ Support/Zclassic/blocks/
```

**Problem**: "Daemon is running"
```bash
# Solution: Stop Zipher app, wait 10 seconds
```

### Upload Fails

**Problem**: "Not authenticated"
```bash
# Solution: Login to GitHub CLI
gh auth login
gh auth refresh -h github.com -s workflow
```

**Problem**: "File too large"
```bash
# Solution: Ensure split size is under 2GB
# Check in create-production-bootstrap.sh:
SPLIT_SIZE="1900M"  # Just under 2GB limit
```

### Download Fails

**Problem**: "Checksum mismatch"
```bash
# Solution: Re-download the corrupted file
gh release download TAG --repo VictorLux/Zipher --pattern "FILE.part" --clobber
```

**Problem**: "Not enough disk space"
```bash
# Solution: Free up at least 20 GB before installing
df -h ~/Library/Application\ Support/Zclassic
```

### Installation Fails

**Problem**: "Bootstrap is older than local blockchain"
```bash
# Solution: Don't install - local blockchain is already newer
# Continue syncing normally
```

**Problem**: "Daemon is running"
```bash
# Solution: Stop Zipher app, wait for daemon to shut down
ps aux | grep zclassicd
```

## File Locations

### macOS
- **Data Directory**: `~/Library/Application Support/Zclassic`
- **Bootstrap Output**: `~/Downloads/zipher-bootstrap`
- **Temp Directory**: `/tmp/zipher-bootstrap`

### Linux
- **Data Directory**: `~/.zclassic`
- **Bootstrap Output**: `~/Downloads/zipher-bootstrap`
- **Temp Directory**: `/tmp/zipher-bootstrap`

### Windows
- **Data Directory**: `%APPDATA%\Zclassic`
- **Bootstrap Output**: `%USERPROFILE%\Downloads\zipher-bootstrap`
- **Temp Directory**: `%TEMP%\zipher-bootstrap`

## Update Checklist

When creating a new bootstrap:

- [ ] Stop Zipher app
- [ ] Run `create-production-bootstrap.sh`
- [ ] Note block height, hash, and timestamp
- [ ] Run `github-release-upload-production.sh`
- [ ] Note GitHub release tag and URL
- [ ] Update `app/constants/bootstrap.js`:
  - [ ] TAG
  - [ ] BLOCK_HEIGHT
  - [ ] BEST_BLOCK_HASH
  - [ ] BLOCK_TIME
  - [ ] BLOCK_TIME_HUMAN
  - [ ] TOTAL_SIZE_GB
- [ ] Test download with generated script
- [ ] Test installation (on test machine or VM)
- [ ] Rebuild Zipher app
- [ ] Announce new bootstrap on GitHub/Discord

## Best Practices

1. **Create bootstraps monthly** or after major blockchain growth
2. **Test downloads** before announcing
3. **Keep old releases** for at least 1 month
4. **Monitor disk space** on bootstrap creation machine
5. **Verify checksums** before uploading
6. **Update documentation** with each release
7. **Announce clearly** in release notes what's included

## Future Enhancements

- [ ] Automated bootstrap creation (cron job)
- [ ] Torrent distribution option
- [ ] CDN caching for faster downloads
- [ ] Incremental updates (download only new blocks)
- [ ] Bootstrap verification service
- [ ] Progress notifications in Zipher UI
- [ ] Bandwidth throttling option
- [ ] Resume interrupted downloads

## Support

- **Issues**: https://github.com/VictorLux/Zipher/issues
- **Releases**: https://github.com/VictorLux/Zipher/releases
- **Documentation**: This file

---

Last Updated: 2025-11-18
Version: 1.0
