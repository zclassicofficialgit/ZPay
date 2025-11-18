// @flow
// Apple 2025 Theme - Modern macOS style

const APPLE_WHITE = '#FFFFFF';
const APPLE_BLACK = '#000000';
const APPLE_GRAY = '#F5F5F7';
const APPLE_DARK_GRAY = '#86868B';
const APPLE_BLUE = '#007AFF';
const APPLE_LIGHT_BLUE = '#5AC8FA';
const APPLE_GREEN = '#34C759';
const APPLE_RED = '#FF3B30';
const APPLE_ORANGE = '#FF9500';
const APPLE_PURPLE = '#AF52DE';

export const apple2025 = {
  // Primary Colors - iOS Blue
  primary: APPLE_BLUE,
  primaryLight: APPLE_LIGHT_BLUE,
  primaryDark: '#0051D5',

  // Secondary Colors - Purple accent
  secondary: APPLE_PURPLE,
  secondaryLight: '#C77DFF',
  secondaryDark: '#8B3FBC',

  // Background colors - Light mode
  background: APPLE_WHITE,
  backgroundDark: APPLE_GRAY,
  backgroundDarker: '#E8E8ED',
  backgroundLight: APPLE_WHITE,

  // Text colors - Dark on light
  text: APPLE_BLACK,
  textLight: '#1D1D1F',
  textDark: APPLE_BLACK,
  textMuted: APPLE_DARK_GRAY,

  // Borders - Subtle
  border: '#D2D2D7',
  borderLight: '#E8E8ED',
  borderDark: '#B0B0B5',

  // Components
  cardBackground: APPLE_WHITE,
  inputBackground: APPLE_WHITE,
  sidebarBackground: APPLE_GRAY,
  sidebarItem: APPLE_BLACK,
  sidebarItemActive: APPLE_BLUE,
  sidebarItemHover: '#E8E8ED',
  sidebarItemHoverActive: APPLE_LIGHT_BLUE,

  // Header
  headerTitle: APPLE_BLACK,
  headerBackground: APPLE_GRAY,

  // Modal
  modalItemBackground: APPLE_WHITE,
  blackTwo: '#1D1D1F',

  // Status colors - iOS system colors
  success: APPLE_GREEN,
  error: APPLE_RED,
  warning: APPLE_ORANGE,
  info: APPLE_BLUE,

  // Wallet
  walletSummaryBg: APPLE_WHITE,
  walletSummaryBorder: '#D2D2D7',

  // Transactions
  transactionSent: APPLE_RED,
  transactionReceived: APPLE_GREEN,
  transactionPending: APPLE_ORANGE,
  transactionFailed: APPLE_DARK_GRAY,

  // Transaction Details Modal
  transactionDetailsBg: APPLE_WHITE,
  transactionDetailsRowHover: APPLE_GRAY,
  transactionDetailsDivider: '#D2D2D7',
  transactionDetailsLabel: APPLE_DARK_GRAY,
  transactionDetailsShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',

  // Send/Receive
  sendCardBg: APPLE_WHITE,
  sendCardBorder: '#D2D2D7',
  sendAdditionalOptionsBg: APPLE_GRAY,
  sendAdditionalOptionsBorder: '#D2D2D7',
  sendAdditionalInputBg: APPLE_WHITE,
  sendAdditionalInputText: APPLE_BLACK,
  receiveCardBg: APPLE_WHITE,

  // Settings
  settingsCardBg: APPLE_WHITE,
  settingsLearnMore: APPLE_BLUE,
  settingsLearnMoreHovered: APPLE_LIGHT_BLUE,

  // Console
  consoleButton: APPLE_BLUE,

  // Progress
  progressBar: APPLE_BLUE,
  progressBackground: '#E8E8ED',

  // Buttons - Modern iOS style
  buttonPrimaryBg: APPLE_BLUE,
  buttonPrimaryHover: APPLE_LIGHT_BLUE,
  buttonPrimaryDisabled: '#D2D2D7',
  buttonPrimaryText: APPLE_WHITE,
  buttonSecondaryBg: APPLE_GRAY,
  buttonSecondaryHover: '#E8E8ED',
  buttonSecondaryDisabled: '#D2D2D7',
  buttonSecondaryText: APPLE_BLUE,
  buttonBorder: '#D2D2D7',

  // Special effects
  shadowColor: 'rgba(0, 0, 0, 0.1)',
  activeIconFill: APPLE_BLUE,
  inactiveIconFill: APPLE_DARK_GRAY,

  // Dropdown
  dropdownBg: APPLE_WHITE,
  dropdownHoverBg: APPLE_GRAY,
  dropdownBorder: '#D2D2D7',

  // Input fields
  inputBg: APPLE_WHITE,
  inputBorder: '#D2D2D7',
  inputBorderActive: APPLE_BLUE,

  // QR Code
  qrCodeWrapperBg: APPLE_WHITE,
  qrCodeWrapperBorder: '#D2D2D7',

  // Toast notifications
  toastBg: APPLE_WHITE,
  toastBorder: '#D2D2D7',
  toastText: APPLE_BLACK,

  // Logo
  logo: APPLE_BLUE,
  logoBorder: APPLE_BLUE,

  // Special effects
  gradientStart: APPLE_GRAY,
  gradientEnd: APPLE_WHITE,
};
