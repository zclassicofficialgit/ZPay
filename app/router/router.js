// @flow

import React from 'react';
import {
  Route, Switch, type Location, type RouterHistory,
} from 'react-router-dom';
import styled from 'styled-components';

import { ScrollTopComponent } from './scroll-top';
import { SidebarContainer } from '../containers/sidebar';
import { DashboardContainer } from '../containers/dashboard';
import { TransactionsContainer } from '../containers/transactions';
import { SendContainer } from '../containers/send';
import { ReceiveContainer } from '../containers/receive';
import { SettingsContainer } from '../containers/settings';
import { NotFoundView } from '../views/not-found';
import { ConsoleView } from '../views/console';
import { MacDesktopView } from '../views/mac-desktop';
import { ExplorerViewComponent } from '../views/explorer';
import { BackupManagerContainer } from '../containers/backup-manager';
import { MacWindowComponent } from '../components/mac-window';
import { AppContainer as LayoutComponent } from '../containers/app';
import { HeaderComponent } from '../components/header';

import {
  DASHBOARD_ROUTE,
  SEND_ROUTE,
  RECEIVE_ROUTE,
  SETTINGS_ROUTE,
  CONSOLE_ROUTE,
  TRANSACTIONS_ROUTE,
  EXPLORER_ROUTE,
  BACKUP_MANAGER_ROUTE,
} from '../constants/routes';

const FullWrapper = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
`;

const ContentWrapper = styled.div`
  display: flex;
  flex-direction: row;
  width: 100vw;
`;

const getTitle = (path: string) => {
  if (path === '/') return 'Finder';

  const route = path.split('/')[1];
  switch(route) {
    case 'dashboard': return 'Zipher Dashboard';
    case 'send': return 'Send ZCL';
    case 'receive': return 'Receive ZCL';
    case 'transactions': return 'Transaction History';
    case 'settings': return 'Control Panel';
    case 'console': return 'Console';
    case 'explorer': return 'ZClassic Explorer';
    case 'backup-manager': return 'Backup Manager';
    default: return 'Zipher';
  }
};

export const RouterComponent = ({
  location,
  history,
}: {
  location: Location,
  history: RouterHistory,
}) => {
  // Show Mac Desktop for root path
  if (location.pathname === '/') {
    return <MacDesktopView history={history} />;
  }

  // For other routes, show them in Mac-style windows
  return (
    <MacWindowComponent title={getTitle(location.pathname)}>
      <ScrollTopComponent>
        <Switch>
          <Route exact path={DASHBOARD_ROUTE} render={(props) => <DashboardContainer {...props} />} />
          <Route path={`${SEND_ROUTE}/:to?`} render={(props) => <SendContainer {...props} />} />
          <Route path={RECEIVE_ROUTE} render={(props) => <ReceiveContainer {...props} />} />
          <Route path={SETTINGS_ROUTE} render={(props) => <SettingsContainer {...props} />} />
          <Route path={CONSOLE_ROUTE} render={(props) => <ConsoleView {...props} />} />
          <Route path={TRANSACTIONS_ROUTE} render={(props) => <TransactionsContainer {...props} />} />
          <Route path={EXPLORER_ROUTE} render={(props) => <ExplorerViewComponent {...props} />} />
          <Route path={BACKUP_MANAGER_ROUTE} render={(props) => <BackupManagerContainer {...props} />} />
          <Route render={(props) => <NotFoundView {...props} />} />
        </Switch>
      </ScrollTopComponent>
    </MacWindowComponent>
  );
};
