// @flow
// MS-DOS Theme - Classic black background with cyan/white text

const DOS_BLACK = '#000000';
const DOS_CYAN = '#00FFFF';
const DOS_WHITE = '#FFFFFF';
const DOS_GRAY = '#808080';
const DOS_YELLOW = '#FFFF00';
const DOS_GREEN = '#00FF00';
const DOS_RED = '#FF0000';
const DOS_BLUE = '#0000AA';

export const msDos = {
  // Primary Colors - DOS cyan
  primary: DOS_CYAN,
  primaryLight: '#80FFFF',
  primaryDark: '#00CCCC',

  // Secondary Colors - Yellow
  secondary: DOS_YELLOW,
  secondaryLight: '#FFFF80',
  secondaryDark: '#CCCC00',

  // Background colors - Black screen
  background: DOS_BLACK,
  backgroundDark: DOS_BLACK,
  backgroundDarker: DOS_BLACK,
  backgroundLight: '#0A0A0A',

  // Text colors - Cyan and white
  text: DOS_CYAN,
  textLight: DOS_WHITE,
  textDark: DOS_GRAY,
  textMuted: DOS_GRAY,

  // Borders - Cyan DOS style
  border: DOS_CYAN,
  borderLight: DOS_GRAY,
  borderDark: DOS_CYAN,

  // Components
  cardBackground: DOS_BLACK,
  inputBackground: DOS_BLACK,
  sidebarBackground: DOS_BLACK,
  sidebarItem: DOS_CYAN,
  sidebarItemActive: DOS_YELLOW,
  sidebarItemHover: DOS_WHITE,
  sidebarItemHoverActive: DOS_YELLOW,

  // Header
  headerTitle: DOS_CYAN,
  headerBackground: DOS_BLUE,

  // Modal
  modalItemBackground: DOS_BLACK,
  blackTwo: DOS_BLACK,

  // Status colors - DOS classic
  success: DOS_GREEN,
  error: DOS_RED,
  warning: DOS_YELLOW,
  info: DOS_CYAN,

  // Wallet
  walletSummaryBg: DOS_BLACK,
  walletSummaryBorder: DOS_CYAN,

  // Transactions
  transactionSent: DOS_RED,
  transactionReceived: DOS_GREEN,
  transactionPending: DOS_YELLOW,
  transactionFailed: DOS_GRAY,

  // Transaction Details Modal
  transactionDetailsBg: DOS_BLACK,
  transactionDetailsRowHover: '#0A0A0A',
  transactionDetailsDivider: DOS_CYAN,
  transactionDetailsLabel: DOS_GRAY,
  transactionDetailsShadow: '2px 2px 0 ' + DOS_CYAN,

  // Send/Receive
  sendCardBg: DOS_BLACK,
  sendCardBorder: DOS_CYAN,
  sendAdditionalOptionsBg: DOS_BLACK,
  sendAdditionalOptionsBorder: DOS_CYAN,
  sendAdditionalInputBg: DOS_BLACK,
  sendAdditionalInputText: DOS_CYAN,
  receiveCardBg: DOS_BLACK,

  // Settings
  settingsCardBg: DOS_BLACK,
  settingsLearnMore: DOS_YELLOW,
  settingsLearnMoreHovered: '#FFFF80',

  // Console
  consoleButton: DOS_CYAN,

  // Progress
  progressBar: DOS_GREEN,
  progressBackground: DOS_GRAY,

  // Buttons - DOS style
  buttonPrimaryBg: DOS_BLACK,
  buttonPrimaryHover: DOS_BLUE,
  buttonPrimaryDisabled: DOS_GRAY,
  buttonPrimaryText: DOS_CYAN,
  buttonSecondaryBg: DOS_BLACK,
  buttonSecondaryHover: '#0A0A0A',
  buttonSecondaryDisabled: DOS_GRAY,
  buttonSecondaryText: DOS_WHITE,
  buttonBorder: DOS_CYAN,

  // Special DOS touches
  shadowColor: DOS_CYAN,
  activeIconFill: DOS_YELLOW,
  inactiveIconFill: DOS_GRAY,

  // Dropdown
  dropdownBg: DOS_BLUE,
  dropdownHoverBg: DOS_CYAN,
  dropdownBorder: DOS_CYAN,

  // Input fields - DOS style
  inputBg: DOS_BLACK,
  inputBorder: DOS_CYAN,
  inputBorderActive: DOS_YELLOW,

  // QR Code
  qrCodeWrapperBg: DOS_BLACK,
  qrCodeWrapperBorder: DOS_CYAN,

  // Toast notifications
  toastBg: DOS_BLUE,
  toastBorder: DOS_CYAN,
  toastText: DOS_WHITE,

  // Logo
  logo: DOS_CYAN,
  logoBorder: DOS_CYAN,

  // Special effects
  gradientStart: DOS_BLACK,
  gradientEnd: DOS_BLUE,
};
