# ZPay Release Notes - November 2025 Update

## Summary

This release includes critical bug fixes and improvements to enhance wallet functionality, user experience, and reliability.

## What's New

### 🐛 Bug Fixes

1. **Sync Status Display** - Fixed incorrect sync percentage (stuck at 66%)
2. **ZCL Price API** - Switched to reliable CoinGecko API (was showing wrong price)
3. **Transaction Sending** - Fixed "amount exceeds balance" error
4. **Address Detection** - Wallet now finds ALL addresses with balance (including change addresses)
5. **UI Improvements** - Fixed logo display and positioning
6. **Number Formatting** - Enforced US format (1,234.56 instead of 1.234,56)
7. **Block Explorer** - Updated to working Zelcore explorer

### 🔒 Security Enhancements

- Added comprehensive transaction input validation
- Balance verification before sending transactions
- Memo size limit enforcement (512 bytes)
- Fee range validation

### ⚡ Performance

- Optimized address balance fetching
- Improved UTXO handling for transparent addresses

## Upgrade Instructions

### From Source

```bash
git pull origin 1.0
yarn install
yarn start
```

### Binary Users

Download the latest release from GitHub and install as usual. Your existing wallet.dat will work without changes.

## Detailed Changes

See [CHANGELOG.md](./CHANGELOG.md) for technical details.

## Testing Recommendations

After upgrading, please verify:

1. ✅ Sync status shows 100% when fully synced
2. ✅ ZCL price displays correctly (~$0.70)
3. ✅ All your addresses with balance are visible
4. ✅ Sending transactions works correctly
5. ✅ Transaction explorer links open correctly

## Known Issues

- Electrum light client has sync issues (use full node mode instead)
- First sync can take several hours (use bootstrap to speed up)

## Support

- GitHub Issues: https://github.com/zclassicofficialgit/ZPay/issues
- Discord: [Zclassic Community](https://discord.gg/zclassic)

## Contributors

Special thanks to all contributors who helped test and report issues!

---

**Always backup your wallet.dat before upgrading!**
