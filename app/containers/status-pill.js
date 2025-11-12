// @flow

import { connect } from 'react-redux';
import eres from 'eres';

import { updateNodeSyncStatus } from '../redux/modules/app';
import { StatusPill } from '../components/status-pill';
import rpc from '../../services/api';
import { NODE_SYNC_TYPES } from '../constants/node-sync-types';
import { FETCH_STATE } from '../constants/fetch-states';

import type { Dispatch } from '../types/redux';
import type { AppState } from '../types/app-state';

export type MapStateToProps = {|
  nodeSyncProgress: number,
  nodeSyncType: 'ready' | 'syncing' | 'error',
  isRefetching: boolean,
|};

const mapStateToProps = ({ app, walletSummary, receive }: AppState): MapStateToProps => ({
  nodeSyncProgress: app.nodeSyncProgress,
  nodeSyncType: app.nodeSyncType,
  isRefetching:
    walletSummary.fetchState === FETCH_STATE.REFETCHING
    || receive.fetchState === FETCH_STATE.REFETCHING,
});

export type MapDispatchToProps = {|
  getBlockchainStatus: () => Promise<void>,
|};

const mapDispatchToProps = (dispatch: Dispatch): MapDispatchToProps => ({
  getBlockchainStatus: async () => {
    const [blockchainErr, blockchaininfo] = await eres(rpc.getblockchaininfo());

    if (blockchainErr || !blockchaininfo) {
      return dispatch(
        updateNodeSyncStatus({
          nodeSyncProgress: 0,
          nodeSyncType: NODE_SYNC_TYPES.ERROR,
        }),
      );
    }

    const newProgress = blockchaininfo.verificationprogress * 100;

    // Fix: Consider synced when blocks == headers (fully caught up with network)
    // verificationprogress is unreliable for Zclassic and gets stuck at ~66%
    const isSynced = blockchaininfo.blocks === blockchaininfo.headers;

    // eslint-disable-next-line no-console
    console.log('[ZPay Sync Fix] blocks:', blockchaininfo.blocks, 'headers:', blockchaininfo.headers, 'isSynced:', isSynced);

    dispatch(
      updateNodeSyncStatus({
        nodeSyncProgress: isSynced ? 100 : newProgress,
        nodeSyncType: isSynced
          ? NODE_SYNC_TYPES.READY
          : NODE_SYNC_TYPES.SYNCING,
      }),
    );
  },
});

// $FlowFixMe
export const StatusPillContainer = connect(
  mapStateToProps,
  mapDispatchToProps,
)(StatusPill);
