#!/bin/bash

# Zipher Production Bootstrap Creator (Simple Version)
# Works with already-running daemon - no daemon start/stop
# For GitHub Releases deployment

set -e

# Global temp directory variable for cleanup
TEMP_DIR=""

# Cleanup function - removes temp directory on exit
cleanup() {
    if [ -n "$TEMP_DIR" ] && [ -d "$TEMP_DIR" ]; then
        log_info "Cleaning up temporary directory: $TEMP_DIR"
        rm -rf "$TEMP_DIR"
    fi
}

# Set trap to cleanup on exit (success or failure)
trap cleanup EXIT INT TERM

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m'

log_info() { echo -e "${BLUE}ℹ️  $1${NC}"; }
log_success() { echo -e "${GREEN}✅ $1${NC}"; }
log_warning() { echo -e "${YELLOW}⚠️  $1${NC}"; }
log_error() { echo -e "${RED}❌ $1${NC}"; }
log_step() { echo -e "${PURPLE}📦 $1${NC}"; }

# Configuration
ZCLASSIC_DIR="$HOME/Library/Application Support/Zclassic"
OUTPUT_DIR="$HOME/Downloads/zipher-bootstrap"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BOOTSTRAP_NAME="zclassic-bootstrap-${TIMESTAMP}"
ZSTD_LEVEL=19  # Maximum compression
SPLIT_SIZE="1900M"  # Just under GitHub's 2GB limit

# Paths
CLI_PATH="$HOME/Zclassic/Zipher/bin/mac/zclassic-cli"

echo ""
log_step "========================================="
log_step "Zipher Production Bootstrap Creator"
log_step "========================================="
echo ""
log_warning "This version works with an already-running daemon"
log_warning "Do NOT stop Zipher/daemon before running this script"
echo ""

# Step 1: Check daemon is running
log_step "Step 1: Checking daemon status"
if ! $CLI_PATH getblockchaininfo >/dev/null 2>&1; then
    log_error "Daemon is not responding to RPC commands"
    echo ""
    echo "Please ensure:"
    echo "  1. Zipher app is running OR"
    echo "  2. zclassicd daemon is running"
    echo ""
    echo "Then run this script again"
    exit 1
fi
log_success "Daemon is running and responding"
echo ""

# Step 2: Verify blockchain data exists
log_step "Step 2: Verifying blockchain data"
if [ ! -d "$ZCLASSIC_DIR/blocks" ]; then
    log_error "No blockchain data found at $ZCLASSIC_DIR/blocks"
    exit 1
fi
log_success "Blockchain data found"
echo ""

# Step 3: Extract blockchain metadata from running daemon
log_step "Step 3: Extracting blockchain metadata from daemon"
log_info "Getting blockchain info..."
BLOCKCHAIN_INFO=$($CLI_PATH getblockchaininfo 2>/dev/null)

if [ -z "$BLOCKCHAIN_INFO" ]; then
    log_error "Failed to get blockchain info from daemon"
    exit 1
fi

# Parse blockchain info
BLOCK_HEIGHT=$(echo "$BLOCKCHAIN_INFO" | grep -o '"blocks": [0-9]*' | grep -o '[0-9]*')
BEST_BLOCK_HASH=$(echo "$BLOCKCHAIN_INFO" | grep -o '"bestblockhash": "[^"]*"' | cut -d'"' -f4)
CHAIN=$(echo "$BLOCKCHAIN_INFO" | grep -o '"chain": "[^"]*"' | cut -d'"' -f4)
DIFFICULTY=$(echo "$BLOCKCHAIN_INFO" | grep -o '"difficulty": [0-9.]*' | grep -o '[0-9.]*')

# Get best block details
BEST_BLOCK=$($CLI_PATH getblock "$BEST_BLOCK_HASH" 2>/dev/null)
BLOCK_TIME=$(echo "$BEST_BLOCK" | grep -o '"time": [0-9]*' | grep -o '[0-9]*')
BLOCK_TIME_HUMAN=$(date -r $BLOCK_TIME "+%Y-%m-%d %H:%M:%S" 2>/dev/null || date -d "@$BLOCK_TIME" "+%Y-%m-%d %H:%M:%S" 2>/dev/null || echo "Unknown")

log_success "Metadata extracted:"
log_info "  • Block Height: $BLOCK_HEIGHT"
log_info "  • Block Hash: $BEST_BLOCK_HASH"
log_info "  • Block Time: $BLOCK_TIME_HUMAN"
log_info "  • Chain: $CHAIN"
log_info "  • Difficulty: $DIFFICULTY"
echo ""

