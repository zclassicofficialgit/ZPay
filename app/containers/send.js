// @flow

import eres from 'eres';
import { connect } from 'react-redux';
import { BigNumber } from 'bignumber.js';

import store from '../../config/electron-store';
import rpc from '../../services/api';
import { SendView } from '../views/send';

import {
  loadZCLPrice,
  sendTransaction,
  sendTransactionSuccess,
  sendTransactionError,
  resetSendTransaction,
  validateAddressSuccess,
  validateAddressError,
  loadAddressBalanceSuccess,
  loadAddressBalanceError,
} from '../redux/modules/send';

import { filterObjectNullKeys } from '../utils/filter-object-null-keys';
import { asyncMap } from '../utils/async-map';
import { getLatestAddressKey } from '../utils/get-latest-address-key';
import { saveShieldedTransaction } from '../../services/shielded-transactions';
import { validateAmount, validateFee, validateMemo } from '../utils/validate-transaction-input';

import type { AppState } from '../types/app-state';
import type { Dispatch, FetchState } from '../types/redux';

import { loadAddresses, loadAddressesSuccess, loadAddressesError } from '../redux/modules/receive';

export type SendTransactionInput = {
  from: string,
  to: string,
  amount: string,
  fee: number,
  memo: string,
};

export type MapStateToProps = {|
  balance: number,
  zclPrice: number,
  addresses: { address: string, balance: number }[],
  error: string | null,
  fetchState: FetchState,
  isSending: boolean,
  operationId: string | null,
  isToAddressValid: boolean,
  nodeSyncType: string,
|};

const mapStateToProps = ({ sendStatus, receive, app }: AppState): MapStateToProps => ({
  balance: sendStatus.addressBalance,
  zclPrice: sendStatus.zclPrice,
  addresses: receive.addresses,
  error: sendStatus.error,
  fetchState: receive.fetchState,
  isSending: sendStatus.isSending,
  operationId: sendStatus.operationId,
  isToAddressValid: sendStatus.isToAddressValid,
  nodeSyncType: app.nodeSyncType,
});

export type MapDispatchToProps = {|
  sendTransaction: SendTransactionInput => Promise<void>,
  loadAddresses: () => Promise<void>,
  resetSendView: () => void,
  validateAddress: ({ address: string }) => Promise<void>,
  loadZCLPrice: () => void,
  getAddressBalance: ({ address: string }) => Promise<void>,
|};

