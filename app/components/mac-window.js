// @flow

import React from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';

const WindowContainer = styled.div`
  background: ${props => props.theme.colors.background};
  border: 2px solid #000000;
  box-shadow:
    1px 1px 0 #000000,
    2px 2px 0 #000000,
    3px 3px 0 #000000;
  margin: 20px;
  display: flex;
  flex-direction: column;
  height: calc(100vh - 80px);
  position: relative;
`;

const TitleBar = styled.div`
  height: 20px;
  background: #FFFFFF;
  border-bottom: 1px solid #000000;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 4px;
  position: relative;
  user-select: none;
`;

const TitleBarLines = styled.div`
  position: absolute;
  top: 6px;
  left: 20px;
  right: 20px;
  height: 8px;
  background: repeating-linear-gradient(
    to bottom,
    #000000 0px,
    #000000 1px,
    transparent 1px,
    transparent 3px
  );
  pointer-events: none;
`;

const WindowTitle = styled.div`
  background: #FFFFFF;
  padding: 0 8px;
  font-size: 11px;
  font-weight: bold;
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  z-index: 1;
`;

const CloseBox = styled(Link)`
  width: 13px;
  height: 13px;
  border: 1px solid #000000;
  background: #FFFFFF;
  position: relative;
  z-index: 2;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  text-decoration: none;

  &:hover {
    background: #000000;

    &:before,
    &:after {
      background: #FFFFFF;
    }
  }

  &:before,
  &:after {
    content: '';
    position: absolute;
    width: 7px;
    height: 1px;
    background: #000000;
  }

  &:before {
    transform: rotate(45deg);
  }

  &:after {
    transform: rotate(-45deg);
  }
`;

const ZoomBox = styled.div`
  width: 13px;
  height: 13px;
  border: 1px solid #000000;
  background: #FFFFFF;
  position: absolute;
  right: 4px;
  z-index: 2;
  cursor: pointer;

  &:hover {
    background: #000000;

    &:before {
      border-color: #FFFFFF;
    }
  }

  &:before {
    content: '';
    position: absolute;
    top: 2px;
    left: 2px;
    right: 2px;
    bottom: 2px;
    border: 1px solid #000000;
  }
`;

const WindowContent = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 10px;
  background: #F0F0F0;

  /* Classic Mac scrollbar styling */
  &::-webkit-scrollbar {
    width: 16px;
  }

  &::-webkit-scrollbar-track {
    background: #FFFFFF;
    border-left: 1px solid #000000;
  }

  &::-webkit-scrollbar-thumb {
    background: #C0C0C0;
    border: 1px solid #000000;

    &:hover {
      background: #808080;
    }
  }

  &::-webkit-scrollbar-button {
    background: #FFFFFF;
    border: 1px solid #000000;
    height: 16px;
    position: relative;

    &:before {
      content: '';
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 0;
      height: 0;
      border-style: solid;
    }

    &:vertical:decrement:before {
      border-width: 0 4px 6px 4px;
      border-color: transparent transparent #000000 transparent;
    }

    &:vertical:increment:before {
      border-width: 6px 4px 0 4px;
      border-color: #000000 transparent transparent transparent;
    }
  }
`;

const ResizeHandle = styled.div`
  position: absolute;
  bottom: 0;
  right: 0;
  width: 15px;
  height: 15px;
  cursor: se-resize;

  &:before,
  &:after {
    content: '';
    position: absolute;
    background: #000000;
  }

  &:before {
    right: 2px;
    bottom: 2px;
    width: 11px;
    height: 1px;
  }

  &:after {
    right: 2px;
    bottom: 2px;
    width: 1px;
    height: 11px;
  }
`;

type Props = {
  title: string,
  children: React$Node,
  onClose?: () => void,
};

export const MacWindowComponent = ({ title, children, onClose }: Props) => (
  <WindowContainer>
    <TitleBar>
      <CloseBox to="/" onClick={onClose} />
      <TitleBarLines />
      <WindowTitle>{title}</WindowTitle>
      <ZoomBox />
    </TitleBar>
    <WindowContent>
      {children}
    </WindowContent>
    <ResizeHandle />
  </WindowContainer>
);