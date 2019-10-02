// @flow

import { isTestnet } from '../../config/is-testnet';
import { TESTNET, MAINNET } from '../constants/zclassic-network';

export const getLatestAddressKey = (type: string) => `LATEST_${type === 'shielded' ? 'SHIELDED' : 'TRANSPARENT'}_ADDRESS_${
  isTestnet() ? TESTNET : MAINNET
}`;
