// @flow

import React, { Component } from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import { BigNumber } from 'bignumber.js';
import eres from 'eres';

import rpc from '../../services/api';
import electronStore from '../../config/electron-store';
import { formatNumber } from '../utils/format-number';
import getZclPrice from '../../services/zcl-price';
import { PrivacyCheck } from '../components/privacy-check';
import { StatusPillContainer } from '../containers/status-pill';
import { MAC80S } from '../constants/themes';
import { BACKUP_MANAGER_ROUTE } from '../constants/routes';
import { loadWalletSummary, loadWalletSummarySuccess, loadWalletSummaryError } from '../redux/modules/wallet';

import type { AppState } from '../types/app-state';

const DesktopContainer = styled.div`
  width: 100%;
  height: 100vh;
  background: ${props => props.theme.colors.background};
  position: relative;
  overflow: hidden;
  font-family: Chicago, Geneva, "Lucida Grande", -apple-system, system-ui, sans-serif;
  display: flex;
  flex-direction: column;
`;

const MenuBar = styled.div`
  height: 20px;
  background: ${props => props.theme.colors.headerBackground};
  border-bottom: 1px solid ${props => props.theme.colors.border};
  color: ${props => props.theme.colors.headerTitle};
  display: flex;
  align-items: center;
  padding: 0 10px;
  font-size: 12px;
  font-weight: bold;
`;

const AppleLogo = styled.span`
  font-size: 14px;
  margin-right: 20px;
  cursor: pointer;
`;

const MenuItem = styled.span`
  margin: 0 15px;
  cursor: pointer;
  position: relative;
  color: ${props => props.theme.colors.headerTitle};
  &:hover {
    background: ${props => props.theme.colors.sidebarItemActive};
    color: ${props => props.theme.colors.buttonPrimaryText};
  }
`;

const Desktop = styled.div`
  width: 100%;
  flex: 1;
  background: ${props => props.theme.colors.backgroundDark};
  background-image:
    repeating-linear-gradient(
      0deg,
      transparent,
      transparent 2px,
      rgba(0, 0, 0, 0.03) 2px,
      rgba(0, 0, 0, 0.03) 4px
    ),
    repeating-linear-gradient(
      90deg,
      transparent,
      transparent 2px,
      rgba(0, 0, 0, 0.03) 2px,
      rgba(0, 0, 0, 0.03) 4px
    );
  padding: 20px;
  display: grid;
  grid-template-columns: repeat(auto-fill, 100px);
  grid-gap: 30px;
  align-content: start;
`;

const Icon = styled.div`
  width: 80px;
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  text-decoration: none;
  color: ${props => props.theme.colors.text};

  &:active {
    filter: invert(100%);
  }
`;

const IconImage = styled.div`
  width: 48px;
  height: 48px;
  background: ${props => props.theme.colors.cardBackground};
  border: 2px solid ${props => props.theme.colors.border};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  margin-bottom: 4px;
  box-shadow:
    1px 1px 0 ${props => props.theme.colors.border},
    2px 2px 0 ${props => props.theme.colors.border};

  ${Icon}:hover & {
    background: ${props => props.theme.colors.sidebarItemActive};
    color: ${props => props.theme.colors.buttonPrimaryText};
  }
`;

const IconLabel = styled.div`
  font-size: 11px;
  text-align: center;
  background: ${props => props.selected ? props.theme.colors.sidebarItemActive : 'transparent'};
  color: ${props => props.selected ? props.theme.colors.buttonPrimaryText : props.theme.colors.text};
  padding: 2px 4px;
  max-width: 80px;
  word-wrap: break-word;
`;

const TrashIcon = styled(Icon)`
  position: absolute;
  bottom: 50px;  /* Increased from 20px to avoid overlap with status bar */
  right: 20px;
`;

const Clock = styled.div`
  position: absolute;
  right: 10px;
  top: 2px;
  font-size: 12px;
  font-weight: normal;
`;

const StatusBar = styled.div`
  height: 30px;
  background: ${props => props.theme.colors.headerBackground};
  border-top: 1px solid ${props => props.theme.colors.border};
  color: ${props => props.theme.colors.text};
  display: flex;
  align-items: center;
  justify-content: space-around;
  padding: 0 10px;
  font-size: 11px;
  font-weight: normal;
`;

