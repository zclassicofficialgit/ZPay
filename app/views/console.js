// @flow

import React, { PureComponent, Fragment } from 'react';
import styled, { withTheme } from 'styled-components';
import uuid from 'uuid/v4';
import eres from 'eres';
import humanizeDuration from 'humanize-duration';

import { TextComponent } from '../components/text';
import { ZClassicPixelLogo } from '../components/zclassic-pixel-logo';

import { DARK } from '../constants/themes';
import rpc from '../../services/api';
import store from '../../config/electron-store';

const Wrapper = styled.div`
  max-height: 100%;
  overflow-y: auto;
  background-color: ${props => props.theme.colors.consoleBg};
  border: 1px solid ${props => props.theme.colors.consoleBorder};
  margin-top: ${props => props.theme.layoutContentPaddingTop};
  border-radius: ${props => props.theme.boxBorderRadius};
  padding: 30px;
`;

const ConsoleText = styled(TextComponent)`
  font-family: 'Source Code Pro', monospace;
`;

const LogoWrapper = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
`;

const breakpoints = [1, 4, 7, 10, 13];

type Props = {
  theme: AppTheme,
};

type State = {
  blockHeight: number,
  connections: number,
  networkSolutionsRate: number,
};

class Component extends PureComponent<Props, State> {
  interval: ?IntervalID = null;

  requestOnTheFly: boolean = false;

  state = {
    blockHeight: 0,
    connections: 0,
    networkSolutionsRate: 0,
  };

  componentDidMount() {
    this.interval = setInterval(() => this.update(), 3000);
  }

  componentWillUnmount() {
    clearInterval(this.interval);
  }

  update = async () => {
    if (this.requestOnTheFly) return;

    this.requestOnTheFly = true;

    const [err, result] = await eres(Promise.all([rpc.getinfo(), rpc.getmininginfo()]));

    if (err) return;

    this.setState(
      {
        blockHeight: result[0].blocks,
        connections: result[0].connections,
        networkSolutionsRate: result[1].networksolps,
      },
      () => {
        this.requestOnTheFly = false;
      },
    );
  };

  getLog = (state: State) => `
    Thank you for running a Zclassic node!
    You're helping to strengthen the network and contributing to a social good :)
    In order to ensure you are adequately protecting your privacy when using Zclassic, please see <https://z.cash/support/security/>.

    Block height | ${state.blockHeight}
    Connections | ${state.connections}
    Network solution rate | ${state.networkSolutionsRate} Sol/s

    Started ${humanizeDuration(new Date() - new Date(store.get('DAEMON_START_TIME')), {
    round: true,
  })} ago
  \n
  ------------------------------------------
  `;

  render() {
    const { theme } = this.props;

    return (
      <Wrapper id='console-wrapper'>
        <Fragment>
          <LogoWrapper>
            <ZClassicPixelLogo
              size="12px"
              primaryColor={theme.mode === DARK ? '#FFB800' : '#FF9500'}
              secondaryColor={theme.mode === DARK ? '#FF6B00' : '#FF5500'}
            />
          </LogoWrapper>
          {this.getLog(this.state)
            .split('\n')
            .map((item, idx) => (
              <Fragment key={uuid()}>
                <ConsoleText value={item} />
                {breakpoints.includes(idx) ? <br /> : null}
              </Fragment>
            ))}
        </Fragment>
      </Wrapper>
    );
  }
}

export const ConsoleView = withTheme(Component);
