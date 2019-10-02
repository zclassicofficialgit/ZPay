// @flow

import eres from 'eres';
import { connect } from 'react-redux';
import { BigNumber } from 'bignumber.js';

import { TransactionsView } from '../views/transactions';
import {
  loadTransactions,
  loadTransactionsSuccess,
  loadTransactionsError,
  resetTransactionsList,
} from '../redux/modules/transactions';
import rpc from '../../services/api';
import { listShieldedTransactions } from '../../services/shielded-transactions';
import store from '../../config/electron-store';
import { MIN_CONFIRMATIONS_NUMBER } from '../constants/zclassic-network';

import { sortByDescend } from '../utils/sort-by-descend';

import type { AppState } from '../types/app-state';
import type { Dispatch } from '../types/redux';
import type { Transaction } from '../components/transaction-item';

const mapStateToProps = ({ transactions }: AppState) => ({
  transactions: transactions.list,
  fetchState: transactions.fetchState,
  error: transactions.error,
  zclPrice: transactions.zclPrice,
  hasNextPage: transactions.hasNextPage,
});

export type MapStateToProps = {
  transactions: Transaction[],
  isLoading: boolean,
  error: string | null,
  zclPrice: number,
  hasNextPage: boolean,
};

export type MapDispatchToProps = {|
  getTransactions: ({
    offset: number,
    count: number,
    shieldedTransactionsCount: number,
  }) => Promise<void>,
  resetTransactionsList: () => void,
|};

const mapDispatchToProps = (dispatch: Dispatch): MapDispatchToProps => ({
  resetTransactionsList: () => dispatch(resetTransactionsList()),
  getTransactions: async ({ offset, count, shieldedTransactionsCount }) => {
    dispatch(loadTransactions());

    const [transactionsErr, transactions = []] = await eres(
      rpc.listtransactions('', count, offset),
    );

    if (transactionsErr) {
      return dispatch(loadTransactionsError({ error: transactionsErr.message }));
    }

    const formattedTransactions = sortByDescend('date')(
      [
        ...transactions,
        ...listShieldedTransactions({ count, offset: shieldedTransactionsCount }),
      ].map(transaction => ({
        confirmations: transaction.confirmations !== undefined ? transaction.confirmations : 0,
        confirmed:
          transaction.confirmations !== undefined
            ? transaction.confirmations >= MIN_CONFIRMATIONS_NUMBER
            : true,
        transactionId: transaction.txid,
        type: transaction.category,
        date: new Date(transaction.time * 1000).toISOString(),
        address: transaction.address || '(Shielded)',
        amount: new BigNumber(transaction.amount).absoluteValue().toNumber(),
        fees: transaction.fee ? new BigNumber(transaction.fee).abs().toFormat(4) : 'N/A',
      })),
    );

    dispatch(
      loadTransactionsSuccess({
        list: formattedTransactions,
        zclPrice: new BigNumber(store.get('ZCL_DOLLAR_PRICE')).toNumber(),
        hasNextPage: Boolean(formattedTransactions.length),
      }),
    );
  },
});

// $FlowFixMe
export const TransactionsContainer = connect(
  mapStateToProps,
  mapDispatchToProps,
)(TransactionsView);
