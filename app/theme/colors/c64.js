// @flow
// Commodore 64 Color Theme for Zipher

// Original C64 Color Palette
const C64_BLACK = '#000000';
const C64_WHITE = '#FFFFFF';
const C64_RED = '#880000';
const C64_CYAN = '#AAFFEE';
const C64_PURPLE = '#CC44CC';
const C64_GREEN = '#00CC55';
const C64_BLUE = '#0000AA';
const C64_YELLOW = '#EEEE77';
const C64_ORANGE = '#DD8855';
const C64_BROWN = '#664400';
const C64_LIGHT_RED = '#FF7777';
const C64_DARK_GREY = '#333333';
const C64_GREY = '#777777';
const C64_LIGHT_GREEN = '#AAFF66';
const C64_LIGHT_BLUE = '#0088FF';
const C64_LIGHT_GREY = '#BBBBBB';

// Zipher C64 Theme Colors
const c64Theme = {
  // Background colors (classic C64 blue)
  background: '#352879',           // Deep C64 blue
  backgroundSecondary: '#3E31A2',  // Slightly lighter blue
  backgroundTertiary: '#4A3DB8',   // Accent blue

  // Text colors
  text: C64_CYAN,                  // Classic C64 cyan text
  textSecondary: '#7C70DA',        // Light purple
  textTertiary: C64_LIGHT_GREY,
  textDanger: C64_LIGHT_RED,
  textSuccess: C64_LIGHT_GREEN,
  textWarning: C64_YELLOW,

  // Border and divider colors
  border: '#5A4FCE',
  divider: '#4A3DB8',

  // Interactive elements
  buttonPrimary: C64_CYAN,
  buttonPrimaryText: C64_BLACK,
  buttonSecondary: '#5A4FCE',
  buttonSecondaryText: C64_WHITE,
  buttonDisabled: C64_DARK_GREY,
  buttonDisabledText: C64_GREY,

  // Input fields
  inputBackground: '#2A1F6A',
  inputBorder: C64_CYAN,
  inputText: C64_WHITE,
  inputPlaceholder: '#7C70DA',

  // Sidebar
  sidebarBackground: '#1A0F4A',
  sidebarItem: C64_CYAN,
  sidebarItemActive: C64_WHITE,
  sidebarItemHover: '#AAFFEE99',

  // Card backgrounds
  cardBackground: '#2A1F6A',
  cardBackgroundHover: '#3A2F7A',

  // Send view specific
  sendCardBg: '#2A1F6A',
  sendCardBorder: C64_CYAN,
  sendAdditionalOptionsBg: '#2A1F6A',
  sendAdditionalOptionsBorder: C64_CYAN,
  sendAdditionalInputBg: '#1A0F4A',
  sendAdditionalInputText: C64_WHITE,
  receiveCardBg: '#2A1F6A',

  // Shadows (minimal, retro style)
  shadow: 'rgba(0, 0, 0, 0.5)',

  // Special elements
  qrCodeBackground: C64_WHITE,
  qrCodeForeground: C64_BLACK,

  // Transaction colors
  transactionSent: C64_RED,
  transactionReceived: C64_GREEN,

  // Transaction Details Modal
  transactionDetailsBg: '#2A1F6A',          // Card background
  transactionDetailsRowHover: '#3A2F7A',    // Hover effect
  transactionDetailsDivider: C64_CYAN,      // Cyan divider
  transactionDetailsLabel: C64_CYAN,        // Cyan labels
  transactionDetailsShadow: '0px 4px 8px rgba(0, 0, 0, 0.5)', // Soft shadow
  transactionPending: C64_YELLOW,
  transactionFailed: C64_DARK_GREY,

  // Shielded-only theme (no transparent)
  shieldedAddress: C64_CYAN,
  shieldedIcon: C64_LIGHT_BLUE,

  // Status indicators
  statusReady: C64_GREEN,
  statusSyncing: C64_YELLOW,
  statusError: C64_RED,
  statusOffline: C64_GREY,

  // Retro effects
  scanlineColor: 'rgba(0, 0, 0, 0.1)',
  crtGlow: 'rgba(124, 112, 218, 0.3)',
  pixelBorder: C64_CYAN,

  // Modal/Dialog
  modalBackground: '#1A0F4A',
  modalOverlay: 'rgba(0, 0, 0, 0.8)',

  // Scrollbar
  scrollbarTrack: '#1A0F4A',
  scrollbarThumb: C64_CYAN,

  // Progress bars
  progressBackground: '#1A0F4A',
  progressFill: C64_CYAN,

  // Tooltips
  tooltipBackground: C64_BLACK,
  tooltipText: C64_CYAN,
  tooltipBorder: C64_CYAN,
};

export default c64Theme;