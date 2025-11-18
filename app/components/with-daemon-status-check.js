// @flow
import electron from 'electron'; // eslint-disable-line
import React, { type ComponentType, Component } from 'react';

import store from '../../config/electron-store';

import { LoadingScreen } from './loading-screen';

import rpc from '../../services/api';

type Props = {};

type State = {
  isRunning: boolean,
  progress: number,
  message: string,
  startTime: number,
  connectionAttempts: number,
};

/* eslint-disable max-len */
export const withDaemonStatusCheck = <PassedProps: {}>(
  WrappedComponent: ComponentType<PassedProps>,
): ComponentType<$Diff<PassedProps, Props>> => class extends Component<PassedProps, State> {
    timer: ?IntervalID = null;

    requestOnTheFly: boolean = false;

    state = {
      isRunning: false,
      progress: 0,
      message: 'Zipher Starting',
      startTime: Date.now(),
      connectionAttempts: 0,
    };

    handleDaemonStatus = (
      event: empty,
      message: {
        error: boolean,
        status: string,
      },
    ) => {
      if (message.error) {
        clearInterval(this.timer);
      }

      this.setState({
        message: message.status,
        ...(message.error ? { progress: 0, isRunning: false } : {}),
      });
    };

    componentDidMount() {
      this.runTest();
      this.timer = setInterval(this.runTest, 3000);

      electron.ipcRenderer.on('zclassic-daemon-status', this.handleDaemonStatus);
    }

    componentWillUnmount() {
      if (this.timer) {
        clearInterval(this.timer);
        this.timer = null;
      }

      electron.ipcRenderer.removeListener('zclassic-daemon-status', this.handleDaemonStatus);
    }

    runTest = () => {
      const daemonPID: number = store.get('DAEMON_PROCESS_PID');

      if (this.requestOnTheFly || !daemonPID) return;

      this.requestOnTheFly = true;

      rpc
        .ping()
        .then(() => {
          // Daemon is responding to ping, now check if blockchain is fully synced
          return rpc.getblockchaininfo();
        })
        .then((blockchainInfo) => {
          this.requestOnTheFly = false;

          const verificationProgress = blockchainInfo.verificationprogress || 0;
          const currentBlocks = blockchainInfo.blocks || 0;
          const totalHeaders = blockchainInfo.headers || 0;

          // Consider fully synced when:
          // 1. Verification progress > 0.9999, OR
          // 2. Current blocks equals total headers (caught up with network)
          const isSynced = verificationProgress > 0.9999 || (currentBlocks > 0 && currentBlocks === totalHeaders);

          if (isSynced) {
            setTimeout(() => {
              this.setState(() => ({ isRunning: true }));
            }, 500);
            this.setState(() => ({ progress: 100, message: 'Blockchain synchronized' }));

            if (this.timer) {
              clearInterval(this.timer);
              this.timer = null;
            }
          } else {
            // Show blockchain sync progress
            const syncProgress = Math.min(verificationProgress * 100, 99);
            const remainingBlocks = totalHeaders - currentBlocks;

            // Calculate estimated time to completion
            let progressMessage = `Loading blockchain... Block ${currentBlocks.toLocaleString()} of ${totalHeaders.toLocaleString()}`;

            if (remainingBlocks > 0 && verificationProgress > 0) {
              // Estimate time remaining based on verification progress
              const blocksPerSecond = currentBlocks / ((1 - verificationProgress) > 0 ? (Date.now() / 1000) : 1);
              const secondsRemaining = remainingBlocks / Math.max(blocksPerSecond, 1);

              if (secondsRemaining < 3600) {
                const minutesRemaining = Math.ceil(secondsRemaining / 60);
                progressMessage += ` (est. ${minutesRemaining} min remaining)`;
              } else {
                const hoursRemaining = Math.ceil(secondsRemaining / 3600);
                progressMessage += ` (est. ${hoursRemaining} hour${hoursRemaining > 1 ? 's' : ''} remaining)`;
              }
            }

            this.setState({
              progress: syncProgress,
              message: progressMessage,
            });
          }
        })
        .catch((error) => {
          this.requestOnTheFly = false;

          const { startTime, connectionAttempts } = this.state;
          const elapsedSeconds = (Date.now() - startTime) / 1000;
          const newConnectionAttempts = connectionAttempts + 1;

          // Give the daemon at least 30 seconds to start before showing connection error
          const DAEMON_STARTUP_GRACE_PERIOD = 30; // seconds
          const isWithinGracePeriod = elapsedSeconds < DAEMON_STARTUP_GRACE_PERIOD;

          let statusMessage: string;
          if (isWithinGracePeriod) {
            // During grace period, show friendly startup messages
            if (newConnectionAttempts <= 3) {
              statusMessage = 'Starting Zclassic daemon...';
            } else if (newConnectionAttempts <= 7) {
              statusMessage = 'Daemon initializing, please wait...';
            } else {
              statusMessage = `Daemon starting... (${Math.floor(elapsedSeconds)}s)`;
            }
          } else {
            // After grace period, show the actual error
            statusMessage = error.message === 'Something went wrong'
              ? 'Unable to connect to Zclassic daemon'
              : error.message;
          }

          const isRpcOff = Math.trunc(error.statusCode / 100) === 5;

          this.setState({
            message: statusMessage,
            connectionAttempts: newConnectionAttempts,
          });

          // if rpc is off (500) we have probably started the daemon process and are waiting it to boot up
          if (isRpcOff || isWithinGracePeriod) {
            this.setState((state) => {
              const newProgress = state.progress > 70 ? state.progress + 2.5 : state.progress + 5;
              return { progress: newProgress > 95 ? 95 : newProgress };
            });
          }
        });
    };

    render() {
      const { isRunning, progress, message } = this.state;

      if (isRunning) {
        return <WrappedComponent {...this.props} {...this.state} />;
      }

      return <LoadingScreen progress={progress} message={message} />;
    }
  };
