// @flow

import cp from 'child_process';
import path from 'path';
import os from 'os';
import fs from 'fs';
/* eslint-disable import/no-extraneous-dependencies */
import isDev from 'electron-is-dev';
import type { ChildProcess } from 'child_process';
import eres from 'eres';
import uuid from 'uuid/v4';
import findProcess from 'find-process';

/* eslint-disable-next-line import/named */
import { mainWindow } from '../electron';
import waitForDaemonClose from './wait-for-daemon-close';
import getBinariesPath from './get-binaries-path';
import getOsFolder from './get-os-folder';
import getDaemonName from './get-daemon-name';
import fetchParams from './run-fetch-params';
import { locateZclassicConf } from './locate-zclassic-conf';
import { log } from './logger';
import store from '../electron-store';
import { parseZclassicConf, parseCmdArgs, generateArgsFromConf } from './parse-zclassic-conf';
import { isTestnet } from '../is-testnet';
import { getDaemonProcessId } from './get-daemon-process-id';
import { checkAndInstallBootstrap } from './pre-daemon-bootstrap';
import {
  EMBEDDED_DAEMON,
  ZCLASSIC_NETWORK,
  TESTNET,
  MAINNET,
} from '../../app/constants/zclassic-network';

const getDaemonOptions = ({
  useDefaultZclassicConf, optionsFromZclassicConf,
}) => {
  /*
    -showmetrics
        Show metrics on stdout
    -metricsui
        Set to 1 for a persistent metrics screen, 0 for sequential metrics
        output
    -metricsrefreshtime
        Number of seconds between metrics refreshes
  */

  const defaultOptions = [
    '-showmetrics=1',
    '-metricsui=0',
    '-metricsrefreshtime=1',
    // ...(isTestnet() ? ['-testnet', '-addnode=testnet.z.classic'] : ['']),
    // Overwriting the settings with values taken from "zclassic.conf"
    ...optionsFromZclassicConf,
  ];

  if (useDefaultZclassicConf) defaultOptions.push(`-conf=${locateZclassicConf()}`);

  return Array.from(new Set([...defaultOptions, ...optionsFromZclassicConf]));
};

let resolved = false;

const ZCLASSICD_PROCESS_NAME = getDaemonName();
const DAEMON_PROCESS_PID = 'DAEMON_PROCESS_PID';
const DAEMON_START_TIME = 'DAEMON_START_TIME';

let isWindowOpened = false;

const sendToRenderer = (event: string, message: Object, shouldLog: boolean = true) => {
  if (shouldLog) {
    log(message);
  }

  if (isWindowOpened) {
    if (!mainWindow.isDestroyed()) {
      mainWindow.webContents.send(event, message);
    }
  } else {
    const interval = setInterval(() => {
      if (isWindowOpened) {
        mainWindow.webContents.send(event, message);
        clearInterval(interval);
      }
    }, 1000);
  }
};

