// @flow

import { connect } from 'react-redux';

import { closeErrorModal } from '../redux/modules/app';
import { LayoutComponent } from '../components/layout';

import type { Dispatch } from '../types/redux';
import type { AppState } from '../types/app-state';

export type MapStateToProps = {|
  isErrorModalVisible: boolean,
  zclassicNetwork: string,
  error: string | null,
  embeddedDaemon: boolean,
|};

const mapStateToProps = ({ app }: AppState): MapStateToProps => ({
  isErrorModalVisible: app.isErrorModalVisible,
  error: app.error,
  zclassicNetwork: app.zclassicNetwork,
  embeddedDaemon: app.embeddedDaemon,
});

export type MapDispatchToProps = {|
  closeErrorModal: () => void,
|};

const mapDispatchToProps = (dispatch: Dispatch): MapDispatchToProps => ({
  closeErrorModal: () => dispatch(closeErrorModal()),
});

// $FlowFixMe
export const AppContainer = connect(
  mapStateToProps,
  mapDispatchToProps,
)(LayoutComponent);