const StatusItem = styled.div`
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 0 10px;
  border-right: 1px solid ${props => props.theme.colors.borderLight};

  &:last-child {
    border-right: none;
  }
`;

const StatusLabel = styled.span`
  font-weight: bold;
  margin-right: 3px;
  color: ${props => props.theme.colors.text};
`;

const StatusValue = styled.span`
  color: ${props => props.positive ? props.theme.colors.success : props.negative ? props.theme.colors.error : props.theme.colors.text};
`;

const QuoteModal = styled.div`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 500px;
  max-width: 90vw;
  background: ${props => props.theme.colors.cardBackground};
  border: 2px solid #000000;
  box-shadow: 4px 4px 0 #000000, 8px 8px 0 #808080;
  padding: 0;
  z-index: 10000;
  font-family: Chicago, Geneva, sans-serif;
`;

const QuoteModalTitle = styled.div`
  background: linear-gradient(to right, #000080, #4169E1);
  color: #FFFFFF;
  padding: 6px 10px;
  font-weight: bold;
  display: flex;
  justify-content: space-between;
  align-items: center;
  user-select: none;
`;

const QuoteModalContent = styled.div`
  padding: 20px;
  font-size: 13px;
  line-height: 1.6;
  max-height: 60vh;
  overflow-y: auto;
`;

const QuoteText = styled.p`
  font-style: italic;
  margin: 0 0 15px 0;
  color: ${props => props.theme.colors.text};
`;

const QuoteAuthor = styled.p`
  font-weight: bold;
  text-align: right;
  margin: 0;
  color: ${props => props.theme.colors.text};
`;

