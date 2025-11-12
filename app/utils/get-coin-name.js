// @flow
import { isTestnet } from '../../config/is-testnet';

export const getCoinName = () => {
  // Direct access to process.env since we have nodeIntegration enabled
  const nodeEnv = typeof process !== 'undefined' ? process.env.NODE_ENV : '';
  if (nodeEnv === 'test' || isTestnet()) return 'TCL';

  return 'ZCL';
};
