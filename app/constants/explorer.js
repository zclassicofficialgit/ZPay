// @flow

import { isTestnet } from '../../config/is-testnet';

export const ZCLASSIC_EXPLORER_BASE_URL = isTestnet()
  ? 'https://chain.so/tx/ZCLTEST/'
  : 'https://zcl.tokenview.com/insight/tx/';
