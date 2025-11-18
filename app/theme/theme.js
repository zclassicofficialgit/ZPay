// @flow

import { MAC80S } from '../constants/themes';
import { typography } from './typography';
import { MAC80S_COLORS } from './colors';

// Base theme configuration
const baseTheme = {
  ...typography,

  // Sizes & Spacing
  sidebarWidth: '180px',
  headerHeight: '20px',
  layoutPaddingLeft: '1px',
  layoutPaddingRight: '1px',
  layoutContentPaddingTop: '1px',

  // Misc
  transitionEase: 'none',
};

// Macintosh 1984 theme configuration (only theme available)
const macTheme = {
  ...baseTheme,
  mode: MAC80S,
  fontFamily: 'Chicago, Geneva, "Lucida Grande", -apple-system, system-ui, sans-serif',
  fontCode: 'Monaco, "Courier New", monospace',
  boxBorderRadius: '0px',
  colors: MAC80S_COLORS,
};

// Export function to get theme by mode (always returns macTheme)
export const getTheme = (mode: string): AppTheme => macTheme;

// Default theme
export const appTheme: AppTheme = macTheme;