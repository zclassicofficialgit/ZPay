// @flow

import React, { Component } from 'react';
import styled from 'styled-components';
import { connect } from 'react-redux';
import { BigNumber } from 'bignumber.js';

import rpc from '../../services/api';
import { formatNumber } from '../utils/format-number';
import type { AppState } from '../types/app-state';

const PrivacyContainer = styled.div`
  position: absolute;
  top: ${props => props.top}px;
  left: ${props => props.left}px;
  width: 320px;
  background: ${props => props.theme.colors.cardBackground || '#FFFFFF'};
  border: 2px solid #000000;
  box-shadow:
    2px 2px 0 #000000,
    4px 4px 0 #808080;
  padding: 10px;
  font-family: Chicago, Geneva, sans-serif;
  font-size: 11px;
  z-index: ${props => props.isDragging ? 1000 : 100};
`;

const TitleBar = styled.div`
  background: linear-gradient(to right, #000080, #4169E1);
  color: #FFFFFF;
  padding: 4px 6px;
  margin: -10px -10px 10px -10px;
  font-weight: bold;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: move;
  user-select: none;
`;

const CloseButton = styled.span`
  cursor: pointer;
  width: 12px;
  height: 12px;
  background: #C0C0C0;
  border: 1px solid #000000;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 8px;
  color: #000000;

  &:hover {
    background: #DFDFDF;
  }

  &:active {
    background: #808080;
  }
`;

const Section = styled.div`
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 1px dotted #808080;

  &:last-child {
    border-bottom: none;
    margin-bottom: 0;
    padding-bottom: 0;
  }
`;

const SectionTitle = styled.div`
  font-weight: bold;
  margin-bottom: 4px;
  display: flex;
  align-items: center;
  gap: 4px;
`;

const StatusIcon = styled.span`
  font-size: 12px;
`;

const MetricRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 2px 0;

  &:hover {
    background: #F0F0F0;
  }
`;

const MetricLabel = styled.span`
  color: #333333;
`;

const MetricValue = styled.span`
  font-weight: bold;
  color: ${props => props.color || '#000000'};
`;

const PrivacyBar = styled.div`
  width: 100%;
  height: 20px;
  background: #E0E0E0;
  border: 1px solid #000000;
  margin: 8px 0;
  position: relative;
  overflow: hidden;
`;

const PrivacyFill = styled.div`
  height: 100%;
  background: ${props => {
    if (props.percentage >= 80) return '#00AA00';
    if (props.percentage >= 50) return '#FFB800';
    if (props.percentage >= 25) return '#FF6600';
    return '#FF0000';
  }};
  width: ${props => props.percentage}%;
  transition: width 0.3s ease;
`;

const PrivacyScore = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-weight: bold;
  color: #000000;
  text-shadow: 1px 1px 0 #FFFFFF;
`;

const WarningBox = styled.div`
  background: #FFF3CD;
  border: 1px solid #FFB800;
  padding: 6px;
  margin-top: 8px;
  font-size: 10px;
  color: #856404;
`;

const SuccessBox = styled.div`
  background: #D4EDDA;
  border: 1px solid #00AA00;
  padding: 6px;
  margin-top: 8px;
  font-size: 10px;
  color: #155724;
`;

const Tip = styled.div`
  background: #E8F4F8;
  border: 1px solid #4169E1;
  padding: 6px;
  margin-top: 8px;
  font-size: 10px;
  color: #004085;
`;

type Props = {
  onClose: () => void,
  // From Redux
  addresses: Array<any>,
  transactions: Array<any>,
  shieldedBalance: number,
  transparentBalance: number,
  totalBalance: number,
};

type State = {
  privacyScore: number,
  shieldedTxCount: number,
  transparentTxCount: number,
  mixedTxCount: number,
  loading: boolean,
  zAddresses: Array<string>,
  tAddresses: Array<string>,
  actualShieldedBalance: number,
  actualTransparentBalance: number,
  actualTotalBalance: number,
  position: { x: number, y: number },
  isDragging: boolean,
  dragOffset: { x: number, y: number },
};

