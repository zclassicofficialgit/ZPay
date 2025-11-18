// @flow

import { connect } from 'react-redux';
import eres from 'eres';
import flow from 'lodash.flow';
import groupBy from 'lodash.groupby';
import dateFns from 'date-fns';
import { BigNumber } from 'bignumber.js';

import { DashboardView } from '../views/dashboard';

import rpc from '../../services/api';
import store from '../../config/electron-store';
import { SAPLING, MIN_CONFIRMATIONS_NUMBER } from '../constants/zclassic-network';
import { NODE_SYNC_TYPES } from '../constants/node-sync-types';
import { listShieldedTransactions } from '../../services/shielded-transactions';
import { sortByDescend } from '../utils/sort-by-descend';

import {
  loadWalletSummary,
  loadWalletSummarySuccess,
  loadWalletSummaryError,
} from '../redux/modules/wallet';
import type { TransactionsList } from '../redux/modules/transactions';

import type { AppState } from '../types/app-state';
import type { Dispatch, FetchState } from '../types/redux';

export type MapStateToProps = {|
  total: number,
  shielded: number,
  unconfirmed: number,
  error: null | string,
  fetchState: FetchState,
  zclPrice: number,
  addresses: string[],
  transactions: TransactionsList,
  isDaemonReady: boolean,
|};

const mapStateToProps: AppState => MapStateToProps = ({ walletSummary, app }) => ({
  total: walletSummary.shielded,  // Only show shielded balance as total
  shielded: walletSummary.shielded,
  unconfirmed: walletSummary.unconfirmed,
  error: walletSummary.error,
  fetchState: walletSummary.fetchState,
  zclPrice: walletSummary.zclPrice,
  addresses: walletSummary.addresses,
  transactions: walletSummary.transactions,
  isDaemonReady: app.nodeSyncType === NODE_SYNC_TYPES.READY,
});

export type MapDispatchToProps = {|
  getSummary: () => Promise<void>,
|};

const mapDispatchToProps: (dispatch: Dispatch) => MapDispatchToProps = (dispatch: Dispatch) => ({
  getSummary: async () => {
    dispatch(loadWalletSummary());

    const [walletErr, walletSummary] = await eres(rpc.z_gettotalbalance(0)); // Include unconfirmed (0 confirmations)
    const [confirmedWalletErr, confirmedWalletSummary] = await eres(rpc.z_gettotalbalance(1)); // Only confirmed (1+ confirmations)
    const [zAddressesErr, zAddresses = []] = await eres(rpc.z_listaddresses());
    // Zipher: Shielded-only, no transparent addresses
    const [transactionsErr, transactions] = await eres(rpc.listtransactions());

    // Calculate unconfirmed balance as the difference between total (0 conf) and confirmed (1+ conf)
    let unconfirmedBalance = 0;
    if (walletSummary && confirmedWalletSummary) {
      const totalWithUnconfirmed = new BigNumber(walletSummary.private || 0);
      const confirmedOnly = new BigNumber(confirmedWalletSummary.private || 0);
      unconfirmedBalance = totalWithUnconfirmed.minus(confirmedOnly).toNumber();
    }

    if (walletErr || confirmedWalletErr || zAddressesErr || transactionsErr) {
      return dispatch(
        loadWalletSummaryError({
          error: 'Something went wrong!',
        }),
      );
    }

    const formattedTransactions: Array<Object> = flow([
      arr => arr.map(transaction => ({
        confirmed: transaction.confirmations >= MIN_CONFIRMATIONS_NUMBER,
        confirmations: transaction.confirmations,
        transactionId: transaction.txid,
        type: transaction.category,
        date: new Date(transaction.time * 1000).toISOString(),
        address: transaction.address || '(Shielded)',
        amount: Math.abs(transaction.amount),
        fees: transaction.fee ? new BigNumber(transaction.fee).abs().toFormat(2) : 'N/A',
      })),
      arr => groupBy(arr, obj => dateFns.format(obj.date, 'MMM DD, YYYY')),
      obj => Object.keys(obj).map(day => ({
        day,
        jsDay: new Date(day),
        list: sortByDescend('date')(obj[day] || []),
      })),
      sortByDescend('jsDay'),
    ])([...transactions, ...listShieldedTransactions()] || []);

    if (!zAddresses.length) {
      const [, newZAddress] = await eres(rpc.z_getnewaddress(SAPLING));

      if (newZAddress) zAddresses.push(newZAddress);
    }

    // Zipher: No transparent addresses

    // Ensure all balance values are properly formatted numbers
    const totalBalance = confirmedWalletSummary ? new BigNumber(confirmedWalletSummary.private || 0).toNumber() : 0;
    const shieldedBalance = confirmedWalletSummary ? new BigNumber(confirmedWalletSummary.private || 0).toNumber() : 0;

    dispatch(
      loadWalletSummarySuccess({
        transparent: 0,  // Always 0 for Zipher
        total: totalBalance,  // Only confirmed shielded balance
        shielded: shieldedBalance,
        unconfirmed: unconfirmedBalance,
        addresses: zAddresses,  // Only z-addresses
        transactions: formattedTransactions,
        zclPrice: new BigNumber(store.get('ZCL_DOLLAR_PRICE')).toNumber(),
      }),
    );
  },
});

// $FlowFixMe
export const DashboardContainer = connect(
  mapStateToProps,
  mapDispatchToProps,
)(DashboardView);