# Step 4: Calculate blockchain data size
log_step "Step 4: Analyzing blockchain data"
BLOCK_COUNT=$(find "$ZCLASSIC_DIR/blocks" -name "blk*.dat" | wc -l | tr -d ' ')
BLOCKS_SIZE=$(du -sh "$ZCLASSIC_DIR/blocks" | cut -f1)
CHAINSTATE_SIZE=$(du -sh "$ZCLASSIC_DIR/chainstate" 2>/dev/null | cut -f1 || echo "N/A")
BLOCKS_SIZE_BYTES=$(du -s "$ZCLASSIC_DIR/blocks" | cut -f1)
CHAINSTATE_SIZE_BYTES=$(du -s "$ZCLASSIC_DIR/chainstate" 2>/dev/null | cut -f1 || echo "0")

log_info "  • Block files: $BLOCK_COUNT"
log_info "  • Blocks size: $BLOCKS_SIZE"
log_info "  • Chainstate size: $CHAINSTATE_SIZE"
echo ""

log_warning "IMPORTANT: The daemon will continue running during bootstrap creation"
log_warning "You can continue using Zipher while this script runs"
echo ""
read -p "Press ENTER to continue or Ctrl+C to cancel..."
echo ""

# Step 5: Create temporary directory and copy data
log_step "Step 5: Creating clean bootstrap structure"
TEMP_DIR=$(mktemp -d)
log_info "Temporary directory: $TEMP_DIR"

log_info "Copying blocks (excluding index)..."
mkdir -p "$TEMP_DIR/blocks"
rsync -a --exclude='index/' --exclude='*.lock' "$ZCLASSIC_DIR/blocks/" "$TEMP_DIR/blocks/" --info=progress2
log_success "Blocks copied"

log_info "Copying chainstate..."
if [ -d "$ZCLASSIC_DIR/chainstate" ]; then
    mkdir -p "$TEMP_DIR/chainstate"
    rsync -a --exclude='*.lock' "$ZCLASSIC_DIR/chainstate/" "$TEMP_DIR/chainstate/" --info=progress2
    log_success "Chainstate copied"
else
    log_warning "No chainstate found (will be rebuilt by daemon)"
fi
echo ""

# Step 6: Create metadata.json
log_step "Step 6: Creating metadata.json"
mkdir -p "$OUTPUT_DIR"
cat > "$TEMP_DIR/metadata.json" << EOF
{
  "version": "1.0",
  "created_at": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
  "created_timestamp": $(date +%s),
  "blockchain": {
    "height": $BLOCK_HEIGHT,
    "best_block_hash": "$BEST_BLOCK_HASH",
    "block_time": $BLOCK_TIME,
    "block_time_human": "$BLOCK_TIME_HUMAN",
    "chain": "$CHAIN",
    "difficulty": $DIFFICULTY,
    "block_count": $BLOCK_COUNT
  },
  "files": {
    "blocks_size": "$BLOCKS_SIZE",
    "chainstate_size": "$CHAINSTATE_SIZE",
    "blocks_size_bytes": $BLOCKS_SIZE_BYTES,
    "chainstate_size_bytes": $CHAINSTATE_SIZE_BYTES
  },
  "compression": {
    "algorithm": "zstd",
    "level": $ZSTD_LEVEL
  },
  "installation": {
    "platforms": ["macOS", "Linux", "Windows"],
    "index_rebuild_time_estimate": "10-30 minutes",
    "requires_daemon_stop": true
  }
}
EOF

log_success "metadata.json created"
echo ""

# Step 7: Create README
log_step "Step 7: Creating README.md"
cat > "$TEMP_DIR/README.md" << EOF
# Zclassic Bootstrap - Height $BLOCK_HEIGHT

Fast-sync your Zclassic node with pre-downloaded blockchain data.

## Bootstrap Information

