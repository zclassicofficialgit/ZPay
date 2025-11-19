# Bundled zstd Binaries

This directory contains platform-specific zstd binaries bundled with Zipher for bootstrap extraction.

## Directory Structure

```
bin/zstd/
├── mac/zstd         # macOS binary (both Intel and Apple Silicon)
├── linux/zstd       # Linux x64 binary
└── win/zstd.exe     # Windows binary
```

## Why Bundle zstd?

The bootstrap installer needs to decompress large (>2GB) `.tar.zst` archives. JavaScript-based zstd libraries have buffer size limitations, so we use the native zstd command-line tool for efficient streaming decompression.

## Bundled Binaries

All three platform binaries are already included in this repository:

- **macOS** (bin/zstd/mac/zstd): v1.5.6 built from source, 862KB
  - Only depends on system libraries (libSystem.B.dylib)
  - Built with: `make HAVE_LZ4=0 HAVE_LZMA=0 HAVE_ZLIB=0 zstd`

- **Linux** (bin/zstd/linux/zstd): v1.5.5 from Alpine Linux, 162KB
  - Dynamically linked with musl (ld-musl-x86_64.so.1)
  - Downloaded from Alpine Linux package repository

- **Windows** (bin/zstd/win/zstd.exe): v1.5.6 from official releases, 1.5MB
  - Downloaded from https://github.com/facebook/zstd/releases/download/v1.5.6/zstd-v1.5.6-win64.zip

## Updating Binaries

If you need to update the binaries to a newer version:

### macOS
```bash
# Build from source
cd /tmp
curl -L https://github.com/facebook/zstd/releases/download/v1.5.6/zstd-1.5.6.tar.gz -o zstd.tar.gz
tar -xzf zstd.tar.gz && cd zstd-1.5.6
make HAVE_LZ4=0 HAVE_LZMA=0 HAVE_ZLIB=0 zstd
cp programs/zstd /path/to/Zipher/bin/zstd/mac/zstd
chmod +x /path/to/Zipher/bin/zstd/mac/zstd
```

### Linux (x64)
```bash
# Download from Alpine Linux repository
curl -L https://dl-cdn.alpinelinux.org/alpine/v3.19/main/x86_64/zstd-1.5.5-r8.apk -o /tmp/zstd.apk
cd /tmp && tar -xzf zstd.apk
cp usr/bin/zstd /path/to/Zipher/bin/zstd/linux/zstd
chmod +x /path/to/Zipher/bin/zstd/linux/zstd
```

### Windows
```bash
# Download from official GitHub releases
curl -L https://github.com/facebook/zstd/releases/download/v1.5.6/zstd-v1.5.6-win64.zip -o /tmp/zstd-win.zip
unzip /tmp/zstd-win.zip -d /tmp
cp /tmp/zstd-v1.5.6-win64/zstd.exe /path/to/Zipher/bin/zstd/win/zstd.exe
```

## Usage

The `services/bootstrap-installer.js` file automatically detects the platform and uses the appropriate bundled binary. If the bundled binary is not found, it falls back to the system-installed zstd command.

## Licensing

zstd is dual-licensed under BSD and GPLv2. See https://github.com/facebook/zstd for details.
