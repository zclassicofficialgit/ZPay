// @flow

import React from 'react';
import styled from 'styled-components';

import { ZclassicLogo } from './zclassic-logo';
import { TextComponent } from './text';
import { Divider } from './divider';
import { RowComponent } from './row';
import { StatusPillContainer } from '../containers/status-pill';

const Wrapper = styled.div`
  height: ${props => props.theme.headerHeight};
  width: 100vw;
  display: flex;
  flex-direction: row;
  background-color: ${props => props.theme.colors.background};
`;

const LogoWrapper = styled.div`
  height: ${props => props.theme.headerHeight};
  width: ${props => props.theme.sidebarWidth};
  //background-image: linear-gradient(
  //  to right,
  //  ${props => props.theme.colors.sidebarLogoGradientBegin},
  //  ${props => props.theme.colors.sidebarLogoGradientEnd}
  );
 // margin-bottom: 20px;
`;

const TitleWrapper = styled.div`
  width: ${props => `calc(100% - ${props.theme.sidebarWidth})`};
  height: ${props => props.theme.headerHeight};
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  justify-content: space-between;
  padding-top: 10px;
  padding-left: ${props => props.theme.layoutPaddingLeft};
  padding-right: ${props => props.theme.layoutPaddingRight};
`;

const TitleRow = styled(RowComponent)`
  align-items: center;
  justify-content: space-between;
  width: 100%;
`;

const Title = styled(TextComponent)`
  font-size: ${props => `${props.theme.fontSize.large}em`};
  margin-top: 10px;
  margin-bottom: 10px;
  text-transform: capitalize;
  letter-spacing: 0.25px;
  font-weight: ${props => String(props.theme.fontWeight.bold)};
  color: ${props => props.theme.colors.headerTitle};
`;

type Props = {
  title: string,
};

export const HeaderComponent = ({ title }: Props) => (
  <Wrapper id='header'>
    <LogoWrapper>
      <ZclassicLogo />
    </LogoWrapper>
    <TitleWrapper>
      <TitleRow alignItems='right' justifyContent='space-around'>
        <Title value={title} />
        <StatusPillContainer />
      </TitleRow>
      <Divider opacity={0.1} />
    </TitleWrapper>
  </Wrapper>
);
