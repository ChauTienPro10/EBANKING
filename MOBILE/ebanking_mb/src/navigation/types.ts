import { UserInfoModel } from '../store/UserInfoModel';
import { TransferResponse } from '../store/fetchAPI/TransactionHistory';

export type RootStackParamList = {
  SignIn: undefined;
  SignUp: undefined;
  ForgotPassword: undefined;
  Home: undefined;
  Menu: undefined;
  Card: undefined;
  AccountAndCard: undefined;
  Transfer: {
    receiver: string;
    amount: string;
    content: string;
    bankCode: string;
  };
  Withdraw: undefined;
  MobilePrepaid: undefined;
  PayBill: undefined;
  SaveOnline: undefined;
  CreditCard: undefined;
  TransactionReport: undefined;
  Beneficiary: undefined;
  Loan: undefined;
  Investments: undefined;
  Insurance: undefined;
  Profile: undefined;
  Settings: undefined;
  Support: undefined;
  Chatbot: undefined;
  Notifications: undefined;
  Search: undefined;
  OpenCard: { userInfo: UserInfoModel | null };
  TransactionSuccess?: {
    amount: string;
    transactionId: string;
    date: string;
    receiver: string;
    content: string;
  };
  PendingTransactionScreen?: {
    amount: string;
    content: string;
    date: string;
    receiverName: string;
    transactionId?: string;
  };
  TransactionFailedScreen?: { errorString: string };
  TransactionHistoryScreen?: undefined;
  TransactionDetail: {
    transaction: TransferResponse;
    currentAccountNumber: string;
  };
  OTPPage: { username: string; targetPage: string };
  ShowNotificationScreen: { title: string; body: string };
  SetPINCode: undefined;
  ScannerScreen: {
    onScanSuccess: (value: string) => void;
  };
  EKYC: undefined;
  OCRCamera: {
    side: 'front' | 'back';
  };
  LivenessCamera: {
    frontImage: string;
    backImage: string;
  };
  ReviewScreen: {
    frontImage: string;
    backImage: string;
    videoPath: string;
  };
  ResultScreen: {
    sessionId: string;
    success: boolean;
    ocrResult?: any;
    livenessResult?: any;
    faceMatchResult?: any;
  };
  EKYCDetail: undefined;
  FaceAuthScreen: {
    reason: 'HIGH_AMOUNT' | 'DAILY_LIMIT';
    amount: string;
    onSuccess: (sessionId: string) => void;
  };
};
