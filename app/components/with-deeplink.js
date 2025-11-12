// @flow
import React, { type ComponentType, Component } from 'react';
import { type RouterHistory, type Location } from 'react-router-dom';
import { searchUriInArgv } from '../../config/handle-deeplink';
import electronStore from '../../config/electron-store';

type PassedProps = {
  history: RouterHistory,
  location: Location,
  isRunning: boolean,
};

const OSX_DEEPLINK_URL_KEY = 'OSX_DEEPLINK_URL';

export const withDeepLink = (
  WrappedComponent: ComponentType<PassedProps>,
): ComponentType<$Diff<PassedProps, {}>> => class extends Component<PassedProps> {
  async componentDidMount() {
    // Use electronAPI instead of remote
    const argv = await window.electronAPI.getArgv();
    const arg = searchUriInArgv([
      ...argv,
      electronStore.get(OSX_DEEPLINK_URL_KEY) || '',
    ]);

    if (arg) this.redirect(arg);

    // Deep link event listener is now handled via electronAPI
    // Note: app.on('open-url') needs to be handled in main process and sent via IPC
  }

  componentWillUnmount() {
    // Clean up if needed
  }

  redirect(message: string) {
    const { history } = this.props;

    // clean osx deeplink storage
    if (electronStore.has(OSX_DEEPLINK_URL_KEY)) {
      electronStore.delete(OSX_DEEPLINK_URL_KEY);
    }

    history.replace(`/send/${message.replace(/zclassic:(\/\/)?/, '')}`);
  }

  render() {
    return <WrappedComponent {...this.props} {...this.state} />;
  }
};