class PrivacyCheckComponent extends Component<Props, State> {
  state = {
    privacyScore: 0,
    shieldedTxCount: 0,
    transparentTxCount: 0,
    mixedTxCount: 0,
    loading: true,
    zAddresses: [],
    tAddresses: [],
    actualShieldedBalance: 0,
    actualTransparentBalance: 0,
    actualTotalBalance: 0,
    position: { x: 20, y: 140 },
    isDragging: false,
    dragOffset: { x: 0, y: 0 },
  };

  componentDidMount() {
    this.analyzePrivacy();
    document.addEventListener('mousemove', this.handleMouseMove);
    document.addEventListener('mouseup', this.handleMouseUp);
  }

  componentWillUnmount() {
    document.removeEventListener('mousemove', this.handleMouseMove);
    document.removeEventListener('mouseup', this.handleMouseUp);
  }

  handleMouseDown = (e: MouseEvent) => {
    const { position } = this.state;
    this.setState({
      isDragging: true,
      dragOffset: {
        x: e.clientX - position.x,
        y: e.clientY - position.y,
      },
    });
  };

  handleMouseMove = (e: MouseEvent) => {
    const { isDragging, dragOffset } = this.state;
    if (!isDragging) return;

    this.setState({
      position: {
        x: e.clientX - dragOffset.x,
        y: e.clientY - dragOffset.y,
      },
    });
  };

  handleMouseUp = () => {
    this.setState({ isDragging: false });
  };

  analyzePrivacy = async () => {
    try {
      // Get total balance breakdown directly from RPC
      const totalBalances = await rpc.z_gettotalbalance(1);

      // Get all addresses
      const [zAddrs, tAddrs] = await Promise.all([
        rpc.z_listaddresses(),
        rpc.getaddressesbyaccount(''),
      ]);

      this.setState({
        zAddresses: zAddrs || [],
        tAddresses: tAddrs || [],
      });

      // Get transaction list - increase limit to get more history
      const transactions = await rpc.listtransactions('*', 200, 0);

      let shieldedCount = 0;
      let transparentCount = 0;
      let mixedCount = 0;

      // Also get z-address transactions separately
      const zTransactions = [];
      for (const zAddr of zAddrs || []) {
        try {
          const zTxs = await rpc.z_listreceivedbyaddress(zAddr, 0);
          if (zTxs && zTxs.length > 0) {
            zTransactions.push(...zTxs);
            shieldedCount += zTxs.length; // Count all z-address receives
          }
        } catch (e) {
          console.log('Error fetching z-address transactions:', e);
        }
      }

      // Analyze regular transactions
      for (const tx of transactions || []) {
        // Check address type
        if (tx.address) {
          // Check for shielded addresses (zc or zs prefix)
          if (tx.address.startsWith('zc') || tx.address.startsWith('zs')) {
            // Don't double count if already counted above
            const isDuplicate = zTransactions.some(ztx => ztx.txid === tx.txid);
            if (!isDuplicate) {
              shieldedCount++;
            }
          } else if (tx.address.startsWith('t1') || tx.address.startsWith('t3')) {
            transparentCount++;
          }
        }

        // Check if transaction is mixed (both z and t)
        if (tx.category === 'send' || tx.category === 'receive') {
          try {
            const txDetails = await rpc.gettransaction(tx.txid);
            const hasShielded = (txDetails.vjoinsplit && txDetails.vjoinsplit.length > 0) ||
                               (txDetails.vShieldedSpend && txDetails.vShieldedSpend.length > 0) ||
                               (txDetails.vShieldedOutput && txDetails.vShieldedOutput.length > 0);
            const hasTransparent = (txDetails.vin && txDetails.vin.length > 0) ||
                                  (txDetails.vout && txDetails.vout.length > 0);

            if (hasShielded && hasTransparent) {
              mixedCount++;
            }
          } catch (e) {
            // Ignore individual transaction errors
          }
        }
      }

      console.log('Transaction counts - Shielded:', shieldedCount, 'Transparent:', transparentCount, 'Mixed:', mixedCount);

      // Use actual balances from RPC with BigNumber for precision
      const actualShieldedBalance = totalBalances ? new BigNumber(totalBalances.private || 0).toNumber() : 0;
      const actualTransparentBalance = totalBalances ? new BigNumber(totalBalances.transparent || 0).toNumber() : 0;

      // Calculate privacy score
      const privacyScore = this.calculatePrivacyScore({
        shieldedBalance: actualShieldedBalance,
        transparentBalance: actualTransparentBalance,
        shieldedTxCount: shieldedCount,
        transparentTxCount: transparentCount,
        mixedTxCount: mixedCount,
        zAddresses: zAddrs || [],
        tAddresses: tAddrs || [],
      });

      this.setState({
        shieldedTxCount: shieldedCount,
        transparentTxCount: transparentCount,
        mixedTxCount: mixedCount,
        privacyScore,
        loading: false,
        actualShieldedBalance,
        actualTransparentBalance,
        actualTotalBalance: totalBalances ? parseFloat(totalBalances.total || 0) : 0,
      });
    } catch (error) {
      console.error('Privacy analysis error:', error);
      this.setState({ loading: false });
    }
  };

