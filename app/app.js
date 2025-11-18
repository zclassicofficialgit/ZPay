// @flow

import React, { Component, Fragment } from 'react';
import { Provider } from 'react-redux';
import { ConnectedRouter } from 'connected-react-router';
import { ThemeProvider } from 'styled-components';

import { configureStore, history } from './redux/create';
import { Router } from './router/container';
import { appTheme as theme, GlobalStyle } from './theme';

const store = configureStore({});

type Props = {};

export class App extends Component<Props> {
  render() {
    const currentTheme = theme; // Always use Macintosh theme

    return (
      <ThemeProvider theme={currentTheme}>
        <Fragment>
          <GlobalStyle />
          <Provider store={store}>
            <ConnectedRouter history={history}>
              <Router />
            </ConnectedRouter>
          </Provider>
        </Fragment>
      </ThemeProvider>
    );
  }
}
