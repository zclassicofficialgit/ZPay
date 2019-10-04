// @flow
import React from 'react';
import styled, { withTheme } from 'styled-components';

import zclLogo from '../assets/images/zclassic-logo.png';

const ZclImg = styled.img`
	display: block;
  	margin-left: auto;
  	margin-right: auto;
  	width: 50%;
	height: 90%;
`;

export const ZclassicLogo = () => (
  <ZclImg src={zclLogo} />
);
