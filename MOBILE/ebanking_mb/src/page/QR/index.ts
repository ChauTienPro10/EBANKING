/**
 * QR Scanner Module
 * Export all components, screens, utilities, hooks, and services
 */

// Main Screen
export { default } from './ScannerScreen';
export { default as ScannerScreen } from './ScannerScreen';

// Screens
export { QRPaymentScreen, QRScanScreen, QRReceiveScreen } from './screens';

// Components
export {
  TabButton,
  QRCodeDisplay,
  BarcodeDisplay,
  CountdownTimer,
  AccountSelector,
  ScannerFrame,
} from './components';

// Hooks (for custom implementations)
export { useQRPayment, useQRReceive } from './hooks';

// Service (for direct API calls if needed)
export { default as QRService } from './services/qr.service';

// Types (for type safety)
export type {
  QRAccount,
  QRCodeData,
  QRGenerateRequest,
  QRGenerateResponse,
  QRVerifyPinRequest,
  QRVerifyPinResponse,
  QRReceiveRequest,
  QRScanResult,
  QRTransactionHistory,
} from './types';

// Styles
export { default as QRColors } from './styles/colors';
export { commonStyles } from './styles/commonStyles';
