export interface AnalysisTransaction {
    transactionId: number;
    username: string;
    senderAccountNumber: string;
    receiverAccountNumber: string;
    amount: number;
    currency: string;
    transactionType: string;
    status: string;
    description: string;
    failureReason: string | null;
    transactionAt: string;
    requiresFaceAuth: boolean;
    faceAuthSessionId: string;
    faceAuthVerified: boolean;
    faceAuthAt: string | null;
}

export interface AnalysisAccountInfo {
    accountId: number;
    accountNumber: string;
    accountType: string;
    balance: number;
    currency: string;
    status: string;
    openedDate: string;
    closedDate: string | null;
    isPrimary: boolean;
    userId: number;
    lastTransactionAt: string | null;
    createdAt: string;
    updatedAt: string | null;
}

export interface AnalysisData {
    totalAmountInPeriodByUsername: number;
    transactionLargestInPeriodByUsername: AnalysisTransaction | null;
    mostAccountInfoTransferManyTimeInPeriod: AnalysisAccountInfo | null;
    transferHasAmountLargestInPeriod: number;
    accountHasBeenTransferWithTheMostAmountInPeriod: number;
    midnightTransactionsCount: number;
    frequentTransactionsToSameAccountCount: number;
}