  calculatePrivacyScore = (data: Object) => {
    let score = 0;
    const shieldedBN = new BigNumber(data.shieldedBalance);
    const transparentBN = new BigNumber(data.transparentBalance);
    const totalBalance = shieldedBN.plus(transparentBN);

    // Balance privacy (40% weight)
    if (totalBalance.isGreaterThan(0)) {
      const shieldedPercentage = shieldedBN.dividedBy(totalBalance).multipliedBy(100);
      score += shieldedPercentage.multipliedBy(0.4).toNumber();
    }

    // Transaction privacy (40% weight)
    const totalTx = data.shieldedTxCount + data.transparentTxCount + data.mixedTxCount;
    if (totalTx > 0) {
      const privateTxPercentage = ((data.shieldedTxCount + data.mixedTxCount * 0.5) / totalTx) * 100;
      score += (privateTxPercentage * 0.4);
    }

    // Address usage (20% weight)
    if (data.zAddresses.length > 0) {
      score += 10; // Has at least one z-address
    }
    if (data.zAddresses.length > data.tAddresses.length) {
      score += 10; // More z-addresses than t-addresses
    }

    // Cap at 99 if there's any transparent balance (never allow 100% with transparent funds)
    const roundedScore = Math.round(score);

    if (transparentBN.isGreaterThan(0) && roundedScore >= 100) {
      return 99;
    }

    return Math.min(100, roundedScore);
  };

  getPrivacyLevel = (score: number) => {
    if (score >= 80) return { text: 'Excellent', icon: '🛡️', color: '#00AA00' };
    if (score >= 60) return { text: 'Good', icon: '✅', color: '#00AA00' };
    if (score >= 40) return { text: 'Fair', icon: '⚠️', color: '#FFB800' };
    if (score >= 20) return { text: 'Poor', icon: '⚠️', color: '#FF6600' };
    return { text: 'Critical', icon: '🚨', color: '#FF0000' };
  };

