// @flow

import eres from 'eres';
import { connect } from 'react-redux';

import electronStore from '../../config/electron-store';
import { ZCLASSIC_NETWORK } from '../constants/zclassic-network';
import { SettingsView } from '../views/settings';

import { loadAddressesSuccess, loadAddressesError } from '../redux/modules/receive';

import rpc from '../../services/api';

import type { AppState } from '../types/app-state';
import type { Dispatch } from '../types/redux';

export type MapStateToProps = {|
  addresses: { address: string, balance: number }[],
  zclassicNetwork: string,
  embeddedDaemon: boolean,
|};

const mapStateToProps = ({ receive, app }: AppState): MapStateToProps => ({
  addresses: receive.addresses,
  zclassicNetwork: app.zclassicNetwork,
  embeddedDaemon: app.embeddedDaemon,
});

export type MapDispatchToProps = {|
  loadAddresses: () => Promise<void>,
  updateZclassicNetwork: (newNetwork: string) => void,
|};

const mapDispatchToProps = (dispatch: Dispatch): MapDispatchToProps => ({
  loadAddresses: async () => {
    const [zAddressesErr, zAddresses] = await eres(rpc.z_listaddresses());

    const [tAddressesErr, transparentAddresses] = await eres(rpc.getaddressesbyaccount(''));

    if (zAddressesErr || tAddressesErr) return dispatch(loadAddressesError({ error: 'Something went wrong!' }));

    dispatch(
      loadAddressesSuccess({
        addresses: [...zAddresses, ...transparentAddresses].map(add => ({
          address: add,
          balance: 0,
        })),
      }),
    );
  },
  updateZclassicNetwork: async (newNetwork) => {
    electronStore.set(ZCLASSIC_NETWORK, newNetwork);

    // Use IPC instead of remote
    const argv = await window.electronAPI.getArgv();
    const relaunchArgs = Array.from(new Set(argv.slice(1).concat(['--relaunch'])));

    await window.electronAPI.relaunchApp(relaunchArgs);
    await window.electronAPI.quitApp();
  },
});

// $FlowFixMe
export const SettingsContainer = connect(
  mapStateToProps,
  mapDispatchToProps,
)(SettingsView);
