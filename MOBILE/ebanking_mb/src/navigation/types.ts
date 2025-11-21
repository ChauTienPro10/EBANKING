import { UserInfoModel } from "../store/UserInfoModel";

export type RootStackParamList = {
    SignIn: undefined;
    SignUp: undefined;
    ForgotPassword: undefined;
    Home: undefined;
    Menu: undefined;
    AccountAndCard: undefined;
    Transfer: {receiver: string, amount: string, content: string, bankCode: string};
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
        content: string; // ✅ thêm dòng này
    };
    PendingTransactionScreen?: {
        amount: string;
        content: string;
        date: string;
        receiverName: string;
    };
    TransactionFailedScreen?: { errorString: string };
    TransactionHistoryScreen?: undefined;
    OTPPage: { username: string, targetPage: string };
    ShowNotificationScreen: { title: string, body: string };
    SetPINCode: undefined;
    ScannerScreen: {
        onScanSuccess: (value: string) => void;
    };
    EKYC: undefined;

};