  render() {
    const { onClose } = this.props;
    const {
      privacyScore,
      shieldedTxCount,
      transparentTxCount,
      mixedTxCount,
      loading,
      zAddresses,
      tAddresses,
      actualShieldedBalance,
      actualTransparentBalance,
      actualTotalBalance,
      position,
      isDragging,
    } = this.state;

    if (loading) {
      return (
        <PrivacyContainer top={position.y} left={position.x} isDragging={isDragging}>
          <TitleBar onMouseDown={this.handleMouseDown}>
            Privacy Check
            <CloseButton onClick={onClose}>✕</CloseButton>
          </TitleBar>
          <div>Analyzing wallet privacy...</div>
        </PrivacyContainer>
      );
    }

    const privacyLevel = this.getPrivacyLevel(privacyScore);

    // Calculate shielded percentage with BigNumber precision
    let shieldedPercentage = 0;
    if (actualTotalBalance > 0) {
      const shieldedBN = new BigNumber(actualShieldedBalance);
      const totalBN = new BigNumber(actualTotalBalance);
      const transparentBN = new BigNumber(actualTransparentBalance);

      shieldedPercentage = shieldedBN.dividedBy(totalBN).multipliedBy(100).toNumber();

      // Cap at 99.9% if there's any transparent balance (never show 100% with transparent funds)
      if (transparentBN.isGreaterThan(0) && shieldedPercentage > 99.9) {
        shieldedPercentage = 99.9;
      }
    }

    const totalTx = shieldedTxCount + transparentTxCount + mixedTxCount;

    return (
      <PrivacyContainer top={position.y} left={position.x} isDragging={isDragging}>
        <TitleBar onMouseDown={this.handleMouseDown}>
          Privacy Check
          <CloseButton onClick={onClose}>✕</CloseButton>
        </TitleBar>

        <Section>
          <SectionTitle>
            <StatusIcon>{privacyLevel.icon}</StatusIcon>
            Privacy Score: {privacyLevel.text}
          </SectionTitle>
          <PrivacyBar>
            <PrivacyFill percentage={privacyScore} />
            <PrivacyScore>{privacyScore}%</PrivacyScore>
          </PrivacyBar>
        </Section>

        <Section>
          <SectionTitle>
            <StatusIcon>💰</StatusIcon>
            Balance Distribution
          </SectionTitle>
          <MetricRow>
            <MetricLabel>Shielded (z):</MetricLabel>
            <MetricValue color="#00AA00">
              {formatNumber({ value: actualShieldedBalance, maxDecimals: 2 })} ZCL
            </MetricValue>
          </MetricRow>
          <MetricRow>
            <MetricLabel>Transparent (t):</MetricLabel>
            <MetricValue color="#FF6600">
              {formatNumber({ value: actualTransparentBalance, maxDecimals: 2 })} ZCL
            </MetricValue>
          </MetricRow>
          <MetricRow>
            <MetricLabel>Privacy ratio:</MetricLabel>
            <MetricValue color={actualTransparentBalance === 0 && shieldedPercentage === 100 ? '#00AA00' : '#FF0000'}>
              {actualTransparentBalance > 0 && shieldedPercentage >= 99.95
                ? '99.9'
                : shieldedPercentage.toFixed(1)}% shielded
            </MetricValue>
          </MetricRow>
        </Section>

        <Section>
          <SectionTitle>
            <StatusIcon>📊</StatusIcon>
            Transaction Analysis
          </SectionTitle>
          <MetricRow>
            <MetricLabel>Shielded txs:</MetricLabel>
            <MetricValue>{shieldedTxCount}</MetricValue>
          </MetricRow>
          <MetricRow>
            <MetricLabel>Transparent txs:</MetricLabel>
            <MetricValue>{transparentTxCount}</MetricValue>
          </MetricRow>
          <MetricRow>
            <MetricLabel>Mixed txs:</MetricLabel>
            <MetricValue>{mixedTxCount}</MetricValue>
          </MetricRow>
          <MetricRow>
            <MetricLabel>Total analyzed:</MetricLabel>
            <MetricValue>{totalTx}</MetricValue>
          </MetricRow>
        </Section>

        <Section>
          <SectionTitle>
            <StatusIcon>🔑</StatusIcon>
            Address Usage
          </SectionTitle>
          <MetricRow>
            <MetricLabel>Z-addresses:</MetricLabel>
            <MetricValue color="#00AA00">{zAddresses.length}</MetricValue>
          </MetricRow>
          <MetricRow>
            <MetricLabel>T-addresses:</MetricLabel>
            <MetricValue color="#FF6600">{tAddresses.length}</MetricValue>
          </MetricRow>
        </Section>

        {privacyScore < 40 && (
          <WarningBox>
            ⚠️ <strong>Low Privacy:</strong> Consider moving funds to shielded addresses for better privacy.
          </WarningBox>
        )}

        {privacyScore >= 60 && privacyScore < 80 && (
          <Tip>
            💡 <strong>Tip:</strong> You're doing well! Keep using shielded addresses for maximum privacy.
          </Tip>
        )}

        {privacyScore >= 80 && (
          <SuccessBox>
            🎉 <strong>Excellent!</strong> You're using ZClassic's privacy features effectively.
          </SuccessBox>
        )}

        {shieldedPercentage < 50 && actualTotalBalance > 0 && (
          <Tip>
            💡 Shield your transparent funds: Send them to a z-address for enhanced privacy.
          </Tip>
        )}
      </PrivacyContainer>
    );
  }
}

const mapStateToProps = ({ walletSummary, sendStatus }: AppState) => ({
  addresses: walletSummary.addresses || [],
  transactions: walletSummary.transactions || [],
  shieldedBalance: walletSummary.shielded || 0,
  transparentBalance: walletSummary.transparent || 0,
  totalBalance: walletSummary.total || 0,
});

export const PrivacyCheck = connect(mapStateToProps)(PrivacyCheckComponent);