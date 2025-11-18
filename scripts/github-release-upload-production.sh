#!/bin/bash

# GitHub Release Upload - Production Bootstrap
# Uploads bootstrap with metadata to GitHub Releases

set -e

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
log_time() { echo -e "${CYAN}⏱️  $1${NC}"; }

get_timestamp() { date +%s; }

format_duration() {
    local seconds=$1
    local minutes=$((seconds / 60))
    local remaining_seconds=$((seconds % 60))
    if [ $minutes -gt 0 ]; then
        echo "${minutes}m ${remaining_seconds}s"
    else
        echo "${seconds}s"
    fi
}

# Configuration
BOOTSTRAP_DIR="$HOME/Downloads/zipher-bootstrap"
REPO="VictorLux/Zipher"

# Find latest bootstrap
cd "$BOOTSTRAP_DIR"
LATEST_BOOTSTRAP=$(ls -t zclassic-bootstrap-*-part-01.part 2>/dev/null | head -1)

if [ -z "$LATEST_BOOTSTRAP" ]; then
    log_error "No bootstrap parts found in $BOOTSTRAP_DIR"
    exit 1
fi

# Extract base name (without -part-01.part)
BOOTSTRAP_BASE=$(echo "$LATEST_BOOTSTRAP" | sed 's/-part-01\.part$//')
TAG="bootstrap-$(echo $BOOTSTRAP_BASE | sed 's/zclassic-bootstrap-//')"

