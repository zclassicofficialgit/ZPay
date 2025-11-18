#!/bin/bash

# Zipher Clean Bootstrap Creator
# This script creates a clean bootstrap without corrupted index files
# For upload to https://github.com/VictorLux/zclassic-bootstrap

set -e

ZCLASSIC_DIR="$HOME/Library/Application Support/Zclassic"
OUTPUT_DIR="$HOME"
BOOTSTRAP_NAME="zclassic-bootstrap-$(date +%Y%m%d).tar.gz"

echo "========================================="
echo "Zipher Clean Bootstrap Creator"
echo "========================================="
echo ""

# Check if zclassicd is running
if pgrep -x "zclassicd" > /dev/null; then
    echo "ERROR: zclassicd is currently running!"
    echo "Please stop the daemon before creating a bootstrap."
    echo ""
    echo "To stop:"
    echo "  1. Quit Zipher application"
    echo "  2. Wait 10 seconds for daemon to shut down"
    echo "  3. Run this script again"
    exit 1
fi

echo "✅ Daemon is not running"
echo ""

# Check if blockchain data exists
if [ ! -d "$ZCLASSIC_DIR/blocks" ]; then
    echo "ERROR: No blockchain data found at $ZCLASSIC_DIR/blocks"
    exit 1
fi

echo "📊 Blockchain Data:"
BLOCK_COUNT=$(find "$ZCLASSIC_DIR/blocks" -name "blk*.dat" | wc -l | tr -d ' ')
BLOCKS_SIZE=$(du -sh "$ZCLASSIC_DIR/blocks" | cut -f1)
CHAINSTATE_SIZE=$(du -sh "$ZCLASSIC_DIR/chainstate" 2>/dev/null | cut -f1 || echo "N/A")

echo "  - Block files: $BLOCK_COUNT"
echo "  - Blocks directory size: $BLOCKS_SIZE"
echo "  - Chainstate size: $CHAINSTATE_SIZE"
echo ""

# Create temporary directory
TEMP_DIR=$(mktemp -d)
echo "📁 Creating clean bootstrap structure in: $TEMP_DIR"
echo ""

# Copy blocks (excluding index)
echo "📦 Step 1/5: Copying block data (excluding corrupted index)..."
mkdir -p "$TEMP_DIR/blocks"
rsync -a --exclude='index/' --exclude='*.lock' "$ZCLASSIC_DIR/blocks/" "$TEMP_DIR/blocks/"
echo "  ✅ Block data copied"

# Copy chainstate
echo "📦 Step 2/5: Copying chainstate..."
if [ -d "$ZCLASSIC_DIR/chainstate" ]; then
    mkdir -p "$TEMP_DIR/chainstate"
    rsync -a --exclude='*.lock' "$ZCLASSIC_DIR/chainstate/" "$TEMP_DIR/chainstate/"
    echo "  ✅ Chainstate copied"
else
    echo "  ⚠️  No chainstate found (will be rebuilt by daemon)"
fi

# Create README
echo "📦 Step 3/5: Creating README..."
cat > "$TEMP_DIR/README.md" << 'EOF'
# Zclassic Bootstrap

This bootstrap contains pre-synced Zclassic blockchain data to speed up initial sync.

## What's Included

- `blocks/blk*.dat` - Raw block data
- `blocks/rev*.dat` - Undo data for block reorganizations
- `chainstate/` - UTXO set database

## What's NOT Included (Intentionally)

- `blocks/index/` - Block index (will be rebuilt automatically, takes 10-30 minutes)
- `peers.dat` - Peer connections
- `wallet.dat` - Wallet data
- `*.pid` files - Process ID files
- `.lock` files - Database lock files

## Installation

### macOS
```bash
# Stop zclassicd if running
# Extract to data directory
cd ~/Library/Application\ Support/Zclassic
tar -xzf zclassic-bootstrap-YYYYMMDD.tar.gz

# Start zclassicd - it will rebuild the index automatically
```

### Linux
```bash
# Stop zclassicd if running
# Extract to data directory
cd ~/.zclassic
tar -xzf zclassic-bootstrap-YYYYMMDD.tar.gz

# Start zclassicd - it will rebuild the index automatically
```

### Windows
```bash
# Stop zclassicd if running
# Extract to data directory
cd %APPDATA%\Zclassic
tar -xzf zclassic-bootstrap-YYYYMMDD.tar.gz

# Start zclassicd - it will rebuild the index automatically
```

## First Start After Bootstrap

When you start zclassicd for the first time after extracting the bootstrap:

1. The daemon will detect the missing index
2. It will scan all block files (10-30 minutes)
3. It will rebuild the block index database
4. Once complete, normal operation resumes

## Created

- Date: $(date +"%Y-%m-%d")
- Block height: ~$(ls -1 "$ZCLASSIC_DIR/blocks"/blk*.dat 2>/dev/null | wc -l | tr -d ' ')000
- Total size: $(du -sh "$TEMP_DIR" | cut -f1)

## Verification

After extraction, verify with:
```bash
# Check block files
ls -lh blocks/blk*.dat | head -5

# Check chainstate
ls -lh chainstate/

# Start daemon and check sync status
zclassicd -daemon
sleep 10
zclassic-cli getblockchaininfo
```

## Source

Created by Zipher automated bootstrap builder
Repository: https://github.com/VictorLux/zclassic-bootstrap
EOF
echo "  ✅ README created"

# Create checksum file
echo "📦 Step 4/5: Calculating checksums..."
cd "$TEMP_DIR"
find blocks chainstate -type f -exec shasum -a 256 {} \; > CHECKSUMS.txt
echo "  ✅ Checksums calculated"

# Create tarball
echo "📦 Step 5/5: Creating compressed archive..."
cd "$TEMP_DIR/.."
TEMP_DIR_NAME=$(basename "$TEMP_DIR")
tar -czf "$OUTPUT_DIR/$BOOTSTRAP_NAME" -C "$TEMP_DIR/.." "$TEMP_DIR_NAME"
echo "  ✅ Archive created"

# Calculate final file info
FINAL_SIZE=$(du -sh "$OUTPUT_DIR/$BOOTSTRAP_NAME" | cut -f1)
FINAL_SHA256=$(shasum -a 256 "$OUTPUT_DIR/$BOOTSTRAP_NAME" | cut -d' ' -f1)

# Cleanup
rm -rf "$TEMP_DIR"

echo ""
echo "========================================="
echo "✅ BOOTSTRAP CREATED SUCCESSFULLY!"
echo "========================================="
echo ""
echo "📁 Location: $OUTPUT_DIR/$BOOTSTRAP_NAME"
echo "📊 Size: $FINAL_SIZE"
echo "🔐 SHA256: $FINAL_SHA256"
echo ""
echo "🚀 Next Steps:"
echo ""
echo "1. Upload to GitHub:"
echo "   cd $(dirname $(find ~ -name 'zclassic-bootstrap' -type d 2>/dev/null | head -1))"
echo "   git add $BOOTSTRAP_NAME"
echo "   git commit -m 'Update bootstrap $(date +%Y-%m-%d)'"
echo "   git push"
echo ""
echo "2. Update archive.org link (if needed)"
echo ""
echo "3. Update Zipher bootstrap installer to use new SHA256:"
echo "   $FINAL_SHA256"
echo ""
echo "========================================="
