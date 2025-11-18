# Changelog

All notable changes to Zipher will be documented in this file.

## [1.0.0] - 2025-11-18

### Added

#### Blockchain Bootstrap Feature
- Automated blockchain bootstrap download and installation
- Detects when bootstrap is needed (missing or outdated blockchain data)
- Downloads 7.73 GB bootstrap from GitHub releases (split into 5 parts)
- Parallel download support for faster speeds
- SHA256 checksum verification
- Automatic extraction to Zclassic data directory
- Progress tracking with status updates
- User can skip or cancel installation
- Comprehensive error handling and recovery
- Components: `app/components/bootstrap-installer.js`, `services/bootstrap-installer.js`

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
