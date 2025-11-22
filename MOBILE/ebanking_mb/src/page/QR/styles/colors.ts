import Colors from '../../../constants/color';

export const QRColors = {
  // Primary colors from project
  primary: Colors.main_bule,
  primaryLight: '#4db5b9',
  primaryDark: '#078087',

  // Secondary colors
  secondary: Colors.main_green,

  // Background colors
  background: Colors.background,
  cardBackground: Colors.white,
  overlayBackground: 'rgba(0, 0, 0, 0.8)',

  // Text colors
  textPrimary: Colors.textPrimary,
  textSecondary: Colors.textSecondary,
  textLight: Colors.grey3,
  textWhite: Colors.white,

  // Border colors
  border: Colors.border,
  borderLight: Colors.grey2,

  // Status colors
  success: Colors.main_green,
  warning: Colors.yellow,
  error: Colors.red,

  // QR specific colors
  scannerFrame: Colors.white,
  scannerLine: Colors.main_green,
  flashActive: Colors.yellow,
  flashInactive: 'rgba(255, 255, 255, 0.3)',
};

export default QRColors;