- **Block Height**: $BLOCK_HEIGHT
- **Block Hash**: \`$BEST_BLOCK_HASH\`
- **Block Time**: $BLOCK_TIME_HUMAN
- **Created**: $(date +"%Y-%m-%d")
- **Compression**: zstd level $ZSTD_LEVEL
- **Total Size**: ~$BLOCKS_SIZE (compressed)

## What's Included

- **blocks/blk*.dat** - Raw block data ($BLOCK_COUNT files)
- **blocks/rev*.dat** - Undo data for reorganizations
- **chainstate/** - UTXO set database
- **metadata.json** - Complete bootstrap metadata

## Installation

See BOOTSTRAP_README.md for complete installation instructions.

## Source

Created by Zipher automated bootstrap builder
Repository: https://github.com/VictorLux/Zipher
EOF

log_success "README.md created"
echo ""

# Step 8: Create archive with zstd compression
log_step "Step 8: Creating compressed archive (zstd level $ZSTD_LEVEL)"
log_warning "This may take 10-20 minutes for maximum compression..."
cd "$TEMP_DIR"

tar -cf - blocks/ chainstate/ metadata.json README.md | zstd -${ZSTD_LEVEL} -T0 -o "$OUTPUT_DIR/${BOOTSTRAP_NAME}.tar.zst"

ARCHIVE_SIZE=$(du -sh "$OUTPUT_DIR/${BOOTSTRAP_NAME}.tar.zst" | cut -f1)
ARCHIVE_SIZE_BYTES=$(stat -f%z "$OUTPUT_DIR/${BOOTSTRAP_NAME}.tar.zst" 2>/dev/null || stat -c%s "$OUTPUT_DIR/${BOOTSTRAP_NAME}.tar.zst" 2>/dev/null)
log_success "Archive created: $ARCHIVE_SIZE"
echo ""

# Step 9: Split archive for GitHub (2GB limit)
log_step "Step 9: Splitting archive for GitHub upload"
cd "$OUTPUT_DIR"

split -b $SPLIT_SIZE "${BOOTSTRAP_NAME}.tar.zst" "${BOOTSTRAP_NAME}-part-"

# Rename parts with .part extension
PART_NUM=1
for part in ${BOOTSTRAP_NAME}-part-*; do
    PADDED_NUM=$(printf "%02d" $PART_NUM)
    mv "$part" "${BOOTSTRAP_NAME}-part-${PADDED_NUM}.part"
    PART_SIZE=$(du -sh "${BOOTSTRAP_NAME}-part-${PADDED_NUM}.part" | cut -f1)
    log_success "Part $PADDED_NUM: $PART_SIZE"
    PART_NUM=$((PART_NUM + 1))
done

TOTAL_PARTS=$((PART_NUM - 1))
echo ""

# Step 10: Create checksums
log_step "Step 10: Calculating SHA256 checksums"
shasum -a 256 ${BOOTSTRAP_NAME}-part-*.part > bootstrap-checksums.txt
log_success "Checksums created"
echo ""

# Step 11: Create download script
log_step "Step 11: Creating download-and-combine.sh"
cat > "$OUTPUT_DIR/download-and-combine.sh" << 'DLSCRIPT'
#!/bin/bash
set -e
REPO="VictorLux/Zipher"
TAG="RELEASE_TAG_PLACEHOLDER"
DOWNLOAD_DIR="$HOME/Downloads/zclassic-bootstrap"
mkdir -p "$DOWNLOAD_DIR" && cd "$DOWNLOAD_DIR"
gh release download "$TAG" --repo "$REPO" --pattern "zclassic-bootstrap-part-*.part"
gh release download "$TAG" --repo "$REPO" --pattern "bootstrap-checksums.txt"
shasum -a 256 -c bootstrap-checksums.txt
cat zclassic-bootstrap-part-*.part > zclassic-bootstrap.tar.zst
echo "✅ Download complete: $DOWNLOAD_DIR/zclassic-bootstrap.tar.zst"
DLSCRIPT
chmod +x "$OUTPUT_DIR/download-and-combine.sh"
log_success "Download script created"
echo ""

# Step 12: Create BOOTSTRAP_README.md
log_step "Step 12: Creating BOOTSTRAP_README.md"
cat > "$OUTPUT_DIR/BOOTSTRAP_README.md" << EOF
# Zclassic Bootstrap Files

- **Block Height**: $BLOCK_HEIGHT
- **Block Hash**: \`$BEST_BLOCK_HASH\`
- **Date**: $(date +"%Y-%m-%d")
- **Size**: $ARCHIVE_SIZE
- **Parts**: $TOTAL_PARTS files

See README.md inside archive for installation instructions.

## Files
$(ls -lh ${BOOTSTRAP_NAME}-part-*.part | awk '{print "- " $9 " (" $5 ")"}')

## Checksums
\`\`\`
$(cat bootstrap-checksums.txt)
\`\`\`
EOF
log_success "BOOTSTRAP_README.md created"
echo ""

# Cleanup will be handled automatically by the EXIT trap
echo ""

# Summary
log_step "========================================="
log_success "BOOTSTRAP CREATED SUCCESSFULLY!"
log_step "========================================="
echo ""
log_info "📁 Output: $OUTPUT_DIR"
log_info "📦 Archive: ${BOOTSTRAP_NAME}.tar.zst ($ARCHIVE_SIZE)"
log_info "🔢 Parts: $TOTAL_PARTS"
log_info "📊 Height: $BLOCK_HEIGHT"
log_info "🔐 Hash: $BEST_BLOCK_HASH"
echo ""
log_warning "Next: ./scripts/github-release-upload-production.sh"
log_step "========================================="
