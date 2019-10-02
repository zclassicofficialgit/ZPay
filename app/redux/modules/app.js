// @flow

import electronStore from '../../../config/electron-store';

import { ZCLASSIC_NETWORK, EMBEDDED_DAEMON } from '../../constants/zclassic-network';
import { NODE_SYNC_TYPES } from '../../constants/node-sync-types';

import type { Action } from '../../types/redux';

export type State = {|
  isErrorModalVisible: boolean,
  error: string | null,
  nodeSyncProgress: number,
  nodeSyncType: 'ready' | 'syncing' | 'error',
  zclassicNetwork: string,
  embeddedDaemon: boolean,
  isRefetching: boolean,
|};

// Actions
export const SHOW_ERROR_MODAL = 'SHOW_ERROR_MODAL';
export const HIDE_ERROR_MODAL = 'HIDE_ERROR_MODAL';
export const UPDATE_NODE_SYNC_STATUS = 'UPDATE_NODE_SYNC_STATUS';

export const showErrorModal = ({ error }: { error: string }) => ({
  type: SHOW_ERROR_MODAL,
  payload: {
    error,
  },
});

export const closeErrorModal = () => ({
  type: HIDE_ERROR_MODAL,
  payload: {},
});

export const updateNodeSyncStatus = ({
  nodeSyncProgress,
  nodeSyncType,
}: {
  nodeSyncProgress: number,
  nodeSyncType: $PropertyType<State, 'nodeSyncType'>,
}) => ({
  type: UPDATE_NODE_SYNC_STATUS,
  payload: {
    nodeSyncProgress,
    nodeSyncType,
  },
});

const initialState: State = {
  isErrorModalVisible: false,
  error: null,
  nodeSyncProgress: 0,
  nodeSyncType: NODE_SYNC_TYPES.SYNCING,
  zclassicNetwork: electronStore.get(ZCLASSIC_NETWORK),
  embeddedDaemon: electronStore.get(EMBEDDED_DAEMON),
  isRefetching: false,
};

// eslint-disable-next-line
export default (state: State = initialState, action: Action): State => {
  switch (action.type) {
    case SHOW_ERROR_MODAL:
      return { ...state, isErrorModalVisible: true, error: action.payload.error };
    case HIDE_ERROR_MODAL:
      return { ...state, isErrorModalVisible: false, error: null };
    case UPDATE_NODE_SYNC_STATUS:
      return {
        ...state,
        nodeSyncProgress: action.payload.nodeSyncProgress,
        nodeSyncType: action.payload.nodeSyncType,
      };
    default:
      return state;
  }
};
