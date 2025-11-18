// @flow
// Windows 2025 Theme - Modern Windows 11 Fluent Design style

const WIN_WHITE = '#FFFFFF';
const WIN_BLACK = '#000000';
const WIN_LIGHT_GRAY = '#F3F3F3';
const WIN_GRAY = '#E5E5E5';
const WIN_DARK_GRAY = '#8A8A8A';
const WIN_BLUE = '#0078D4';
const WIN_LIGHT_BLUE = '#4CC2FF';
const WIN_PURPLE = '#8764B8';
const WIN_GREEN = '#107C10';
const WIN_RED = '#D13438';
const WIN_ORANGE = '#FF8C00';
const WIN_ACCENT = '#0067C0';

export const windows2025 = {
  // Primary Colors - Windows Blue
  primary: WIN_BLUE,
  primaryLight: WIN_LIGHT_BLUE,
  primaryDark: WIN_ACCENT,

  // Secondary Colors - Purple accent
  secondary: WIN_PURPLE,
  secondaryLight: '#A080C8',
  secondaryDark: '#6B4E98',

  // Background colors - Light Fluent
  background: WIN_WHITE,
  backgroundDark: WIN_LIGHT_GRAY,
  backgroundDarker: WIN_GRAY,
  backgroundLight: WIN_WHITE,

  // Text colors - Dark on light
  text: WIN_BLACK,
  textLight: '#1F1F1F',
  textDark: WIN_BLACK,
  textMuted: WIN_DARK_GRAY,

  // Borders - Subtle modern
  border: '#D1D1D1',
  borderLight: WIN_GRAY,
  borderDark: '#A0A0A0',

  // Components
  cardBackground: WIN_WHITE,
  inputBackground: WIN_WHITE,
  sidebarBackground: WIN_LIGHT_GRAY,
  sidebarItem: WIN_BLACK,
  sidebarItemActive: WIN_BLUE,
  sidebarItemHover: WIN_GRAY,
  sidebarItemHoverActive: WIN_LIGHT_BLUE,

  // Header
  headerTitle: WIN_BLACK,
  headerBackground: WIN_LIGHT_GRAY,

  // Modal
  modalItemBackground: WIN_WHITE,
  blackTwo: '#1F1F1F',

  // Status colors - Windows system colors
  success: WIN_GREEN,
  error: WIN_RED,
  warning: WIN_ORANGE,
  info: WIN_BLUE,

  // Wallet
  walletSummaryBg: WIN_WHITE,
  walletSummaryBorder: '#D1D1D1',

  // Transactions
  transactionSent: WIN_RED,
  transactionReceived: WIN_GREEN,
  transactionPending: WIN_ORANGE,
  transactionFailed: WIN_DARK_GRAY,

  // Transaction Details Modal
  transactionDetailsBg: WIN_WHITE,
  transactionDetailsRowHover: WIN_LIGHT_GRAY,
  transactionDetailsDivider: '#D1D1D1',
  transactionDetailsLabel: WIN_DARK_GRAY,
  transactionDetailsShadow: '0 8px 16px rgba(0, 0, 0, 0.14)',

  // Send/Receive
  sendCardBg: WIN_WHITE,
  sendCardBorder: '#D1D1D1',
  sendAdditionalOptionsBg: WIN_LIGHT_GRAY,
  sendAdditionalOptionsBorder: '#D1D1D1',
  sendAdditionalInputBg: WIN_WHITE,
  sendAdditionalInputText: WIN_BLACK,
  receiveCardBg: WIN_WHITE,

  // Settings
  settingsCardBg: WIN_WHITE,
  settingsLearnMore: WIN_BLUE,
  settingsLearnMoreHovered: WIN_LIGHT_BLUE,

  // Console
  consoleButton: WIN_BLUE,

  // Progress
  progressBar: WIN_BLUE,
  progressBackground: WIN_GRAY,

  // Buttons - Fluent Design style
  buttonPrimaryBg: WIN_BLUE,
  buttonPrimaryHover: WIN_LIGHT_BLUE,
  buttonPrimaryDisabled: '#D1D1D1',
  buttonPrimaryText: WIN_WHITE,
  buttonSecondaryBg: WIN_LIGHT_GRAY,
  buttonSecondaryHover: WIN_GRAY,
  buttonSecondaryDisabled: '#D1D1D1',
  buttonSecondaryText: WIN_BLUE,
  buttonBorder: '#D1D1D1',

  // Special effects
  shadowColor: 'rgba(0, 0, 0, 0.14)',
  activeIconFill: WIN_BLUE,
  inactiveIconFill: WIN_DARK_GRAY,

  // Dropdown
  dropdownBg: WIN_WHITE,
  dropdownHoverBg: WIN_LIGHT_GRAY,
  dropdownBorder: '#D1D1D1',

  // Input fields
  inputBg: WIN_WHITE,
  inputBorder: '#D1D1D1',
  inputBorderActive: WIN_BLUE,

  // QR Code
  qrCodeWrapperBg: WIN_WHITE,
  qrCodeWrapperBorder: '#D1D1D1',

  // Toast notifications
  toastBg: WIN_WHITE,
  toastBorder: '#D1D1D1',
  toastText: WIN_BLACK,

  // Logo
  logo: WIN_BLUE,
  logoBorder: WIN_BLUE,

  // Special effects
  gradientStart: WIN_LIGHT_GRAY,
  gradientEnd: WIN_WHITE,
};
