// @flow
// COBOL 1974 Theme - Green screen terminal

const COBOL_BLACK = '#000000';
const COBOL_GREEN = '#00FF00';
const COBOL_DARK_GREEN = '#008000';
const COBOL_LIGHT_GREEN = '#80FF80';

export const cobol1974 = {
  // Primary Colors - Terminal green
  primary: COBOL_GREEN,
  primaryLight: COBOL_LIGHT_GREEN,
  primaryDark: COBOL_DARK_GREEN,

  // Secondary Colors
  secondary: COBOL_LIGHT_GREEN,
  secondaryLight: '#C0FFC0',
  secondaryDark: COBOL_GREEN,

  // Background colors - Black terminal
  background: COBOL_BLACK,
  backgroundDark: COBOL_BLACK,
  backgroundDarker: COBOL_BLACK,
  backgroundLight: '#001100',

  // Text colors - Green on black
  text: COBOL_GREEN,
  textLight: COBOL_LIGHT_GREEN,
  textDark: COBOL_DARK_GREEN,
  textMuted: COBOL_DARK_GREEN,

  // Borders
  border: COBOL_GREEN,
  borderLight: COBOL_DARK_GREEN,
  borderDark: COBOL_GREEN,

  // Components
  cardBackground: COBOL_BLACK,
  inputBackground: COBOL_BLACK,
  sidebarBackground: COBOL_BLACK,
  sidebarItem: COBOL_GREEN,
  sidebarItemActive: COBOL_LIGHT_GREEN,
  sidebarItemHover: COBOL_DARK_GREEN,
  sidebarItemHoverActive: COBOL_LIGHT_GREEN,

  // Header
  headerTitle: COBOL_GREEN,
  headerBackground: COBOL_BLACK,

  // Modal
  modalItemBackground: COBOL_BLACK,
  blackTwo: COBOL_BLACK,

  // Status colors
  success: COBOL_LIGHT_GREEN,
  error: COBOL_DARK_GREEN,
  warning: COBOL_GREEN,
  info: COBOL_LIGHT_GREEN,

  // Wallet
  walletSummaryBg: COBOL_BLACK,
  walletSummaryBorder: COBOL_GREEN,

  // Transactions
  transactionSent: COBOL_DARK_GREEN,
  transactionReceived: COBOL_LIGHT_GREEN,
  transactionPending: COBOL_GREEN,
  transactionFailed: COBOL_DARK_GREEN,

  // Transaction Details Modal
  transactionDetailsBg: COBOL_BLACK,
  transactionDetailsRowHover: '#001100',
  transactionDetailsDivider: COBOL_GREEN,
  transactionDetailsLabel: COBOL_DARK_GREEN,
  transactionDetailsShadow: '2px 2px 0 ' + COBOL_GREEN,

  // Send/Receive
  sendCardBg: COBOL_BLACK,
  sendCardBorder: COBOL_GREEN,
  sendAdditionalOptionsBg: COBOL_BLACK,
  sendAdditionalOptionsBorder: COBOL_GREEN,
  sendAdditionalInputBg: COBOL_BLACK,
  sendAdditionalInputText: COBOL_GREEN,
  receiveCardBg: COBOL_BLACK,

  // Settings
  settingsCardBg: COBOL_BLACK,
  settingsLearnMore: COBOL_LIGHT_GREEN,
  settingsLearnMoreHovered: COBOL_GREEN,

  // Console
  consoleButton: COBOL_GREEN,

  // Progress
  progressBar: COBOL_LIGHT_GREEN,
  progressBackground: COBOL_DARK_GREEN,

  // Buttons
  buttonPrimaryBg: COBOL_BLACK,
  buttonPrimaryHover: '#001100',
  buttonPrimaryDisabled: COBOL_DARK_GREEN,
  buttonPrimaryText: COBOL_GREEN,
  buttonSecondaryBg: COBOL_BLACK,
  buttonSecondaryHover: '#001100',
  buttonSecondaryDisabled: COBOL_DARK_GREEN,
  buttonSecondaryText: COBOL_LIGHT_GREEN,
  buttonBorder: COBOL_GREEN,

  // Special effects
  shadowColor: COBOL_GREEN,
  activeIconFill: COBOL_LIGHT_GREEN,
  inactiveIconFill: COBOL_DARK_GREEN,

  // Dropdown
  dropdownBg: COBOL_BLACK,
  dropdownHoverBg: '#001100',
  dropdownBorder: COBOL_GREEN,

  // Input fields
  inputBg: COBOL_BLACK,
  inputBorder: COBOL_GREEN,
  inputBorderActive: COBOL_LIGHT_GREEN,

  // QR Code
  qrCodeWrapperBg: COBOL_BLACK,
  qrCodeWrapperBorder: COBOL_GREEN,

  // Toast notifications
  toastBg: COBOL_BLACK,
  toastBorder: COBOL_GREEN,
  toastText: COBOL_GREEN,

  // Logo
  logo: COBOL_GREEN,
  logoBorder: COBOL_GREEN,

  // Special effects
  gradientStart: COBOL_BLACK,
  gradientEnd: '#001100',
};
