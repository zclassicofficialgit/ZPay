// @flow

import React, { PureComponent } from 'react';
import styled from 'styled-components';

import eres from 'eres';
import { WalletSummaryComponent } from '../components/wallet-summary';
import { TransactionDailyComponent } from '../components/transaction-daily';
import { TextComponent } from '../components/text';
import { EmptyTransactionsComponent } from '../components/empty-transactions';
import { ConfirmDialogComponent } from '../components/confirm-dialog';
import { ColumnComponent } from '../components/column';
import { LoaderComponent } from '../components/loader';
import { BootstrapInstaller } from '../components/bootstrap-installer';
import { ModalComponent } from '../components/modal';

import store from '../../config/electron-store';
import { FETCH_STATE } from '../constants/fetch-states';
import { shouldRecommendBootstrap } from '../../services/bootstrap-installer';

import type { MapDispatchToProps, MapStateToProps } from '../containers/dashboard';

import zepioLogo from '../assets/images/zclassic-icon.png';

const ModalContent = styled(ColumnComponent)`
  min-height: 400px;
  align-items: center;
  justify-content: center;

  p {
    word-break: break-word;
  }
`;

const LogoComponent = styled.img`
  max-width: 5rem;
  margin-bottom: 1.5rem;
`;

const TitleComponent = styled(TextComponent)`
  font-size: 18px;
`;

const ContentWrapper = styled.div`
  margin: 0 auto;
  max-width: 350px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

const WelcomeText = styled(TextComponent)`
  line-height: 1.7;
  text-align: center;
  margin-top: 1rem;
`;

const AdditionalText = styled(TextComponent)`
  margin-top: 2rem;
  font-style: italic;
  font-size: 10px;
`;

type Props = MapDispatchToProps & MapStateToProps;

const UPDATE_INTERVAL = 10000;
const DISPLAY_WELCOME_MODAL = 'DISPLAY_WELCOME_MODAL';
const BOOTSTRAP_PROMPT_SHOWN = 'BOOTSTRAP_PROMPT_SHOWN';

export class DashboardView extends PureComponent<Props> {
  interval = null;

  state = {
    showBootstrapInstaller: false,
  };

  async componentDidMount() {
    const { getSummary, isDaemonReady } = this.props;

    getSummary();

    if (isDaemonReady) {
      this.interval = setInterval(() => getSummary(), UPDATE_INTERVAL);
    }

    // Check if bootstrap should be recommended on first launch
    await this.checkBootstrapRecommendation();
  }

  componentWillUnmount() {
    clearInterval(this.interval);
  }

  shouldShowWelcomeModal = () => store.get(DISPLAY_WELCOME_MODAL) !== false;

  checkBootstrapRecommendation = async () => {
    // Only check once per installation
    if (store.get(BOOTSTRAP_PROMPT_SHOWN)) {
      return;
    }

    const [err, shouldRecommend] = await eres(shouldRecommendBootstrap());

    if (!err && shouldRecommend) {
      // Wait a bit before showing the modal to let the welcome modal close first
      setTimeout(() => {
        this.setState({ showBootstrapInstaller: true });
        store.set(BOOTSTRAP_PROMPT_SHOWN, true);
      }, 3000);
    }
  };

  handleCloseBootstrapInstaller = () => {
    this.setState({ showBootstrapInstaller: false });
  };

  handleBootstrapComplete = () => {
    const { getSummary } = this.props;
    this.setState({ showBootstrapInstaller: false });
    // Refresh wallet summary after bootstrap installation
    getSummary();
  };

  render() {
    const {
      total,
      shielded,
      transparent,
      unconfirmed,
      zclPrice,
      addresses,
      transactions,
      fetchState,
    } = this.props;

    const { showBootstrapInstaller } = this.state;

    if (fetchState === FETCH_STATE.INITIALIZING) {
      return <LoaderComponent />;
    }

    return (
      <>
        <WalletSummaryComponent
          total={total}
          shielded={shielded}
          transparent={transparent}
          unconfirmed={unconfirmed}
          zclPrice={zclPrice}
          addresses={addresses}
        />
        {transactions.length === 0 ? (
          <EmptyTransactionsComponent />
        ) : (
          transactions.map(({ day, list }) => (
            <TransactionDailyComponent
              transactionsDate={day}
              transactions={list}
              zclPrice={zclPrice}
              key={day}
            />
          ))
        )}
        {process.env.NODE_ENV !== 'test' && (
          <>
            <ConfirmDialogComponent
              title='Welcome to Zipher Classic'
              onConfirm={(toggle) => {
                store.set(DISPLAY_WELCOME_MODAL, false);
                toggle();
              }}
              onClose={() => store.set(DISPLAY_WELCOME_MODAL, false)}
              showSingleConfirmButton
              singleConfirmButtonText='Hello.'
              isVisible={this.shouldShowWelcomeModal()}
            >
              {() => (
                <ModalContent>
                  <ContentWrapper>
                    <LogoComponent src={zepioLogo} alt='Zipher' />
                    <TitleComponent value='Zipher Classic System 7.0' isBold />
                    <WelcomeText value='Welcome to Zipher - Your Macintosh-inspired Zclassic wallet. Experience the simplicity of 1984 with the privacy technology of today. Clean lines, intuitive design, and uncompromising security.' />
                    <WelcomeText value='Think Different. Transaction Private.' />
                    <AdditionalText value='Please wait while Zipher synchronizes with the Zclassic network. This computer will change everything.' />
                  </ContentWrapper>
                </ModalContent>
              )}
            </ConfirmDialogComponent>
            <ModalComponent isOpen={showBootstrapInstaller}>
              <BootstrapInstaller
                onClose={this.handleCloseBootstrapInstaller}
                onComplete={this.handleBootstrapComplete}
              />
            </ModalComponent>
          </>
        )}
      </>
    );
  }
}
