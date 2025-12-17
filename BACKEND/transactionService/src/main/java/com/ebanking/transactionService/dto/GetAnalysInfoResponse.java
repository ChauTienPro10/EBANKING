package com.ebanking.transactionService.dto;

import com.ebanking.transactionService.entity.Account;
import com.ebanking.transactionService.entity.Transaction;

import lombok.Data;
import java.math.BigDecimal;

@Data
public class GetAnalysInfoResponse {
    long totalAmountInPeriodByUsername;
    long transactionCountInPeriodByUsername;
    Transaction transactionLargestInPeriodByUsername;
    Account mostAccountInfoTransferManyTimeInPeriod;
    long transferHasAmountLargestInPeriod;
    long accountHasBeenTransferWithTheMostAmountInPeriod;

    long mostAccountInfoTransferManyTimeInPeriodCount;
    BigDecimal mostAccountInfoTransferManyTimeInPeriodTotalAmount;

    BigDecimal totalIncomingAmount;
    BigDecimal totalOutgoingAmount;

    // Thông tin giao dịch bất thường
    long midnightTransactionsCount; // Số lượng giao dịch lúc nửa đêm (00:00-05:00)
    long frequentTransactionsToSameAccountCount; // Số lượng giao dịch liên tục đến cùng tài khoản
}
