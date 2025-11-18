// @flow

import React from 'react';
import styled from 'styled-components';

const LogoContainer = styled.div`
  display: inline-block;
  image-rendering: pixelated;
  image-rendering: -moz-crisp-edges;
  image-rendering: crisp-edges;
`;

const PixelCanvas = styled.div`
  display: grid;
  grid-template-columns: repeat(16, ${props => props.size || '8px'});
  grid-template-rows: repeat(16, ${props => props.size || '8px'});
  gap: 0;
`;

const Pixel = styled.div`
  width: ${props => props.size || '8px'};
  height: ${props => props.size || '8px'};
  background-color: ${props => props.color || 'transparent'};
`;

type Props = {
  size?: string,
  primaryColor?: string,
  secondaryColor?: string,
};

export const ZClassicPixelLogo = ({
  size = '8px',
  primaryColor = '#FFB800',  // ZClassic gold
  secondaryColor = '#FF6B00'  // ZClassic orange
}: Props) => {
  // 16x16 pixel art representation of "ZCL" letters
  // Z = Yellow/Gold, C = Orange, L = Yellow/Gold gradient
  const pixelMap = [
    // Row 1
    '0','0','0','0','0','0','0','0','0','0','0','0','0','0','0','0',
    // Row 2
    '0','1','1','1','1','0','0','2','2','2','0','0','1','0','0','0',
    // Row 3
    '0','1','1','1','1','0','2','2','0','2','2','0','1','0','0','0',
    // Row 4
    '0','0','0','1','1','0','2','2','0','0','0','0','1','0','0','0',
    // Row 5
    '0','0','1','1','0','0','2','2','0','0','0','0','1','0','0','0',
    // Row 6
    '0','1','1','0','0','0','2','2','0','0','0','0','1','0','0','0',
    // Row 7
    '0','1','1','1','1','0','2','2','0','2','2','0','1','0','0','0',
    // Row 8
    '0','1','1','1','1','0','0','2','2','2','0','0','1','1','1','1',
    // Row 9
    '0','0','0','0','0','0','0','0','0','0','0','0','0','0','0','0',
    // Row 10 - Heart starts here
    '0','0','0','1','1','0','0','0','1','1','0','0','0','0','0','0',
    // Row 11
    '0','0','1','3','3','1','0','1','3','3','1','0','0','0','0','0',
    // Row 12
    '0','0','1','3','3','3','1','3','3','3','1','0','0','0','0','0',
    // Row 13
    '0','0','0','1','3','3','3','3','3','1','0','0','0','0','0','0',
    // Row 14
    '0','0','0','0','1','3','3','3','1','0','0','0','0','0','0','0',
    // Row 15
    '0','0','0','0','0','1','3','1','0','0','0','0','0','0','0','0',
    // Row 16
    '0','0','0','0','0','0','1','0','0','0','0','0','0','0','0','0',
  ];

  const getColor = (value: string) => {
    switch(value) {
      case '1': return primaryColor;
      case '2': return secondaryColor;
      case '3': return '#FF0000';  // Red for heart
      default: return 'transparent';
    }
  };

  return (
    <LogoContainer>
      <PixelCanvas size={size}>
        {pixelMap.map((pixel, index) => (
          <Pixel
            key={index}
            color={getColor(pixel)}
            size={size}
          />
        ))}
      </PixelCanvas>
    </LogoContainer>
  );
};

// ASCII Art version for console display
export const ZClassicASCII = () => `
███████╗ ██████╗██╗
╚══███╔╝██╔════╝██║
  ███╔╝ ██║     ██║
 ███╔╝  ██║     ██║
███████╗╚██████╗███████╗
╚══════╝ ╚═════╝╚══════╝
    Made with ❤️
`;