// @flow
// Amstrad CPC Theme - Bold primary colors

const CPC_BLACK = '#000000';
const CPC_BLUE = '#0000FF';
const CPC_BRIGHT_BLUE = '#0080FF';
const CPC_RED = '#FF0000';
const CPC_MAGENTA = '#FF00FF';
const CPC_GREEN = '#00FF00';
const CPC_CYAN = '#00FFFF';
const CPC_YELLOW = '#FFFF00';
const CPC_WHITE = '#FFFFFF';
const CPC_GRAY = '#808080';

export const amstradCpc = {
  // Primary Colors - CPC Blue
  primary: CPC_BRIGHT_BLUE,
  primaryLight: CPC_CYAN,
  primaryDark: CPC_BLUE,

  // Secondary Colors - CPC Yellow
  secondary: CPC_YELLOW,
  secondaryLight: CPC_WHITE,
  secondaryDark: '#CCCC00',

  // Background colors - Black
  background: CPC_BLACK,
  backgroundDark: CPC_BLACK,
  backgroundDarker: CPC_BLACK,
  backgroundLight: '#1A1A1A',

  // Text colors - Bright colors
  text: CPC_WHITE,
  textLight: CPC_CYAN,
  textDark: CPC_GRAY,
  textMuted: CPC_GRAY,

  // Borders - Bold CPC style
  border: CPC_BRIGHT_BLUE,
  borderLight: CPC_GRAY,
  borderDark: CPC_BLUE,

  // Components
  cardBackground: CPC_BLACK,
  inputBackground: CPC_BLACK,
  sidebarBackground: CPC_BLACK,
  sidebarItem: CPC_CYAN,
  sidebarItemActive: CPC_YELLOW,
  sidebarItemHover: CPC_BRIGHT_BLUE,
  sidebarItemHoverActive: CPC_YELLOW,

  // Header
  headerTitle: CPC_YELLOW,
  headerBackground: CPC_BLUE,

  // Modal
  modalItemBackground: CPC_BLACK,
  blackTwo: CPC_BLACK,

  // Status colors - CPC palette
  success: CPC_GREEN,
  error: CPC_RED,
  warning: CPC_YELLOW,
  info: CPC_CYAN,

  // Wallet
  walletSummaryBg: CPC_BLACK,
  walletSummaryBorder: CPC_BRIGHT_BLUE,

  // Transactions
  transactionSent: CPC_RED,
  transactionReceived: CPC_GREEN,
  transactionPending: CPC_YELLOW,
  transactionFailed: CPC_GRAY,

  // Transaction Details Modal
  transactionDetailsBg: CPC_BLACK,
  transactionDetailsRowHover: '#1A1A1A',
  transactionDetailsDivider: CPC_BRIGHT_BLUE,
  transactionDetailsLabel: CPC_CYAN,
  transactionDetailsShadow: '2px 2px 0 ' + CPC_BRIGHT_BLUE,

  // Send/Receive
  sendCardBg: CPC_BLACK,
  sendCardBorder: CPC_BRIGHT_BLUE,
  sendAdditionalOptionsBg: CPC_BLACK,
  sendAdditionalOptionsBorder: CPC_BRIGHT_BLUE,
  sendAdditionalInputBg: CPC_BLACK,
  sendAdditionalInputText: CPC_WHITE,
  receiveCardBg: CPC_BLACK,

  // Settings
  settingsCardBg: CPC_BLACK,
  settingsLearnMore: CPC_YELLOW,
  settingsLearnMoreHovered: CPC_CYAN,

  // Console
  consoleButton: CPC_BRIGHT_BLUE,

  // Progress
  progressBar: CPC_GREEN,
  progressBackground: CPC_GRAY,

  // Buttons - CPC style
  buttonPrimaryBg: CPC_BLUE,
  buttonPrimaryHover: CPC_BRIGHT_BLUE,
  buttonPrimaryDisabled: CPC_GRAY,
  buttonPrimaryText: CPC_WHITE,
  buttonSecondaryBg: CPC_BLACK,
  buttonSecondaryHover: '#1A1A1A',
  buttonSecondaryDisabled: CPC_GRAY,
  buttonSecondaryText: CPC_CYAN,
  buttonBorder: CPC_BRIGHT_BLUE,

  // Special effects
  shadowColor: CPC_BRIGHT_BLUE,
  activeIconFill: CPC_YELLOW,
  inactiveIconFill: CPC_GRAY,

  // Dropdown
  dropdownBg: CPC_BLUE,
  dropdownHoverBg: CPC_BRIGHT_BLUE,
  dropdownBorder: CPC_CYAN,

  // Input fields
  inputBg: CPC_BLACK,
  inputBorder: CPC_BRIGHT_BLUE,
  inputBorderActive: CPC_YELLOW,

  // QR Code
  qrCodeWrapperBg: CPC_BLACK,
  qrCodeWrapperBorder: CPC_BRIGHT_BLUE,

  // Toast notifications
  toastBg: CPC_BLUE,
  toastBorder: CPC_CYAN,
  toastText: CPC_WHITE,

  // Logo
  logo: CPC_CYAN,
  logoBorder: CPC_BRIGHT_BLUE,

  // Special effects
  gradientStart: CPC_BLACK,
  gradientEnd: CPC_BLUE,
};