const mapDispatchToProps = (dispatch: Dispatch): MapDispatchToProps => ({
  sendTransaction: async ({
    from, to, amount, fee, memo,
  }) => {
    // Get balance of the 'from' address (works for both t and z addresses)
    let balance = 0;
    if (from.startsWith('z')) {
      const [balanceErr, zBalance] = await eres(rpc.z_getbalance(from));
      if (balanceErr) {
        return dispatch(sendTransactionError({ error: 'Unable to fetch balance for sending address' }));
      }
      balance = zBalance;
    } else {
      // For transparent addresses, sum up unspent outputs
      const [unspentErr, unspentOutputs] = await eres(rpc.listunspent(0, 9999999, [from]));
      if (unspentErr) {
        return dispatch(sendTransactionError({ error: 'Unable to fetch balance for sending address' }));
      }
      balance = unspentOutputs.reduce((sum, utxo) => sum + utxo.amount, 0);
    }

    // Validate amount against actual balance
    const amountValidation = validateAmount(amount, balance);
    if (!amountValidation.isValid) {
      return dispatch(sendTransactionError({ error: amountValidation.error || 'Invalid amount' }));
    }

    // Validate fee
    const feeValidation = validateFee(fee);
    if (!feeValidation.isValid) {
      return dispatch(sendTransactionError({ error: feeValidation.error || 'Invalid fee' }));
    }

    // Validate memo
    const memoValidation = validateMemo(memo);
    if (!memoValidation.isValid) {
      return dispatch(sendTransactionError({ error: memoValidation.error || 'Invalid memo' }));
    }

    dispatch(sendTransaction());

    // $FlowFixMe
    const [sendErr, operationId] = await eres(
      rpc.z_sendmany(
        from,
        // $FlowFixMe
        [
          filterObjectNullKeys({
            address: to,
            amount: new BigNumber(amount).toNumber(),
            memo,
          }),
        ],
        1,
        new BigNumber(fee).toNumber(),
      ),
    );

    // eslint-disable-next-line max-len
    if (sendErr || !operationId) return dispatch(sendTransactionError({ error: sendErr.message }));

    /**
      Output is a list of operation status objects.
      [
        {“operationid”: “opid-12ee…”,
        “status”: “queued”},
        {“operationid”: “opd-098a…”, “status”: ”executing”},
        {“operationid”: “opid-9876”, “status”: ”failed”}
      ]

      When the operation succeeds, the status object will also include the result.
      {“operationid”: “opid-0e0e”, “status”:”success”, “execution_time”:”25”, “result”: {“txid”:”af3887654…”,...}}

      then the promise will only be resolved when a "success" or "failure" status is obtained
     */
    const interval = setInterval(async () => {
      const [, status] = await eres(rpc.z_getoperationstatus());

      const operationStatus = status.find(({ id }) => operationId === id);

      if (operationStatus && operationStatus.status === 'success') {
        clearInterval(interval);
        if (from.startsWith('z')) {
          saveShieldedTransaction({
            txid: operationStatus.result.txid,
            category: 'send',
            time: Date.now() / 1000,
            address: '(Shielded)',
            amount: new BigNumber(amount).toNumber(),
            memo,
          });
        }
        dispatch(sendTransactionSuccess({ operationId: operationStatus.result.txid }));
      }

      if (operationStatus && operationStatus.status === 'failed') {
        clearInterval(interval);
        dispatch(sendTransactionError({ error: operationStatus.error.message }));
      }
    }, 2000);
  },
  resetSendView: () => dispatch(resetSendTransaction()),
  validateAddress: async ({ address }: { address: string }) => {
    if (address.startsWith('z')) {
      const [, validationResult] = await eres(rpc.z_validateaddress(address));

      return dispatch(
        validateAddressSuccess({
          isValid: Boolean(validationResult && validationResult.isvalid),
        }),
      );
    }

    const [, validationResult] = await eres(rpc.validateaddress(address));

    if (validationResult) {
      return dispatch(
        validateAddressSuccess({
          isValid: Boolean(validationResult && validationResult.isvalid),
        }),
      );
    }

    return dispatch(validateAddressError());
  },
  loadAddresses: async () => {
    dispatch(loadAddresses());

    const [zAddressesErr, zAddresses] = await eres(rpc.z_listaddresses());

    if (zAddressesErr) return dispatch(loadAddressesError({ error: 'Something went wrong!' }));

    // Helper function to get balance for any address type
    const getAddressBalance = async (address) => {
      if (address.startsWith('z')) {
        return rpc.z_getbalance(address);
      }
      // For transparent addresses, sum unspent outputs
      const unspentOutputs = await rpc.listunspent(0, 9999999, [address]);
      return unspentOutputs.reduce((sum, utxo) => sum + utxo.amount, 0);
    };

    // Get ALL transparent addresses with balance by checking listunspent
    const [unspentErr, allUnspent] = await eres(rpc.listunspent(0));
    if (unspentErr) return dispatch(loadAddressesError({ error: 'Something went wrong!' }));

    // Group unspent outputs by address and sum balances
    const transparentBalances = {};
    allUnspent.forEach((utxo) => {
      if (!transparentBalances[utxo.address]) {
        transparentBalances[utxo.address] = 0;
      }
      transparentBalances[utxo.address] += utxo.amount;
    });

    // Convert to array of addresses with balance > 0
    const transparentAddresses = Object.entries(transparentBalances)
      .filter(([, balance]) => balance > 0)
      .map(([addr, balance]) => ({ address: addr, balance }));

    const latestZAddress = zAddresses.find(addr => addr === store.get(getLatestAddressKey('shielded'))) || zAddresses[0];

    const latestTAddress = transparentAddresses.find(({ address }) => address === store.get(getLatestAddressKey('transparent')))
      || transparentAddresses[0];

    const allAddresses = await asyncMap(
      [
        ...zAddresses.filter(cur => cur !== latestZAddress),
        ...transparentAddresses.filter(
          ({ address }) => address !== (latestTAddress ? latestTAddress.address : null),
        ),
      ],
      async (item) => {
        const address = typeof item === 'string' ? item : item.address;
        const [err, response] = await eres(getAddressBalance(address));

        if (!err && new BigNumber(response).isGreaterThan(0)) return { address, balance: response };

        return null;
      },
    );

    return dispatch(
      loadAddressesSuccess({
        addresses: [
          latestZAddress
            ? {
              address: latestZAddress,
              balance: await getAddressBalance(latestZAddress),
            }
            : null,
          latestTAddress
            ? { address: latestTAddress.address, balance: latestTAddress.balance }
            : null,
          ...allAddresses,
        ].filter(Boolean),
      }),
    );
  },
  loadZCLPrice: () => dispatch(
    loadZCLPrice({
      value: Number(store.get('ZCL_DOLLAR_PRICE')),
    }),
  ),
  getAddressBalance: async ({ address }: { address: string }) => {
    let balance = 0;
    if (address.startsWith('z')) {
      const [err, zBalance] = await eres(rpc.z_getbalance(address));
      if (err) return dispatch(loadAddressBalanceError({ error: "Can't load your balance address" }));
      balance = zBalance;
    } else {
      // For transparent addresses, sum unspent outputs
      const [err, unspentOutputs] = await eres(rpc.listunspent(0, 9999999, [address]));
      if (err) return dispatch(loadAddressBalanceError({ error: "Can't load your balance address" }));
      balance = unspentOutputs.reduce((sum, utxo) => sum + utxo.amount, 0);
    }

    return dispatch(loadAddressBalanceSuccess({ balance }));
  },
});

// $FlowFixMe
export const SendContainer = connect(
  mapStateToProps,
  mapDispatchToProps,
)(SendView);
