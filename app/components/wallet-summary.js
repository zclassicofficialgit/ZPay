// @flow

import React from 'react';
import styled, { withTheme } from 'styled-components';

import { TextComponent } from './text';

import { formatNumber } from '../utils/format-number';
import { getCoinName } from '../utils/get-coin-name';
import { DARK } from '../constants/themes';

import { media } from '../theme';

import ShieldDarkImage from '../assets/images/shield_dark.png';
import ShieldLightImage from '../assets/images/shield_light.png';

const OutsideWrapper = styled.div`
  margin-top: ${props => props.theme.layoutContentPaddingTop};
`;

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  background-color: ${props => props.theme.colors.walletSummaryBg};
  border: 1px solid ${props => props.theme.colors.walletSummaryBorder};
  border-radius: ${props => props.theme.boxBorderRadius};
  padding: 30px 30px;
  position: relative;

  ${media.main`
    margin-top: 0;
    flex-direction: row;
  `}
`;

const OutsideLabel = styled(TextComponent)`
  text-transform: uppercase;
  color: ${props => props.theme.colors.transactionsDate};
  font-size: ${props => `${props.theme.fontSize.regular * 0.9}em`};
  font-weight: ${props => String(props.theme.fontWeight.bold)};
  margin-bottom: 5px;
`;

const TotalContainer = styled.div`
  min-width: 270px;
`;

const DetailContainer = styled.div`
  min-width: 130px;
  padding-right: 20px;
`;

const USDValue = styled(TextComponent)`
  opacity: 0.5;
  font-weight: ${props => String(props.theme.fontWeight.light)};
  font-size: 16px;
`;

const DefaultLabel = styled(TextComponent)`
  margin-top: 5px;
  margin-bottom: 0px;
  color: ${props => props.theme.colors.walletSummaryTransparent};
`;

const MiddleLabel = styled(TextComponent)`
  margin-top: 7px;
  margin-bottom: 5px;
  font-size: 18px;
`;

const ShieldedValue = styled(DefaultLabel)`
  color: ${props => props.theme.colors.activeItem};
  padding-left: 14px;
  position: relative;

  &:before {
    position: absolute;
    left: 0;
    top: -1px;
    content: '';
    background: url(${props => (props.theme.mode === DARK ? ShieldDarkImage : ShieldLightImage)});
    background-size: cover;
    height: 12px;
    width: 11px;
  }
`;

const UnconfirmedLabel = styled(DefaultLabel)`
  color: ${props => props.theme.colors.walletSummaryUnconfirmed};
`;

const UnconfirmedValue = styled(MiddleLabel)`
  color: ${props => props.theme.colors.walletSummaryUnconfirmed};
`;

const DetailMainContainer = styled.div`
  display: flex;
  margin-top: 1rem;

  ${media.main`
    margin-top: 0;
  `}
`;

type Props = {
  total: number,
  shielded: number,
  transparent: number,
  unconfirmed: number,
  zclPrice: number,
  theme: AppTheme,
};

export const Component = ({
  total,
  shielded,
  transparent,
  unconfirmed,
  zclPrice,
  theme,
}: Props) => {
  const coinName = getCoinName();

  return (
    <OutsideWrapper>
      <OutsideLabel value='Wallet Summary' />
      <Wrapper>
        <TotalContainer>
          <TextComponent
            size={theme.fontSize.medium * 2.4}
            value={`${coinName} ${formatNumber({ value: total })}`}
            isBold
          />
          <USDValue
            value={`USD $${formatNumber({ value: total * zclPrice })}`}
            size={theme.fontSize.medium * 2}
          />
        </TotalContainer>
        <DetailMainContainer>
          <DetailContainer>
            <ShieldedValue value='SHIELDED' isBold size={theme.fontSize.small} />
            <MiddleLabel
              value={`${coinName} ${formatNumber({ value: shielded })}`}
              isBold
              size='16px'
            />
            <USDValue value={`USD $${formatNumber({ value: shielded * zclPrice })}`} />
          </DetailContainer>
          <DetailContainer>
            <DefaultLabel value='TRANSPARENT' isBold size={theme.fontSize.small} />
            <MiddleLabel
              value={`${coinName} ${formatNumber({ value: transparent })}`}
              isBold
              size='16px'
            />
            <USDValue value={`USD $${formatNumber({ value: transparent * zclPrice })}`} />
          </DetailContainer>
          <DetailContainer>
            <UnconfirmedLabel value='UNCONFIRMED' isBold size={theme.fontSize.small} />
            <UnconfirmedValue
              value={`${coinName} ${formatNumber({ value: unconfirmed })}`}
              isBold
              size='16px'
            />
            <USDValue value={`USD $${formatNumber({ value: unconfirmed * zclPrice })}`} />
          </DetailContainer>
        </DetailMainContainer>
      </Wrapper>
    </OutsideWrapper>
  );
};

export const WalletSummaryComponent = withTheme(Component);
