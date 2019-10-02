// @flow

import walletSummaryReducer, {
  LOAD_WALLET_SUMMARY,
  LOAD_WALLET_SUMMARY_SUCCESS,
  LOAD_WALLET_SUMMARY_ERROR,
} from '../../app/redux/modules/wallet';

describe('WalletSummary Reducer', () => {
  test('should return the valid initial state', () => {
    const initialState = {
      addresses: [],
      transactions: [],
      total: 0,
      shielded: 0,
      transparent: 0,
      unconfirmed: 0,
      error: null,
      isLoading: false,
      zclPrice: 0,
    };
    const action = {
      type: 'UNKNOWN_ACTION',
      payload: {},
    };

    expect(walletSummaryReducer(undefined, action)).toEqual(initialState);
  });

  test('should load the wallet summary', () => {
    const action = {
      type: LOAD_WALLET_SUMMARY,
      payload: {},
    };
    const expectedState = {
      addresses: [],
      transactions: [],
      total: 0,
      shielded: 0,
      transparent: 0,
      unconfirmed: 0,
      error: null,
      isLoading: true,
      zclPrice: 0,
    };

    expect(walletSummaryReducer(undefined, action)).toEqual(expectedState);
  });

  test('should load the wallet summary with success', () => {
    const action = {
      type: LOAD_WALLET_SUMMARY_SUCCESS,
      payload: {
        total: 1000,
        transparent: 1000,
        shielded: 1000,
        unconfirmed: 0,
      },
    };
    const expectedState = {
      ...action.payload,
      error: null,
      isLoading: false,
      addresses: [],
      transactions: [],
      zclPrice: 0,
    };

    expect(walletSummaryReducer(undefined, action)).toEqual(expectedState);
  });

  test('should load the wallet summary with error', () => {
    const action = {
      type: LOAD_WALLET_SUMMARY_ERROR,
      payload: {
        error: 'Something went wrong',
      },
    };
    const expectedState = {
      total: 0,
      shielded: 0,
      transparent: 0,
      unconfirmed: 0,
      error: action.payload.error,
      isLoading: false,
      addresses: [],
      transactions: [],
      zclPrice: 0,
    };

    expect(walletSummaryReducer(undefined, action)).toEqual(expectedState);
  });
});
