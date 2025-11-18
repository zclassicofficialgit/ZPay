// @flow
// Windows 1.0 (1986) Theme - Classic early Windows colors

const WIN_WHITE = '#FFFFFF';
const WIN_BLACK = '#000000';
const WIN_GRAY = '#C0C0C0';
const WIN_DARK_GRAY = '#808080';
const WIN_BLUE = '#000080';
const WIN_CYAN = '#00FFFF';

export const windows1986 = {
  // Primary Colors - Classic Windows blue
  primary: WIN_BLUE,
  primaryLight: '#0000FF',
  primaryDark: '#000040',

  // Secondary Colors - Cyan accent
  secondary: WIN_CYAN,
  secondaryLight: '#80FFFF',
  secondaryDark: '#00CCCC',

  // Background colors - Gray desktop
  background: WIN_GRAY,
  backgroundDark: WIN_DARK_GRAY,
  backgroundDarker: '#404040',
  backgroundLight: '#E0E0E0',

  // Text colors
  text: WIN_BLACK,
  textLight: '#202020',
  textDark: WIN_BLACK,
  textMuted: WIN_DARK_GRAY,

  // Borders - Windows classic borders
  border: WIN_BLACK,
  borderLight: WIN_WHITE,
  borderDark: WIN_DARK_GRAY,

  // Components
  cardBackground: WIN_WHITE,
  inputBackground: WIN_WHITE,
  sidebarBackground: WIN_GRAY,
  sidebarItem: WIN_BLACK,
  sidebarItemActive: WIN_WHITE,
  sidebarItemHover: WIN_BLUE,
  sidebarItemHoverActive: '#0000FF',

  // Header
  headerTitle: WIN_WHITE,
  headerBackground: WIN_BLUE,

  // Modal
  modalItemBackground: WIN_WHITE,
  blackTwo: '#1D1D1D',

  // Status colors
  success: '#00FF00',
  error: '#FF0000',
  warning: '#FFFF00',
  info: WIN_CYAN,

  // Wallet
  walletSummaryBg: WIN_WHITE,
  walletSummaryBorder: WIN_BLACK,

  // Transactions
  transactionSent: '#FF0000',
  transactionReceived: '#00FF00',
  transactionPending: '#FFFF00',
  transactionFailed: WIN_DARK_GRAY,

  // Transaction Details Modal
  transactionDetailsBg: WIN_WHITE,
  transactionDetailsRowHover: WIN_GRAY,
  transactionDetailsDivider: WIN_BLACK,
  transactionDetailsLabel: WIN_DARK_GRAY,
  transactionDetailsShadow: '2px 2px 0 ' + WIN_BLACK,

  // Send/Receive
  sendCardBg: WIN_WHITE,
  sendCardBorder: WIN_BLACK,
  sendAdditionalOptionsBg: WIN_GRAY,
  sendAdditionalOptionsBorder: WIN_BLACK,
  sendAdditionalInputBg: WIN_WHITE,
  sendAdditionalInputText: WIN_BLACK,
  receiveCardBg: WIN_WHITE,

  // Settings
  settingsCardBg: WIN_WHITE,
  settingsLearnMore: WIN_BLUE,
  settingsLearnMoreHovered: '#0000FF',

  // Console
  consoleButton: WIN_BLACK,

  // Progress
  progressBar: WIN_BLUE,
  progressBackground: WIN_GRAY,

  // Buttons
  buttonPrimaryBg: WIN_GRAY,
  buttonPrimaryHover: WIN_WHITE,
  buttonPrimaryDisabled: WIN_DARK_GRAY,
  buttonPrimaryText: WIN_BLACK,
  buttonSecondaryBg: WIN_WHITE,
  buttonSecondaryHover: WIN_GRAY,
  buttonSecondaryDisabled: '#E0E0E0',
  buttonSecondaryText: WIN_BLACK,
  buttonBorder: WIN_BLACK,

  // Special
  shadowColor: WIN_BLACK,
  activeIconFill: WIN_BLUE,
  inactiveIconFill: WIN_DARK_GRAY,

  // Dropdown
  dropdownBg: WIN_WHITE,
  dropdownHoverBg: WIN_BLUE,
  dropdownBorder: WIN_BLACK,

  // Input
  inputBg: WIN_WHITE,
  inputBorder: WIN_BLACK,
  inputBorderActive: WIN_BLUE,

  // QR Code
  qrCodeWrapperBg: WIN_WHITE,
  qrCodeWrapperBorder: WIN_BLACK,

  // Toast
  toastBg: WIN_WHITE,
  toastBorder: WIN_BLACK,
  toastText: WIN_BLACK,

  // Logo
  logo: WIN_BLUE,
  logoBorder: WIN_BLACK,

  // Effects
  gradientStart: WIN_GRAY,
  gradientEnd: WIN_WHITE,
};