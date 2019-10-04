# ZPay| ZCL Wallet

ZPay is a Sapling-enabled shielded-address-first Zclassic wallet, featuring cross-platform applications (macOS, Windows and Linux), built-in full node with support for `mainnet` and `testnet`, as well as `dark` and `light` themes.

![Build Status](https://app.bitrise.io/app/a5bc7a8391d5501b/status.svg?token=SOuGNc3Qf9rCj3Osl-eHyQ&branch=master)
![Flow Coverage](./public/flow-coverage-badge.svg)

### [Latest Documentation](https://zepiowallet.com)

### [Latest Release](https://github.com/zclassicofficialgit/ZPay)

![ZPay Wallet](https://github.com/zclassicofficialgit/ZPay/blob/1.0/app/assets/images/dashboard.png)

WARNING: Be careful when using this software! It is highly experimental. Always have your private keys saved securely. We STRONGLY recommend testing the wallet out on the testnet before using it for live transactions to familiarize yourself with its operation.

Always test with small amounts first! It is your responsibility to properly handle your private keys.
For best security, it is recommended to build the entire ZPay wallet by yourself, directly from GitHub.

Encryption: Wallet encryption is currently disabled by Zclassicd. You should use full-disk encryption (or encryption of your home directory) to protect your wallet.dat file, and should assume that even unprivileged users who are running on your O/S can read your wallet.dat file.

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

## Installing and Running From Source

To run **ZPay** from source you'll need to perform the following steps:
```bash
# Ensure you have Node LTS v8+
# https://nodejs.org/en/

# Clone Codebase
git clone https://github.com/zclassicofficialgit/ZPay

# Install Dependencies
# inside of the `ZPay` folder
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
