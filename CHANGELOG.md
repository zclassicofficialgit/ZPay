# Changelog

All notable changes to Zipher will be documented in this file.

## [1.0.0] - 2025-11-18

### Added

#### Blockchain Bootstrap Feature
- **Pre-Daemon Bootstrap Check**: Checks for blockchain data BEFORE starting daemon
- **Automatic Detection**: Detects missing or insufficient blockchain data on startup
  - Checks if data directory exists
  - Verifies blocks directory with minimum 10 block files
  - Parses `debug.log` to read latest block height and date
  - Detects if blockchain is > 30 days old (recommends bootstrap)
  - Detects if block height < 100 (recommends bootstrap)
- **User Choice Dialog**: Offers bootstrap download or network sync options
- **Macintosh-Style Progress Window**: Shows real-time progress with retro aesthetic
  - Step-by-step log with completed/running indicators (✓/▶)
  - Global elapsed time in title bar (updates every second)
  - Per-step duration tracking (e.g., "Downloaded 5/5 parts (2m 15s)")
  - All steps remain visible (not erased) with completion times
  - Black and white UI matching Zipher's classic Macintosh theme
- **Smart Installation**: Downloads 7.73 GB bootstrap from GitHub releases (split into 5 parts)
- **Parallel Download**: Faster download speeds with concurrent part downloads
  - HTTP redirect handling for GitHub CDN (follows 301, 302, 307, 308)
  - DNS pre-resolution to avoid timeout issues
  - 60-second timeout with proper error handling
  - Automatic retry on network failures
- **Fast Extraction**: Streaming decompression with bundled zstd binaries
  - Handles large files > 2GB (JavaScript zstd library has 2GB limit)
  - Bundled zstd binaries for macOS, Linux, and Windows (no installation required)
  - Automatic fallback to system zstd if bundled binary not available
  - Streaming extraction for efficient memory usage
  - Real-time progress tracking with file count updates
- **Integrity Verification**: SHA256 checksum verification for security
- **Automatic Extraction**: Extracts directly to Zclassic data directory
- **Wallet Backup**: Creates automatic wallet backup before installation
- **Daemon Coordination**: Daemon only starts AFTER bootstrap completes
- **Error Handling**: Comprehensive error handling and recovery with user feedback
- **Components**:
  - `config/daemon/pre-daemon-bootstrap.js` - Pre-daemon bootstrap checker with progress UI
  - `app/components/bootstrap-installer.js` - React UI component (fallback)
  - `services/bootstrap-installer.js` - Core bootstrap logic with JavaScript extraction
- **Location**: Bootstrap check in `config/daemon/zclassicd-child-process.js:102-112`

#### Daemon Configuration
- RPC credentials now written to `zclassic.conf` (standard Bitcoin/Zcash approach)
- Auto-generates random UUID credentials on first launch
- Credentials written to both `zclassic.conf` AND electron-store for compatibility
- Enabled transaction indexing (`txindex=1`) automatically written to `zclassic.conf`
- Removed `-server=1`, `-rpcuser`, `-rpcpassword`, `-txindex` from command-line args (now in config file)
- Allows manual daemon startup with same credentials from `zclassic.conf`
- Location: `config/daemon/zclassicd-child-process.js:204-231`

### Fixed

#### Production Build Issues
- Fixed main process transpilation by reverting to `electron-compile` (matching ZPay)
- Reverted config/main.js to use `electron-compile.init()` instead of `@babel/register`
- Removed invalid Flow type syntax that caused SyntaxError in production builds
- Removed Flow type annotations from `config/electron.js` (lines 34, 35, 122)
- Fixed Babel version incompatibility during production builds:
  - Changed `"asar": false` to `"asar": true` in package.json
  - Moved `electron-compilers` from dependencies to devDependencies
  - Removed `"electronCompile": false` setting
  - Added `scripts/fix-babel-bridge.sh` to remove nested babel-core@6.26.3
  - Added `postinstall` hook to run fix script automatically
  - Files are now pre-compiled during build using babel-core@7.0.0-bridge.0
  - Eliminates Babel 6/7 plugin incompatibility at build time
