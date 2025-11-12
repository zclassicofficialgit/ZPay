// @flow
import React from 'react';
import styled from 'styled-components';

import zclLogo from '../../build-assets/icon.png';

const ZclImg = styled.img`
  display: block;
  margin-left: auto;
  margin-right: auto;
  width: 60px;
  height: 60px;
  object-fit: contain;
  margin-top: 15px;
  margin-bottom: 10px;
`;

export const ZclassicLogo = () => (
  <ZclImg src={zclLogo} alt='ZPay Logo' />
);