// eslint-disable-next-line
const runDaemon: () => Promise<?ChildProcess> = () => new Promise(async (resolve, reject) => {
  mainWindow.webContents.on('dom-ready', () => {
    isWindowOpened = true;
  });
  store.delete('rpcconnect');
  store.delete('rpcport');
  store.delete(DAEMON_PROCESS_PID);
  store.delete(DAEMON_START_TIME);

  const processName = path.join(getBinariesPath(), getOsFolder(), 'zclassicd');
  const isRelaunch = Boolean(process.argv.find(arg => arg === '--relaunch'));

  // STEP 0: Check if bootstrap is needed BEFORE starting daemon
  // This prevents daemon from creating empty blockchain directories
  log('Checking if blockchain bootstrap is needed...');
  const [bootstrapErr, shouldProceed] = await eres(checkAndInstallBootstrap());

  if (bootstrapErr || !shouldProceed) {
    log('Bootstrap check failed or user cancelled - aborting daemon startup');
    return reject(new Error('Bootstrap installation required but not completed'));
  }

  log('Bootstrap check complete - proceeding with daemon startup');

  if (!mainWindow.isDestroyed()) mainWindow.webContents.send('zclassicd-params-download', 'Fetching params...');

  sendToRenderer('zclassic-daemon-status', {
    error: false,
    status:
        'Downloading network params, this may take some time depending on your connection speed',
  });

  const [err] = await eres(fetchParams());

  if (err) {
    sendToRenderer('zclassic-daemon-status', {
      error: true,
      status: `Error while fetching params: ${err.message}`,
    });

    return reject(new Error(err));
  }

  sendToRenderer('zclassic-daemon-status', {
    error: false,
    status: ' Starting',
  });

  // In case of --relaunch on argv, we need wait to close the old zclassic daemon
  // a workaround is use a interval to check if there is a old process running
  if (isRelaunch) {
    await waitForDaemonClose(ZCLASSICD_PROCESS_NAME);
  }

  // This will parse and save rpcuser and rpcpassword in the store
  let [, optionsFromZclassicConf] = await eres(parseZclassicConf());

  // if the user has a custom datadir and doesn't have a zclassic.conf in that folder,
  // we need to use the default zclassic.conf
  let useDefaultZclassicConf = false;

  if (optionsFromZclassicConf.datadir) {
    const hasDatadirConf = fs.existsSync(path.join(optionsFromZclassicConf.datadir, 'zclassic.conf'));

    if (hasDatadirConf) {
      optionsFromZclassicConf = await parseZclassicConf(
        path.join(String(optionsFromZclassicConf.datadir), 'zclassic.conf'),
      );
    } else {
      useDefaultZclassicConf = true;
    }
  }

  if (optionsFromZclassicConf.rpcconnect) store.set('rpcconnect', optionsFromZclassicConf.rpcconnect);
  if (optionsFromZclassicConf.rpcport) store.set('rpcport', optionsFromZclassicConf.rpcport);
  if (optionsFromZclassicConf.rpcuser) store.set('rpcuser', optionsFromZclassicConf.rpcuser);
  if (optionsFromZclassicConf.rpcpassword) store.set('rpcpassword', optionsFromZclassicConf.rpcpassword);

  log('Searching for daemon PID file (zcashd.pid or zclassicd.pid)');
  const daemonProcessId = getDaemonProcessId(optionsFromZclassicConf.datadir);

  if (daemonProcessId) {
    store.set(EMBEDDED_DAEMON, false);
    log(
      // eslint-disable-next-line
        `A Zclassic daemon was found running in PID: ${daemonProcessId}. Starting Zipher in external daemon mode.`,
    );

    // Command line args override zclassic.conf
    const [{ cmd, pid }] = await findProcess('pid', daemonProcessId);

    store.set(DAEMON_PROCESS_PID, pid);

    // We need grab the rpcuser and rpcpassword from either process args or zclassic.conf
    const {
      rpcuser, rpcpassword, rpcconnect, rpcport, testnet: isTestnetFromCmd,
    } = parseCmdArgs(
      cmd,
    );

    store.set(
      ZCLASSIC_NETWORK,
      isTestnetFromCmd === '1' || optionsFromZclassicConf.testnet === '1' ? TESTNET : MAINNET,
    );

    if (rpcuser) store.set('rpcuser', rpcuser);
    if (rpcpassword) store.set('rpcpassword', rpcpassword);
    if (rpcport) store.set('rpcport', rpcport);
    if (rpcconnect) store.set('rpcconnect', rpcconnect);

    return resolve();
  }

  log(
    "No external Zclassic daemon detected. Starting built-in daemon...",
  );

  store.set(EMBEDDED_DAEMON, true);

  if (!isRelaunch) {
    store.set(ZCLASSIC_NETWORK, optionsFromZclassicConf.testnet === '1' ? TESTNET : MAINNET);
  }

  // Generate credentials if not in zclassic.conf
  let rpcuser = optionsFromZclassicConf.rpcuser;
  let rpcpassword = optionsFromZclassicConf.rpcpassword;

  // Prepare config lines to write
  const confPath = locateZclassicConf();
  const configLines = [];

  if (!rpcuser) {
    rpcuser = uuid();
    configLines.push(`rpcuser=${rpcuser}`);
  }
  if (!rpcpassword) {
    rpcpassword = uuid();
    configLines.push(`rpcpassword=${rpcpassword}`);
  }
  // Always ensure txindex is enabled
  if (optionsFromZclassicConf.txindex !== '1') {
    configLines.push('txindex=1');
  }

  // Write missing config to zclassic.conf
  if (configLines.length > 0) {
    fs.appendFileSync(confPath, '\n' + configLines.join('\n') + '\n');
    log(`Configuration written to zclassic.conf: ${configLines.join(', ')}`);
  }

  // Also save credentials to electron-store so the app can read them for RPC connections
  store.set('rpcuser', rpcuser);
  store.set('rpcpassword', rpcpassword);

  if (isDev) log('Daemon configuration loaded from zclassic.conf');

  const childProcess = cp.spawn(
    processName,
    getDaemonOptions({
      useDefaultZclassicConf,
      optionsFromZclassicConf: generateArgsFromConf(optionsFromZclassicConf),
    }),
    {
      stdio: ['ignore', 'pipe', 'pipe'],
    },
  );

  store.set(DAEMON_PROCESS_PID, childProcess.pid);

  childProcess.stdout.on('data', (data) => {
    if (!resolved) {
      store.set(DAEMON_START_TIME, Date.now());
      resolve(childProcess);
      resolved = true;
    }
  });

  childProcess.stderr.on('data', (data) => {
    log(data.toString());
    reject(new Error(data.toString()));
  });

  childProcess.on('error', reject);

  if (os.platform() === 'win32') {
    resolved = true;
    resolve(childProcess);
  }
});

// eslint-disable-next-line
export default runDaemon;
