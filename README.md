# Zipher | ZCL Wallet

## ⚠️ IMPORTANT DISCLAIMER - EXPERIMENTAL SOFTWARE ⚠️

**THIS SOFTWARE IS PROVIDED FOR EXPERIMENTAL, EDUCATIONAL, AND RESEARCH PURPOSES ONLY.**

### Legal Disclaimer

**USE AT YOUR OWN RISK.** By using this software, you acknowledge and agree to the following:

1. **EXPERIMENTAL NATURE**: This wallet is highly experimental software in active development. It may contain bugs, errors, or vulnerabilities that could result in the loss of funds.

2. **NO WARRANTIES**: THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, TITLE, AND NONINFRINGEMENT.

3. **NO LIABILITY**: IN NO EVENT SHALL THE AUTHORS, COPYRIGHT HOLDERS, CONTRIBUTORS, OR DISTRIBUTORS BE LIABLE FOR ANY CLAIM, DAMAGES, OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE, INCLUDING BUT NOT LIMITED TO:
   - Loss of funds or cryptocurrency
   - Loss of private keys or wallet data
   - Unauthorized access to your wallet
   - Software malfunctions or data corruption
   - Any direct, indirect, incidental, special, exemplary, or consequential damages

4. **USER RESPONSIBILITY**: You are solely responsible for:
   - Securing your private keys and wallet backups
   - Testing the software with small amounts first
   - Understanding the risks of cryptocurrency transactions
   - Complying with all applicable laws and regulations in your jurisdiction
   - Any financial losses that may occur

5. **SECURITY**:
   - Wallet encryption is currently disabled by the Zclassic daemon
   - Use full-disk encryption to protect your wallet.dat file
   - Assume that any user on your system can access your wallet.dat
   - Never use this software for amounts you cannot afford to lose

6. **NO FINANCIAL ADVICE**: This software does not constitute financial, investment, legal, or tax advice. Consult with qualified professionals before making any financial decisions.

7. **TESTING RECOMMENDED**: We STRONGLY recommend:
   - Testing the wallet on testnet before using mainnet
   - Starting with very small amounts
   - Building the software yourself from source for maximum security
   - Keeping multiple backups of your private keys in secure locations

8. **TESTING STATUS**: This software has only been tested on macOS. Windows and Linux versions are untested and may contain platform-specific bugs. Use at your own risk on non-macOS platforms.

### About Zipher

Zipher is an experimental Sapling-enabled shielded-address-first Zclassic wallet, featuring cross-platform applications (macOS, Windows and Linux), built-in full node with support for `mainnet` and `testnet`, as well as multiple themes including dark, light, and retro styles.

