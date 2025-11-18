// @flow
// Linux 2025 Theme - Modern GNOME/Ubuntu style

const LINUX_WHITE = '#FFFFFF';
const LINUX_BLACK = '#2D2D2D';
const LINUX_LIGHT_GRAY = '#F6F5F4';
const LINUX_GRAY = '#DEDDDA';
const LINUX_DARK_GRAY = '#77767B';
const LINUX_ORANGE = '#E95420';
const LINUX_LIGHT_ORANGE = '#FF6C2C';
const LINUX_PURPLE = '#5E2750';
const LINUX_GREEN = '#26A269';
const LINUX_RED = '#C01C28';
const LINUX_BLUE = '#1C71D8';
const LINUX_YELLOW = '#F5C211';

export const linux2025 = {
  // Primary Colors - Ubuntu Orange
  primary: LINUX_ORANGE,
  primaryLight: LINUX_LIGHT_ORANGE,
  primaryDark: '#C7410E',

  // Secondary Colors - Purple accent
  secondary: LINUX_PURPLE,
  secondaryLight: '#7E3768',
  secondaryDark: '#4E1F40',

  // Background colors - Light GNOME
  background: LINUX_WHITE,
  backgroundDark: LINUX_LIGHT_GRAY,
  backgroundDarker: LINUX_GRAY,
  backgroundLight: LINUX_WHITE,

  // Text colors - Dark on light
  text: LINUX_BLACK,
  textLight: '#3D3D3D',
  textDark: LINUX_BLACK,
  textMuted: LINUX_DARK_GRAY,

  // Borders - Subtle GNOME style
  border: '#C0BFBC',
  borderLight: LINUX_GRAY,
  borderDark: '#9A9996',

  // Components
  cardBackground: LINUX_WHITE,
  inputBackground: LINUX_WHITE,
  sidebarBackground: LINUX_LIGHT_GRAY,
  sidebarItem: LINUX_BLACK,
  sidebarItemActive: LINUX_ORANGE,
  sidebarItemHover: LINUX_GRAY,
  sidebarItemHoverActive: LINUX_LIGHT_ORANGE,

  // Header
  headerTitle: LINUX_WHITE,
  headerBackground: LINUX_BLACK,

  // Modal
  modalItemBackground: LINUX_WHITE,
  blackTwo: LINUX_BLACK,

  // Status colors - GNOME system colors
  success: LINUX_GREEN,
  error: LINUX_RED,
  warning: LINUX_YELLOW,
  info: LINUX_BLUE,

  // Wallet
  walletSummaryBg: LINUX_WHITE,
  walletSummaryBorder: '#C0BFBC',

  // Transactions
  transactionSent: LINUX_RED,
  transactionReceived: LINUX_GREEN,
  transactionPending: LINUX_YELLOW,
  transactionFailed: LINUX_DARK_GRAY,

  // Transaction Details Modal
  transactionDetailsBg: LINUX_WHITE,
  transactionDetailsRowHover: LINUX_LIGHT_GRAY,
  transactionDetailsDivider: '#C0BFBC',
  transactionDetailsLabel: LINUX_DARK_GRAY,
  transactionDetailsShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',

  // Send/Receive
  sendCardBg: LINUX_WHITE,
  sendCardBorder: '#C0BFBC',
  sendAdditionalOptionsBg: LINUX_LIGHT_GRAY,
  sendAdditionalOptionsBorder: '#C0BFBC',
  sendAdditionalInputBg: LINUX_WHITE,
  sendAdditionalInputText: LINUX_BLACK,
  receiveCardBg: LINUX_WHITE,

  // Settings
  settingsCardBg: LINUX_WHITE,
  settingsLearnMore: LINUX_ORANGE,
  settingsLearnMoreHovered: LINUX_LIGHT_ORANGE,

  // Console
  consoleButton: LINUX_ORANGE,

  // Progress
  progressBar: LINUX_ORANGE,
  progressBackground: LINUX_GRAY,

  // Buttons - GNOME style
  buttonPrimaryBg: LINUX_ORANGE,
  buttonPrimaryHover: LINUX_LIGHT_ORANGE,
  buttonPrimaryDisabled: '#C0BFBC',
  buttonPrimaryText: LINUX_WHITE,
  buttonSecondaryBg: LINUX_LIGHT_GRAY,
  buttonSecondaryHover: LINUX_GRAY,
  buttonSecondaryDisabled: '#C0BFBC',
  buttonSecondaryText: LINUX_ORANGE,
  buttonBorder: '#C0BFBC',

  // Special effects
  shadowColor: 'rgba(0, 0, 0, 0.15)',
  activeIconFill: LINUX_ORANGE,
  inactiveIconFill: LINUX_DARK_GRAY,

  // Dropdown
  dropdownBg: LINUX_WHITE,
  dropdownHoverBg: LINUX_LIGHT_GRAY,
  dropdownBorder: '#C0BFBC',

  // Input fields
  inputBg: LINUX_WHITE,
  inputBorder: '#C0BFBC',
  inputBorderActive: LINUX_ORANGE,

  // QR Code
  qrCodeWrapperBg: LINUX_WHITE,
  qrCodeWrapperBorder: '#C0BFBC',

  // Toast notifications
  toastBg: LINUX_WHITE,
  toastBorder: '#C0BFBC',
  toastText: LINUX_BLACK,

  // Logo
  logo: LINUX_ORANGE,
  logoBorder: LINUX_ORANGE,

  // Special effects
  gradientStart: LINUX_LIGHT_GRAY,
  gradientEnd: LINUX_WHITE,
};
