// @flow

import electronStore from './electron-store';
import { ZCLASSIC_NETWORK, MAINNET } from '../app/constants/zclassic-network';

export const isTestnet = () => electronStore.get(ZCLASSIC_NETWORK) !== MAINNET;