![Build Status](https://app.bitrise.io/app/a5bc7a8391d5501b/status.svg?token=SOuGNc3Qf9rCj3Osl-eHyQ&branch=master)
![Flow Coverage](./public/flow-coverage-badge.svg)

## 🚀 Latest Updates (November 2025)

**Version 1.0.0 Release - New Features:**
- ✅ **Automated Bootstrap Download** - Fast-sync your blockchain in minutes instead of hours!
- ✅ **SHA256 Verification** - Automatic checksum validation for security
- ✅ **Parallel Downloads** - Multi-threaded downloading for maximum speed
- ✅ **Progress Tracking** - Real-time status updates during installation

**Bug Fixes:**
- ✅ Fixed production build errors (Babel and Flow syntax issues)
- ✅ Fixed sync status display (now shows 100% when fully synced)
- ✅ Updated ZCL price API (CoinGecko integration)
- ✅ Fixed transaction sending with proper balance validation
- ✅ Improved address detection (detects ALL addresses including change addresses)
- ✅ Updated block explorer (Zelcore)
- ✅ Enhanced security and input validation

**See [CHANGELOG.md](./CHANGELOG.md) for detailed changes**

### [Repository](https://github.com/VictorLux/Zipher)
### [Blockchain Bootstrap Releases](https://github.com/VictorLux/Zipher/releases) - Fast sync your node!
### [Original ZPay Wallet](https://github.com/zclassicofficialgit/ZPay)

![Zipher Wallet](https://github.com/zclassicofficialgit/ZPay/blob/1.0/app/assets/images/dashboard.png)

## Stack Information

List of the main open source libraries and technologies used in building **ZPay**:

- [zclassicd](https://github.com/zclassicofficialgit/zclassic): Zclassicd node daemon
- [Electron](https://github.com/electron/electron): Desktop application builder
- [React](https://facebook.github.io/react/): User interface view layer
- [Redux](https://redux.js.org/): Predictable application state container
- [Styled Components](https://www.styled-components.com/): Visual primitives for theming and styling applications
- [webpack](https://webpack.github.io/): Application module bundler (and more)
- [Babel](https://babeljs.io/): ES7/JSX transpilling
- [ESLint](https://eslint.org/): Code linting rules
- [Flow](https://flow.org): JavaScript static type checker
- [Docz](https://docz.site): Documentation builder
- [BigNumber.js](https://github.com/MikeMcl/bignumber.js#readme): Arbitrary-precision decimal and non-decimal arithmetic with safety

## 🚀 Quick Start with Bootstrap

**New!** Save hours of sync time by using the automated blockchain bootstrap:

Zipher automatically detects when bootstrap is needed and offers to download and install it for you. Just launch the wallet and follow the prompts!

**For manual installation**, visit the [Releases page](https://github.com/VictorLux/Zipher/releases) and download the latest bootstrap files.

## Installing and Running From Source

To run **Zipher** from source you'll need to perform the following steps:
```bash
# Ensure you have Node LTS v12+ (v14 recommended)
# https://nodejs.org/en/

# Clone Codebase
git clone https://github.com/VictorLux/Zipher

# Install Dependencies
# inside of the `Zipher` folder
cd Zipher
yarn install
# or
npm install

# Start Application
# webpack development server hosts the application on port
# 8080 and launches the Electron wrapper, which also hosts
# the `zclassicd` node daemon process.
yarn start
# or
npm start
```

**Note for macOS users:** See [BUILD_MAC_INSTRUCTIONS.md](./BUILD_MAC_INSTRUCTIONS.md) for detailed build instructions.

## Building Application Locally

To build the application locally follow the instructions below:
```bash
# Make sure you are inside of the main `ZPay` folder

# Run Build Script
yarn electron:distall

# Executables and binaries available under `/dist` folder
```

## Flow Coverage (Static Type Checker)

For a deeper look on the static typing coverage of the application, please follow below:
```bash
# Make sure you are inside of the main `ZPay` folder

# Generate Flow Coverage Report
# this can take a couple seconds
yarn flow:report

# Browser should open with the file `index.html` opened
# Files are also available at `ZPay/flow-coverage/source`
```

## Component Library (Docz)

To see ZPay's React component library, please visit https://zepio-components.now.sh. We're always looking for folks to help keep the styleguide updated.

To run the component library locally, run the following:
```bash
# Make sure you are inside of the main `ZPay` folder

# Run Docz Development Script
yarn docz:dev

# Visit http://127.0.0.1:4000/
```

To build the component library locally, run the following:
```bash
# Make sure you are inside of the main `ZPay` folder

# Run Build Script
yarn docz:build

# Check `/.docz/dist` folder for built static assets
```

## Tests

To run the application's tests, please run the below:
```bash
# Make sure you are inside of the main `ZPay` folder

# For Unit Tests: Run Jest Unit Test Suite
yarn test:unit

# For E2E (end-to-end) Tests: Run Jest E2E Suite
yarn e2e:serve
# on another terminal window
yarn test e2e
```

## Contributing

In order to contribute and submit PRs to improve the **ZPay** codebase, please check our [CONTRIBUTING](https://github.com/zclassicofficialgit/ZPay/blob/1.0/CONTRIBUTING.md) guide.

## Disclaimer

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

## License

MIT © Zcash Foundation 2019 [zfnd.org](https://zfnd.org)
Zclassice CE Team 2019 https://zclassic-ce.org/