- Production builds now launch successfully without syntax errors
- Fixed: `SyntaxError: Unexpected token` when loading electron.js in production
- Fixed: `Cannot find module '@babel/plugin-transform-regenerator'` error
- Fixed: `[BABEL] Unknown option: .../node_modules/react/index.js.Children` error
- Root cause: @babel/register cannot resolve plugins in production; electron-compile with ASAR pre-compilation handles this correctly

## [Unreleased] - 2025-11-12

### Fixed

#### Synchronization Display
- Fixed incorrect sync percentage display (was stuck at 66% instead of 100%)
- Now correctly shows 100% when `blocks === headers` (fully synced)
- Added console logging for debugging sync status
- Location: `app/containers/status-pill.js:47-62`

#### ZCL Price API
- Replaced deprecated CryptoCompare API with CoinGecko API
- Fixed incorrect price reporting ($0.21 → $0.70)
- Updated endpoint: `https://api.coingecko.com/api/v3/simple/price`
- Location: `services/zcl-price.js`

#### Transaction Sending
- Fixed "amount exceeds available balance" error when sending transactions
- Implemented proper balance fetching before validation:
  - Shielded addresses: Use `z_getbalance()`
  - Transparent addresses: Sum unspent outputs via `listunspent()`
- Added comprehensive input validation:
  - Amount validation against actual balance
  - Fee validation (must be positive, reasonable range)
  - Memo validation (max 512 bytes for shielded transactions)
- Location: `app/containers/send.js:76-112`
- New validation utilities: `app/utils/validate-transaction-input.js`

#### Address Detection
- Fixed wallet not detecting all transparent addresses with balance
- Replaced `getaddressesbyaccount()` with `listunspent()` to find ALL addresses
- Now correctly detects change addresses created by transactions
- Groups UTXOs by address and calculates total balance
- Location: `app/containers/send.js:217-238`

#### User Interface
- Fixed ZCL logo display issues (stretched/hidden by sidebar)
  - Changed to fixed 60x60px size with `object-fit: contain`
  - Added proper centering with flexbox
  - Increased sidebar top padding to prevent overlap
  - Location: `app/components/zclassic-logo.js`, `app/components/header.js:20-33`, `app/components/sidebar.js:19`

#### Number Formatting
- Fixed European number format (comma as decimal separator)
- Enforced US locale format: dot (.) for decimal, comma (,) for thousands
- Applied to all balance and price displays
- Location: `app/utils/format-number.js:3-9`

#### Block Explorer
- Replaced dead Tokenview explorer with Zelcore explorer
- Updated URL: `https://explorer.zcl.zelcore.io/tx/`
- Location: `app/constants/explorer.js:7`

### Security

#### Transaction Validation
- Added server-side validation for all transaction inputs
- Prevents negative amounts and fees
- Validates memo size limits
- Checks balance before allowing transaction submission

### Technical Details

#### Balance Fetching Strategy
For transparent addresses, the wallet now:
1. Calls `listunspent(0)` to get ALL unspent outputs across all addresses
2. Groups UTXOs by address
3. Sums balances per address
4. Filters addresses with balance > 0

This ensures:
- Change addresses are always detected
- No addresses are missed due to account management quirks
- Accurate balance reporting for all addresses

#### Supported Address Types
- Transparent addresses (t-addr): Full support via RPC `listunspent()`
- Shielded addresses (z-addr): Full support via RPC `z_getbalance()` and `z_sendmany()`

### Dependencies
- No new dependencies added
- Compatible with existing Zclassic daemon 2.0.x

### Known Issues
- Electrum light client has synchronization issues (use ZPay with full node instead)

---

## Previous Releases

See git history for changes in previous versions.
