// @flow
// ZX Spectrum Theme - Classic Sinclair colors

const SPEC_BLACK = '#000000';
const SPEC_BLUE = '#0000FF';
const SPEC_RED = '#FF0000';
const SPEC_MAGENTA = '#FF00FF';
const SPEC_GREEN = '#00FF00';
const SPEC_CYAN = '#00FFFF';
const SPEC_YELLOW = '#FFFF00';
const SPEC_WHITE = '#FFFFFF';
const SPEC_BRIGHT_BLUE = '#0080FF';
const SPEC_BRIGHT_MAGENTA = '#FF80FF';

export const zxSpectrum = {
  // Primary Colors - Spectrum colors
  primary: SPEC_MAGENTA,
  primaryLight: SPEC_BRIGHT_MAGENTA,
  primaryDark: '#CC00CC',

  // Secondary Colors
  secondary: SPEC_CYAN,
  secondaryLight: SPEC_WHITE,
  secondaryDark: '#00CCCC',

  // Background colors - Black with color border
  background: SPEC_BLACK,
  backgroundDark: SPEC_BLACK,
  backgroundDarker: SPEC_BLACK,
  backgroundLight: '#1A1A1A',

  // Text colors - Bright Spectrum style
  text: SPEC_WHITE,
  textLight: SPEC_CYAN,
  textDark: SPEC_BLUE,
  textMuted: '#808080',

  // Borders - Spectrum rainbow
  border: SPEC_MAGENTA,
  borderLight: SPEC_CYAN,
  borderDark: SPEC_BLUE,

  // Components
  cardBackground: SPEC_BLACK,
  inputBackground: SPEC_BLACK,
  sidebarBackground: SPEC_BLACK,
  sidebarItem: SPEC_CYAN,
  sidebarItemActive: SPEC_MAGENTA,
  sidebarItemHover: SPEC_BLUE,
  sidebarItemHoverActive: SPEC_BRIGHT_MAGENTA,

  // Header
  headerTitle: SPEC_YELLOW,
  headerBackground: SPEC_BLUE,

  // Modal
  modalItemBackground: SPEC_BLACK,
  blackTwo: SPEC_BLACK,

  // Status colors
  success: SPEC_GREEN,
  error: SPEC_RED,
  warning: SPEC_YELLOW,
  info: SPEC_CYAN,

  // Wallet
  walletSummaryBg: SPEC_BLACK,
  walletSummaryBorder: SPEC_MAGENTA,

  // Transactions
  transactionSent: SPEC_RED,
  transactionReceived: SPEC_GREEN,
  transactionPending: SPEC_YELLOW,
  transactionFailed: '#808080',

  // Transaction Details Modal
  transactionDetailsBg: SPEC_BLACK,
  transactionDetailsRowHover: '#1A1A1A',
  transactionDetailsDivider: SPEC_MAGENTA,
  transactionDetailsLabel: SPEC_CYAN,
  transactionDetailsShadow: '2px 2px 0 ' + SPEC_MAGENTA,

  // Send/Receive
  sendCardBg: SPEC_BLACK,
  sendCardBorder: SPEC_MAGENTA,
  sendAdditionalOptionsBg: SPEC_BLACK,
  sendAdditionalOptionsBorder: SPEC_CYAN,
  sendAdditionalInputBg: SPEC_BLACK,
  sendAdditionalInputText: SPEC_WHITE,
  receiveCardBg: SPEC_BLACK,

  // Settings
  settingsCardBg: SPEC_BLACK,
  settingsLearnMore: SPEC_CYAN,
  settingsLearnMoreHovered: SPEC_MAGENTA,

  // Console
  consoleButton: SPEC_MAGENTA,

  // Progress
  progressBar: SPEC_GREEN,
  progressBackground: '#404040',

  // Buttons
  buttonPrimaryBg: SPEC_MAGENTA,
  buttonPrimaryHover: SPEC_BRIGHT_MAGENTA,
  buttonPrimaryDisabled: '#808080',
  buttonPrimaryText: SPEC_WHITE,
  buttonSecondaryBg: SPEC_BLACK,
  buttonSecondaryHover: '#1A1A1A',
  buttonSecondaryDisabled: '#808080',
  buttonSecondaryText: SPEC_CYAN,
  buttonBorder: SPEC_MAGENTA,

  // Special effects
  shadowColor: SPEC_MAGENTA,
  activeIconFill: SPEC_YELLOW,
  inactiveIconFill: '#808080',

  // Dropdown
  dropdownBg: SPEC_BLUE,
  dropdownHoverBg: SPEC_MAGENTA,
  dropdownBorder: SPEC_CYAN,

  // Input fields
  inputBg: SPEC_BLACK,
  inputBorder: SPEC_MAGENTA,
  inputBorderActive: SPEC_CYAN,

  // QR Code
  qrCodeWrapperBg: SPEC_BLACK,
  qrCodeWrapperBorder: SPEC_MAGENTA,

  // Toast notifications
  toastBg: SPEC_BLUE,
  toastBorder: SPEC_CYAN,
  toastText: SPEC_WHITE,

  // Logo
  logo: SPEC_MAGENTA,
  logoBorder: SPEC_CYAN,

  // Special effects
  gradientStart: SPEC_BLACK,
  gradientEnd: SPEC_BLUE,
};