# Find all part files
PART_FILES=($BOOTSTRAP_BASE-part-*.part)
TOTAL_PARTS=${#PART_FILES[@]}

echo ""
log_step "========================================="
log_step "GitHub Production Bootstrap Upload"
log_step "========================================="
echo ""
log_info "Bootstrap: $BOOTSTRAP_BASE"
log_info "Total parts: $TOTAL_PARTS"
log_info "Repository: $REPO"
log_info "Tag: $TAG"
log_warning "Release type: PUBLIC (production)"
echo ""

# Files to upload
FILES=(
    "${PART_FILES[@]}"
    "bootstrap-checksums.txt"
    "download-and-combine.sh"
    "BOOTSTRAP_README.md"
)

TOTAL_START=$(get_timestamp)

# Step 1: Check authentication
log_step "Step 1: Checking GitHub CLI authentication"
STEP_START=$(get_timestamp)

if ! gh auth status &> /dev/null; then
    log_error "Not authenticated with GitHub CLI"
    exit 1
fi

STEP_END=$(get_timestamp)
STEP_DURATION=$((STEP_END - STEP_START))
log_success "Authenticated with GitHub"
log_time "Duration: $(format_duration $STEP_DURATION)"
echo ""

# Step 2: Verify files exist
log_step "Step 2: Verifying bootstrap files"
STEP_START=$(get_timestamp)

TOTAL_SIZE=0
for file in "${FILES[@]}"; do
    if [ ! -f "$file" ]; then
        log_error "File not found: $file"
        exit 1
    fi
    FILE_SIZE=$(stat -f%z "$file" 2>/dev/null || stat -c%s "$file" 2>/dev/null)
    TOTAL_SIZE=$((TOTAL_SIZE + FILE_SIZE))
    FILE_SIZE_MB=$(echo "scale=2; $FILE_SIZE / 1024 / 1024" | bc)
    log_success "Found: $file (${FILE_SIZE_MB} MB)"
done

TOTAL_SIZE_GB=$(echo "scale=2; $TOTAL_SIZE / 1024 / 1024 / 1024" | bc)
STEP_END=$(get_timestamp)
STEP_DURATION=$((STEP_END - STEP_START))
log_info "Total size to upload: ${TOTAL_SIZE_GB} GB"
log_time "Duration: $(format_duration $STEP_DURATION)"
echo ""

# Step 3: Read metadata if available
log_step "Step 3: Reading bootstrap metadata"
METADATA_FILE="${BOOTSTRAP_BASE}.tar.zst"

# Extract metadata from archive if it exists
if [ -f "$METADATA_FILE" ]; then
    BLOCK_HEIGHT=$(tar -xOf "$METADATA_FILE" metadata.json 2>/dev/null | grep -o '"height": [0-9]*' | grep -o '[0-9]*' || echo "Unknown")
    BLOCK_HASH=$(tar -xOf "$METADATA_FILE" metadata.json 2>/dev/null | grep -o '"best_block_hash": "[^"]*"' | cut -d'"' -f4 || echo "Unknown")
    BLOCK_TIME=$(tar -xOf "$METADATA_FILE" metadata.json 2>/dev/null | grep -o '"block_time_human": "[^"]*"' | cut -d'"' -f4 || echo "Unknown")
else
    BLOCK_HEIGHT="Unknown"
    BLOCK_HASH="Unknown"
    BLOCK_TIME="Unknown"
fi

log_info "Block Height: $BLOCK_HEIGHT"
log_info "Block Hash: $BLOCK_HASH"
log_info "Block Time: $BLOCK_TIME"
echo ""

# Step 4: Create public release
log_step "Step 4: Creating PUBLIC release"
STEP_START=$(get_timestamp)

RELEASE_NOTES="# Zclassic Bootstrap - Height $BLOCK_HEIGHT

## Fast-Sync Your Zclassic Node

This bootstrap allows you to quickly sync your Zclassic node by downloading pre-verified blockchain data.

## Bootstrap Information

- **Block Height**: $BLOCK_HEIGHT
- **Block Hash**: \`$BLOCK_HASH\`
- **Block Time**: $BLOCK_TIME
- **Created**: $(date +"%Y-%m-%d")
- **Total Size**: ${TOTAL_SIZE_GB} GB (compressed with zstd level 19)
- **Parts**: $TOTAL_PARTS files

## Installation

### Automatic (Recommended)

The **Zipher wallet** automatically downloads and installs this bootstrap when:
- No blockchain data exists
- Blockchain data is too old to sync efficiently

Simply launch Zipher and it will handle everything!

### Manual Download

#### Option 1: Using GitHub CLI
\`\`\`bash
# Download the helper script
gh release download $TAG --repo $REPO --pattern \"download-and-combine.sh\"

# Run it to download all parts and combine them
chmod +x download-and-combine.sh
./download-and-combine.sh
\`\`\`

#### Option 2: Manual Download
1. Download all \`zclassic-bootstrap-part-*.part\` files
2. Download \`bootstrap-checksums.txt\`
3. Verify checksums: \`shasum -a 256 -c bootstrap-checksums.txt\`
4. Combine parts: \`cat zclassic-bootstrap-part-*.part > zclassic-bootstrap.tar.zst\`

## What's Included

- ✅ Complete blockchain data up to height $BLOCK_HEIGHT
- ✅ **Block index** (wallet ready immediately - no rebuild wait!)
- ✅ UTXO set (chainstate)
- ✅ SHA256 checksums for verification
- ✅ Detailed README with installation instructions
- ✅ Metadata file with blockchain info

## What's NOT Included

- ❌ Wallet data (for security reasons)
- ❌ Peer connections

## Compression

- **Algorithm**: zstd (Zstandard)
- **Level**: 19 (maximum compression)
- **Benefits**: 30% smaller than gzip, 3x faster decompression

## File Integrity

All files include SHA256 checksums. Verify with:
\`\`\`bash
shasum -a 256 -c bootstrap-checksums.txt
\`\`\`

## Need Help?

- 📚 See \`BOOTSTRAP_README.md\` for detailed instructions
- 🐛 Report issues: https://github.com/VictorLux/Zipher/issues
- 💬 Discord: [Coming soon]

## Credits

Created with ❤️ by the Zipher team using the official Zclassic daemon.
"

log_info "Creating release: Bootstrap - Height $BLOCK_HEIGHT"
log_info "Tag: $TAG"

gh release create "$TAG" \
    --repo "$REPO" \
    --title "Bootstrap - Block $BLOCK_HEIGHT" \
    --notes "$RELEASE_NOTES" \
    --latest

if [ $? -eq 0 ]; then
    STEP_END=$(get_timestamp)
    STEP_DURATION=$((STEP_END - STEP_START))
    log_success "Release created successfully"
    log_time "Duration: $(format_duration $STEP_DURATION)"
else
    log_error "Failed to create release"
    exit 1
fi
echo ""

# Step 5: Upload files IN PARALLEL
log_step "Step 5: Uploading ALL files in PARALLEL"
log_warning "Starting ${#FILES[@]} simultaneous uploads..."
UPLOAD_START=$(get_timestamp)

# Create temp directory for tracking
TEMP_DIR=$(mktemp -d)

# Start all uploads in parallel
PIDS=()
for file in "${FILES[@]}"; do
    FILE_SIZE=$(stat -f%z "$file" 2>/dev/null || stat -c%s "$file" 2>/dev/null)
    FILE_SIZE_MB=$(echo "scale=2; $FILE_SIZE / 1024 / 1024" | bc)

    log_info "🚀 Started: $file (${FILE_SIZE_MB} MB) in background"

    # Upload in background and track timing
    (
        START=$(date +%s)
        gh release upload "$TAG" "$file" --repo "$REPO" --clobber 2>&1
        END=$(date +%s)
        DURATION=$((END - START))
        echo "$file|$DURATION|$FILE_SIZE" > "$TEMP_DIR/${file}.result"
    ) &

    PIDS+=($!)
done

echo ""
log_info "All ${#FILES[@]} uploads started in parallel"
log_info "Waiting for all uploads to complete..."
echo ""

# Wait for all background processes
FAILED=0
for pid in "${PIDS[@]}"; do
    if ! wait $pid; then
        FAILED=$((FAILED + 1))
    fi
done

UPLOAD_END=$(get_timestamp)
UPLOAD_DURATION=$((UPLOAD_END - UPLOAD_START))

echo ""
if [ $FAILED -eq 0 ]; then
    log_success "All ${#FILES[@]} files uploaded successfully in parallel!"
else
    log_error "$FAILED uploads failed"
    exit 1
fi

log_time "Total parallel upload time: $(format_duration $UPLOAD_DURATION)"
echo ""

# Show individual file times
log_step "Individual File Upload Times:"
echo ""
for result_file in "$TEMP_DIR"/*.result; do
    if [ -f "$result_file" ]; then
        IFS='|' read -r filename duration size < "$result_file"
        SIZE_MB=$(echo "scale=2; $size / 1024 / 1024" | bc)
        if [ "$duration" -gt 0 ]; then
            SPEED=$(echo "scale=2; $SIZE_MB / $duration" | bc)
            log_success "$filename: $(format_duration $duration) @ ${SPEED} MB/s"
        else
            log_success "$filename: < 1s"
        fi
    fi
done

# Cleanup temp dir
rm -rf "$TEMP_DIR"

# Calculate average speed
TOTAL_SIZE_MB=$(echo "scale=2; $TOTAL_SIZE / 1024 / 1024" | bc)
AVG_SPEED=$(echo "scale=2; $TOTAL_SIZE_MB / $UPLOAD_DURATION" | bc)
echo ""
log_info "Average upload speed: ${AVG_SPEED} MB/s"
echo ""

# Step 6: Get release URL
log_step "Step 6: Getting release information"
STEP_START=$(get_timestamp)

RELEASE_URL=$(gh release view "$TAG" --repo "$REPO" --json url --jq .url)

STEP_END=$(get_timestamp)
STEP_DURATION=$((STEP_END - STEP_START))
log_success "Release URL: $RELEASE_URL"
log_time "Duration: $(format_duration $STEP_DURATION)"
echo ""

# Step 7: Verify uploaded files
log_step "Step 7: Verifying uploaded files"
STEP_START=$(get_timestamp)

gh release view "$TAG" --repo "$REPO" --json assets --jq '.assets[] | "\(.name) (\(.size / 1024 / 1024 | floor)MB)"' | while read line; do
    log_success "Verified: $line"
done

STEP_END=$(get_timestamp)
STEP_DURATION=$((STEP_END - STEP_START))
log_time "Duration: $(format_duration $STEP_DURATION)"
echo ""

# Step 8: Update download script with actual tag
log_step "Step 8: Creating updated download script"
cat > "$BOOTSTRAP_DIR/download-and-combine-$TAG.sh" << DLSCRIPT
#!/bin/bash
# Zclassic Bootstrap - Download and Combine Script
# Automatically generated for tag: $TAG

set -e

REPO="$REPO"
TAG="$TAG"
DOWNLOAD_DIR="\$HOME/Downloads/zclassic-bootstrap"

echo "╔════════════════════════════════════════════════╗"
echo "║  Zclassic Bootstrap Downloader                 ║"
echo "╚════════════════════════════════════════════════╝"
echo ""
echo "Block Height: $BLOCK_HEIGHT"
echo "Total Size: ${TOTAL_SIZE_GB} GB"
echo "Download Dir: \$DOWNLOAD_DIR"
echo ""

mkdir -p "\$DOWNLOAD_DIR"
cd "\$DOWNLOAD_DIR"

# Download all parts in parallel
echo "📥 Downloading $TOTAL_PARTS parts in parallel..."
gh release download "\$TAG" --repo "\$REPO" --pattern "zclassic-bootstrap-part-*.part" &
DOWNLOAD_PID=\$!

# Download metadata files
gh release download "\$TAG" --repo "\$REPO" --pattern "bootstrap-checksums.txt"
gh release download "\$TAG" --repo "\$REPO" --pattern "BOOTSTRAP_README.md"

# Wait for part downloads
wait \$DOWNLOAD_PID

echo ""
echo "✅ All files downloaded"
echo ""

# Verify checksums
echo "🔐 Verifying checksums..."
if shasum -a 256 -c bootstrap-checksums.txt; then
    echo "✅ All checksums verified!"
else
    echo "❌ Checksum verification failed!"
    exit 1
fi
echo ""

# Combine parts
echo "📦 Combining parts..."
cat zclassic-bootstrap-part-*.part > zclassic-bootstrap.tar.zst

COMBINED_SIZE=\$(du -sh zclassic-bootstrap.tar.zst | cut -f1)
echo "✅ Combined archive created: zclassic-bootstrap.tar.zst (\$COMBINED_SIZE)"
echo ""

echo "╔════════════════════════════════════════════════╗"
echo "║  Download Complete!                            ║"
echo "╚════════════════════════════════════════════════╝"
echo ""
echo "Archive: \$DOWNLOAD_DIR/zclassic-bootstrap.tar.zst"
echo ""
echo "To install, see BOOTSTRAP_README.md"
DLSCRIPT

chmod +x "$BOOTSTRAP_DIR/download-and-combine-$TAG.sh"
log_success "Created: download-and-combine-$TAG.sh"
echo ""

# Final summary
TOTAL_END=$(get_timestamp)
TOTAL_DURATION=$((TOTAL_END - TOTAL_START))

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
log_success "PRODUCTION UPLOAD COMPLETE!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
log_info "Performance Summary:"
echo "  • Total files uploaded: ${#FILES[@]}"
echo "  • Total size: ${TOTAL_SIZE_GB} GB"
echo "  • Total time: $(format_duration $TOTAL_DURATION)"
echo "  • Upload time: $(format_duration $UPLOAD_DURATION)"
echo "  • Average speed: ${AVG_SPEED} MB/s"
echo ""
log_info "Bootstrap Details:"
echo "  • Block Height: $BLOCK_HEIGHT"
echo "  • Block Hash: $BLOCK_HASH"
echo "  • Block Time: $BLOCK_TIME"
echo ""
log_info "Release Details:"
echo "  • Repository: $REPO"
echo "  • Tag: $TAG"
echo "  • Status: PUBLIC (latest)"
echo "  • URL: $RELEASE_URL"
echo ""
log_warning "📋 Next Steps:"
echo ""
echo "1. Test download:"
echo "   ./download-and-combine-$TAG.sh"
echo ""
echo "2. Update Zipher app bootstrap metadata:"
echo "   - Edit: app/constants/bootstrap.js"
echo "   - Set TAG: $TAG"
echo "   - Set HEIGHT: $BLOCK_HEIGHT"
echo "   - Set HASH: $BLOCK_HASH"
echo ""
echo "3. Announce the new bootstrap:"
echo "   - GitHub Releases: $RELEASE_URL"
echo "   - Discord/Social media"
echo ""
log_step "========================================="