const QuoteCloseButton = styled.span`
  cursor: pointer;
  width: 16px;
  height: 16px;
  background: #C0C0C0;
  border: 1px solid #000000;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 10px;
  color: #000000;
  font-weight: bold;

  &:hover {
    background: #DFDFDF;
  }

  &:active {
    background: #808080;
  }
`;

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 9999;
`;

type Props = {
  history: Object,
  balance: number,
};

type State = {
  currentTime: string,
  selectedIcon: ?string,
  zclPrice: number,
  maxSupply: string,
  currentSupply: string,
  blockHeight: number,
  networkHashrate: string,
  connections: number,
  showPrivacyCheck: boolean,
  showQuote: boolean,
  currentQuote: ?{ text: string, author: string },
};

class MacDesktopViewComponent extends Component<Props, State> {
  timeInterval: IntervalID;
  blockchainInterval: IntervalID;

  // Cypherpunk and Privacy Quotes
  quotes = [
    { text: "Privacy is necessary for an open society in the electronic age. Privacy is not secrecy. A private matter is something one doesn't want the whole world to know, but a secret matter is something one doesn't want anybody to know. Privacy is the power to selectively reveal oneself to the world.", author: "Eric Hughes, A Cypherpunk's Manifesto" },
    { text: "We must defend our own privacy if we expect to have any.", author: "Eric Hughes" },
    { text: "We are defending our privacy with cryptography, with anonymous mail-forwarding systems, with digital signatures, and with electronic money.", author: "Eric Hughes" },
    { text: "The technologies of the past did not allow for strong privacy, but electronic technologies do.", author: "Eric Hughes" },
    { text: "For greater privacy, it's best to use bitcoin addresses only once.", author: "Satoshi Nakamoto" },
    { text: "We have to trust them with our privacy, trust them not to let identity thieves drain our accounts.", author: "Satoshi Nakamoto" },
    { text: "The possibility to be anonymous or pseudonymous relies on you not revealing any identifying information about yourself in connection with the bitcoin addresses you use.", author: "Satoshi Nakamoto" },
    { text: "Here we are faced with the problems of loss of privacy, creeping computerization, massive databases, more centralization - and Chaum offers a completely different direction to go in, one which puts power into the hands of individuals rather than governments and corporations. The computer can be used as a tool to liberate and protect people, rather than to control them.", author: "Hal Finney" },
    { text: "Arguing that you don't care about the right to privacy because you have nothing to hide is no different than saying you don't care about free speech because you have nothing to say.", author: "Edward Snowden" },
    { text: "Under observation, we act less free, which means we effectively are less free.", author: "Edward Snowden" },
    { text: "Privacy matters; privacy is what allows us to determine who we are and who we want to be.", author: "Edward Snowden" },
    { text: "A child born today will grow up with no conception of privacy at all. They'll never know what it means to have a private moment to themselves an unrecorded, unanalyzed thought.", author: "Edward Snowden" },
    { text: "These programs were never about terrorism: they're about economic spying, social control, and diplomatic manipulation. They're about power.", author: "Edward Snowden" },
    { text: "Bitcoin secures itself and you don't need to ask permission.", author: "Nick Szabo" },
    { text: "Every time somebody gets censored, boom... they become a Bitcoin fan.", author: "Nick Szabo" },
    { text: "It's an arms race and so far it's partly winning, but mostly losing at this point unfortunately.", author: "Nick Szabo on Privacy" },
    { text: "People who were involved in the Cypherpunks are extremely happy that bitcoin has materialized.", author: "Adam Back" },
    { text: "We must come together and create systems which allow anonymous transactions to take place.", author: "Eric Hughes" },
    { text: "No system of mass surveillance has existed in any society, that we know of to this point, that has not been abused.", author: "Edward Snowden" },
    { text: "I can't in good conscience allow the U.S. government to destroy privacy, internet freedom and basic liberties for people around the world with this massive surveillance machine they're secretly building.", author: "Edward Snowden" },
    { text: "Cypherpunks write code.", author: "Eric Hughes" },
    { text: "The right to privacy is the right to be left alone, to live your life without unwarranted surveillance and interference.", author: "Cypherpunk Motto" },
  ];

  state = {
    currentTime: '',
    selectedIcon: null,
    zclPrice: 0,
    maxSupply: '11,462,487',
    currentSupply: '0',
    blockHeight: 0,
    networkHashrate: '0',
    connections: 0,
    showPrivacyCheck: false, // Don't show by default
    showQuote: false,
    currentQuote: null,
  };

  componentDidMount() {
    this.updateTime();
    this.fetchBlockchainInfo();
    this.fetchZclPrice();
    this.loadWalletBalance(); // Load wallet balance on mount

    this.timeInterval = setInterval(() => this.updateTime(), 1000);
    this.blockchainInterval = setInterval(() => {
      this.fetchBlockchainInfo();
      this.fetchZclPrice();
      this.loadWalletBalance(); // Also reload wallet balance periodically
    }, 60000); // Update every 60 seconds (StatusPillContainer handles frequent sync checks)
  }

  componentDidUpdate(prevProps: Props) {
    // Force re-render when balance changes from 0 to actual value
    if (prevProps.balance === 0 && this.props.balance > 0) {
      this.forceUpdate();
    }
  }

  componentWillUnmount() {
    clearInterval(this.timeInterval);
    clearInterval(this.blockchainInterval);
  }

  fetchBlockchainInfo = async () => {
    try {
      // Get blockchain info
      const info = await rpc.getblockchaininfo();
      if (info) {
        this.setState({
          blockHeight: info.blocks || 0,
        });
      }

      // Get network info
      const networkInfo = await rpc.getnetworkinfo();
      if (networkInfo) {
        this.setState({
          connections: networkInfo.connections || 0,
        });
      }

      // Get mining info
      const miningInfo = await rpc.getmininginfo();
      if (miningInfo) {
        const hashrate = miningInfo.networkhashps || 0;
        const formattedHashrate = hashrate > 1000000000
          ? `${(hashrate / 1000000000).toFixed(2)} GH/s`
          : hashrate > 1000000
          ? `${(hashrate / 1000000).toFixed(2)} MH/s`
          : hashrate > 1000
          ? `${(hashrate / 1000).toFixed(2)} KH/s`
          : `${hashrate.toFixed(0)} H/s`;

        this.setState({
          networkHashrate: formattedHashrate,
        });
      }

      // Get actual circulating supply from UTXO set
      const txoutsetInfo = await rpc.gettxoutsetinfo();
      const actualSupply = txoutsetInfo ? txoutsetInfo.total_amount : 0;

      this.setState({
        currentSupply: formatNumber({ value: actualSupply, maxDecimals: 0 }),
      });
    } catch (error) {
      console.error('Error fetching blockchain info:', error);
    }
  };

  fetchZclPrice = async () => {
    try {
      const priceData = await getZclPrice();
      if (priceData && priceData.USD) {
        this.setState({ zclPrice: priceData.USD });
        electronStore.set('ZCL_DOLLAR_PRICE', String(priceData.USD));
      }
    } catch (error) {
      // Try to get from store if API fails
      const storedPrice = electronStore.get('ZCL_DOLLAR_PRICE');
      if (storedPrice) {
        this.setState({ zclPrice: parseFloat(storedPrice) });
      }
    }
  };

  loadWalletBalance = async () => {
    const { loadWalletData } = this.props;
    if (loadWalletData) {
      try {
        await loadWalletData();
      } catch (error) {
        console.error('Error loading wallet balance:', error);
      }
    }
  };

  updateTime = () => {
    const now = new Date();
    const time = now.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
    this.setState({ currentTime: time });
  };

  handleIconClick = (route: ?string, iconName: string, action: ?Function) => {
    this.setState({ selectedIcon: iconName });
    if (action) {
      action();
    } else if (route) {
      setTimeout(() => {
        this.props.history.push(route);
      }, 200);
    }
  };

  togglePrivacyCheck = () => {
    this.setState(prevState => ({ showPrivacyCheck: !prevState.showPrivacyCheck }));
  };

  showRandomQuote = () => {
    const randomIndex = Math.floor(Math.random() * this.quotes.length);
    this.setState({
      showQuote: true,
      currentQuote: this.quotes[randomIndex],
    });
  };

  closeQuote = () => {
    this.setState({ showQuote: false });
  };

  render() {
    const {
      currentTime,
      selectedIcon,
      zclPrice,
      maxSupply,
      currentSupply,
      blockHeight,
      networkHashrate,
      connections,
      showPrivacyCheck,
      showQuote,
      currentQuote,
    } = this.state;

    const { balance = 0, fetchState } = this.props;

    const desktopIcons = [
      { id: 'dashboard', label: 'Dashboard', icon: '📊', route: '/dashboard' },
      { id: 'send', label: 'Send ZCL', icon: '📤', route: '/send' },
      { id: 'receive', label: 'Receive ZCL', icon: '📥', route: '/receive' },
      { id: 'transactions', label: 'Transactions', icon: '📜', route: '/transactions' },
      { id: 'explorer', label: 'Explorer', icon: '🔍', route: '/explorer' },
      { id: 'backup', label: 'Backup Manager', icon: '💾', route: BACKUP_MANAGER_ROUTE },
      { id: 'privacy', label: 'Privacy Check', icon: '🛡️', route: null, action: this.togglePrivacyCheck },
      { id: 'console', label: 'Console', icon: '💻', route: '/console' },
      { id: 'settings', label: 'Control Panel', icon: '⚙️', route: '/settings' },
    ];

    return (
      <DesktopContainer>
        {/* Hidden StatusPill to keep nodeSyncType updated in Redux */}
        <div style={{ display: 'none' }}>
          <StatusPillContainer />
        </div>
        <MenuBar>
          <AppleLogo onClick={this.showRandomQuote}>🍎</AppleLogo>
          <MenuItem>File</MenuItem>
          <MenuItem>Edit</MenuItem>
          <MenuItem>View</MenuItem>
          <MenuItem onClick={this.togglePrivacyCheck}>Privacy</MenuItem>
          <Clock>{currentTime}</Clock>
        </MenuBar>

        <Desktop>
          {desktopIcons.map(item => (
            <Icon
              key={item.id}
              onClick={() => this.handleIconClick(item.route, item.id, item.action)}
            >
              <IconImage>{item.icon}</IconImage>
              <IconLabel selected={selectedIcon === item.id}>
                {item.label}
              </IconLabel>
            </Icon>
          ))}

          <TrashIcon>
            <IconImage>🗑️</IconImage>
            <IconLabel>Trash</IconLabel>
          </TrashIcon>

          {showPrivacyCheck && (
            <PrivacyCheck onClose={this.togglePrivacyCheck} />
          )}
        </Desktop>

        <StatusBar>
          <StatusItem>
            <StatusLabel>Price:</StatusLabel>
            <StatusValue positive={zclPrice > 0}>
              ${formatNumber({ value: zclPrice, maxDecimals: 2 })}
            </StatusValue>
          </StatusItem>

          <StatusItem>
            <StatusLabel>Balance:</StatusLabel>
            <StatusValue>
              {fetchState && fetchState !== 'INITIAL'
                ? `${formatNumber({ value: balance, maxDecimals: 2 })} ZCL`
                : '... ZCL'}
            </StatusValue>
          </StatusItem>

          <StatusItem>
            <StatusLabel>Block:</StatusLabel>
            <StatusValue>{formatNumber({ value: blockHeight, maxDecimals: 0 })}</StatusValue>
          </StatusItem>

          <StatusItem>
            <StatusLabel>Supply:</StatusLabel>
            <StatusValue>{currentSupply}/{maxSupply}</StatusValue>
          </StatusItem>

          <StatusItem>
            <StatusLabel>Hashrate:</StatusLabel>
            <StatusValue>{networkHashrate}</StatusValue>
          </StatusItem>

          <StatusItem>
            <StatusLabel>Peers:</StatusLabel>
            <StatusValue positive={connections > 0}>{connections}</StatusValue>
          </StatusItem>
        </StatusBar>

        {/* Quote Modal */}
        {showQuote && currentQuote && (
          <>
            <Overlay onClick={this.closeQuote} />
            <QuoteModal>
              <QuoteModalTitle>
                🔐 Cypherpunk Wisdom
                <QuoteCloseButton onClick={this.closeQuote}>✕</QuoteCloseButton>
              </QuoteModalTitle>
              <QuoteModalContent>
                <QuoteText>"{currentQuote.text}"</QuoteText>
                <QuoteAuthor>— {currentQuote.author}</QuoteAuthor>
              </QuoteModalContent>
            </QuoteModal>
          </>
        )}
      </DesktopContainer>
    );
  }
}

// Connect to Redux to get balance and wallet data
const mapStateToProps = ({ sendStatus, walletSummary }: AppState) => ({
  balance: walletSummary.total || 0, // Use total balance
  shieldedBalance: walletSummary.shielded || 0,
  transparentBalance: walletSummary.transparent || 0,
  totalBalance: walletSummary.total || 0,
  fetchState: walletSummary.fetchState,
});

const mapDispatchToProps = (dispatch: any) => ({
  loadWalletData: async () => {
    dispatch(loadWalletSummary());

    const [walletErr, walletSummary] = await eres(rpc.z_gettotalbalance(0));
    const [confirmedWalletErr, confirmedWalletSummary] = await eres(rpc.z_gettotalbalance(1));
    const [zAddressesErr, zAddresses = []] = await eres(rpc.z_listaddresses());
    const [transactionsErr, transactions = []] = await eres(rpc.listtransactions());
    const [priceErr, zclPriceData] = await eres(getZclPrice());

    if (walletErr || confirmedWalletErr) {
      console.error('Failed to load wallet balance:', walletErr || confirmedWalletErr);
      return dispatch(
        loadWalletSummaryError({
          error: 'Failed to load wallet data',
        }),
      );
    }

    // Calculate unconfirmed balance
    let unconfirmedBalance = 0;
    if (walletSummary && confirmedWalletSummary) {
      const totalWithUnconfirmed = new BigNumber(walletSummary.private || 0);
      const confirmedOnly = new BigNumber(confirmedWalletSummary.private || 0);
      unconfirmedBalance = totalWithUnconfirmed.minus(confirmedOnly).toNumber();
    }

    const totalBalance = confirmedWalletSummary ? new BigNumber(confirmedWalletSummary.total || 0).toNumber() : 0;
    const shieldedBalance = confirmedWalletSummary ? new BigNumber(confirmedWalletSummary.private || 0).toNumber() : 0;
    const transparentBalance = confirmedWalletSummary ? new BigNumber(confirmedWalletSummary.transparent || 0).toNumber() : 0;

    console.log('MacDesktop loadWalletData - Total:', totalBalance, 'Shielded:', shieldedBalance, 'Transparent:', transparentBalance);

    return dispatch(
      loadWalletSummarySuccess({
        total: totalBalance,
        shielded: shieldedBalance,
        transparent: transparentBalance,
        unconfirmed: unconfirmedBalance,
        addresses: zAddresses || [],
        transactions: transactions || [],
        zclPrice: zclPriceData?.USD || 0,
      }),
    );
  },
});

export const MacDesktopView = connect(mapStateToProps, mapDispatchToProps)(MacDesktopViewComponent);