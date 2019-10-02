// @flow

import { connect } from 'react-redux';

import { SidebarComponent } from '../components/sidebar';

import type { AppState } from '../types/app-state';

export type MapStateToProps = {|
  zclassicNetwork: string,
  embeddedDaemon: boolean,
|};

const mapStateToProps = ({ app }: AppState): MapStateToProps => ({
  zclassicNetwork: app.zclassicNetwork,
  embeddedDaemon: app.embeddedDaemon,
});

// $FlowFixMe
export const SidebarContainer = connect(
  mapStateToProps,
)(SidebarComponent);
