// @flow

// Classic Macintosh System 7 color palette
export const mac80s = {
  // Primary Colors - Classic Mac beige/platinum
  primary: '#C0C0C0',           // Classic Mac Platinum
  primaryLight: '#DFDFDF',      // Light platinum
  primaryDark: '#8B8B8B',       // Dark platinum

  // Secondary - Classic Mac blue accent
  secondary: '#000080',         // Classic Mac blue
  secondaryLight: '#4169E1',    // Royal blue
  secondaryDark: '#000050',     // Dark blue

  // Background colors - Mac beige/gray
  background: '#F0F0F0',        // Classic Mac background
  backgroundDark: '#C0C0C0',    // Window background
  backgroundDarker: '#808080',  // Dark gray
  backgroundLight: '#FFFFFF',   // Pure white for highlights

  // Text colors - High contrast
  text: '#000000',              // Pure black text
  textLight: '#333333',         // Slightly lighter text
  textDark: '#000000',          // Black
  textMuted: '#606060',         // Muted gray text

  // Border and lines - Classic Mac style
  border: '#000000',            // Black borders (classic Mac)
  borderLight: '#808080',       // Gray borders
  borderDark: '#000000',        // Black

  // Component specific colors
  cardBackground: '#DFDFDF',        // Classic dialog box color
  cardBackgroundColor: '#FFFFFF',   // White card background
  inputBackground: '#FFFFFF',       // White input fields
  sidebarBackground: '#C0C0C0',  // Platinum sidebar
  sidebarItem: '#000000',       // Black text
  sidebarItemActive: '#000080', // Blue for active
  sidebarItemHover: '#E0E0E0',  // Light hover
  sidebarItemHoverActive: '#4169E1',

  // Header/Title bar
  headerTitle: '#000000',       // Black text
  headerBackground: '#DFDFDF',  // Classic Mac title bar

  // Modal/Dialog
  modalItemBackground: '#F0F0F0',
  modalItemLabel: '#606060',        // Muted gray for modal labels
  blackTwo: '#1D1D1D',

  // Status colors with Mac style
  success: '#008000',           // Classic green
  error: '#FF0000',             // Classic red
  warning: '#FFD700',           // Gold warning
  info: '#4169E1',              // Royal blue

  // Wallet specific
  walletSummaryBg: '#DFDFDF',
  walletSummaryBorder: '#000000',
  walletSummaryTransparent: '#808080',  // Gray text for transparent balance
  walletSummaryUnconfirmed: '#FFA500',  // Orange for unconfirmed
  activeItem: '#000080',                // Blue for active/shielded items

  // Transactions
  transactionsDate: '#606060',       // Muted gray for transaction dates
  transactionSent: '#FF0000',        // Red for sent
  transactionReceived: '#008000',    // Green for received
  transactionPending: '#808080',     // Gray for pending
  transactionFailed: '#800000',      // Dark red for failed

  // Transaction Details Modal
  transactionDetailsBg: '#DFDFDF',          // Classic dialog box
  transactionDetailsRowHover: '#C0C0C0',    // Hover effect
  transactionDetailsDivider: '#808080',     // Divider line
  transactionDetailsLabel: '#606060',       // Label text
  transactionDetailsShadow: '2px 2px 0 #000000, 4px 4px 0 #808080', // Classic Mac shadow

  // Send/Receive views
  sendCardBg: '#F0F0F0',
  sendCardBorder: '#000000',
  sendAdditionalOptionsBg: '#DFDFDF',
  sendAdditionalOptionsBorder: '#000000',
  sendAdditionalInputBg: '#FFFFFF',
  sendAdditionalInputText: '#000000',
  receiveCardBg: '#F0F0F0',

  // Settings
  settingsCardBg: '#DFDFDF',
  settingsLearnMore: '#000080',
  settingsLearnMoreHovered: '#4169E1',

  // Console
  consoleButton: '#000000',

  // Progress/Loading
  progressBar: '#000080',
  progressBackground: '#C0C0C0',

  // Buttons - Classic Mac style
  buttonPrimaryBg: '#DFDFDF',
  buttonPrimaryHover: '#C0C0C0',
  buttonPrimaryDisabled: '#808080',
  buttonPrimaryText: '#000000',
  buttonSecondaryBg: '#FFFFFF',
  buttonSecondaryHover: '#F0F0F0',
  buttonSecondaryDisabled: '#C0C0C0',
  buttonSecondaryText: '#000000',
  buttonBorder: '#000000',

  // Special Mac touches
  shadowColor: '#000000',       // Black shadows
  activeIconFill: '#000080',    // Blue for active icons
  inactiveIconFill: '#808080',  // Gray for inactive

  // Dropdown
  dropdownBg: '#FFFFFF',
  dropdownHoveredBg: '#000080',        // Blue highlight when hovered
  dropdownHoverBg: '#DFDFDF',          // Legacy support
  dropdownBorder: '#000000',
  dropdownIconBorder: '#808080',       // Gray border for closed dropdown icon
  dropdownOpenedIconBorder: '#000080', // Blue border for opened dropdown icon

  // Input fields - Mac style
  inputBg: '#FFFFFF',
  inputBorder: '#000000',
  inputBorderActive: '#000080',

  // QR Code
  qrCodeWrapperBg: 'transparent',
  qrCodeWrapperBorder: '#000000',

  // Toast notifications
  toastBg: '#F0F0F0',
  toastBorder: '#000000',
  toastText: '#000000',

  // Logo
  logo: '#000000',
  logoBorder: '#000000',

  // Special effects
  gradientStart: '#DFDFDF',
  gradientEnd: '#C0C0C0',
};