package com.ebanking.transactionService.service;

import com.ebanking.transactionService.dto.GetAnalysInfoRequest;
import com.ebanking.transactionService.dto.GetAnalysInfoResponse;
import com.ebanking.transactionService.repository.AccountRepository;
import com.ebanking.transactionService.repository.TransactionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.temporal.TemporalAdjusters;
import java.time.DayOfWeek;

@Service
public class AnalysService {
    @Autowired
    TransactionRepository transactionRepository;

    @Autowired
    AccountRepository accountRepository;

    public GetAnalysInfoResponse getInfoAnalys(GetAnalysInfoRequest request) {
        GetAnalysInfoResponse response = new GetAnalysInfoResponse();

        // Calculate time range (e.g., last 30 days)
        long toDate = System.currentTimeMillis() / 1000; // Current time in seconds
        long fromDate = toDate - (30L * 24 * 60 * 60); // 30 days ago in seconds

        String username = request.getUserId();

        return getAnalysInfoByPeriod(username, fromDate, toDate);
    }

    /**
     * Get analytics info for current month
     */
    public GetAnalysInfoResponse getInfoAnalysCurrentMonth(String username) {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime startOfMonth = now.withDayOfMonth(1).withHour(0).withMinute(0).withSecond(0).withNano(0);
        LocalDateTime endOfMonth = now;

        long fromDate = startOfMonth.atZone(ZoneId.systemDefault()).toEpochSecond();
        long toDate = endOfMonth.atZone(ZoneId.systemDefault()).toEpochSecond();

        return getAnalysInfoByPeriod(username, fromDate, toDate);
    }

    /**
     * Get analytics info for previous month
     */
    public GetAnalysInfoResponse getInfoAnalysPreviousMonth(String username) {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime startOfPreviousMonth = now.minusMonths(1)
                .withDayOfMonth(1)
                .withHour(0).withMinute(0).withSecond(0).withNano(0);
        LocalDateTime endOfPreviousMonth = now.minusMonths(1)
                .with(TemporalAdjusters.lastDayOfMonth())
                .withHour(23).withMinute(59).withSecond(59).withNano(999999999);

        long fromDate = startOfPreviousMonth.atZone(ZoneId.systemDefault()).toEpochSecond();
        long toDate = endOfPreviousMonth.atZone(ZoneId.systemDefault()).toEpochSecond();

        return getAnalysInfoByPeriod(username, fromDate, toDate);
    }

    /**
     * Get analytics info for current week (Monday to Sunday)
     */
    public GetAnalysInfoResponse getInfoAnalysCurrentWeek(String username) {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime startOfWeek = now.with(DayOfWeek.MONDAY)
                .withHour(0).withMinute(0).withSecond(0).withNano(0);
        LocalDateTime endOfWeek = now;

        long fromDate = startOfWeek.atZone(ZoneId.systemDefault()).toEpochSecond();
        long toDate = endOfWeek.atZone(ZoneId.systemDefault()).toEpochSecond();

        return getAnalysInfoByPeriod(username, fromDate, toDate);
    }

    /**
     * Get analytics info for previous week (Monday to Sunday)
     */
    public GetAnalysInfoResponse getInfoAnalysPreviousWeek(String username) {
        LocalDateTime now = LocalDateTime.now();
        LocalDateTime startOfPreviousWeek = now.minusWeeks(1)
                .with(DayOfWeek.MONDAY)
                .withHour(0).withMinute(0).withSecond(0).withNano(0);
        LocalDateTime endOfPreviousWeek = now.minusWeeks(1)
                .with(DayOfWeek.SUNDAY)
                .withHour(23).withMinute(59).withSecond(59).withNano(999999999);

        long fromDate = startOfPreviousWeek.atZone(ZoneId.systemDefault()).toEpochSecond();
        long toDate = endOfPreviousWeek.atZone(ZoneId.systemDefault()).toEpochSecond();

        return getAnalysInfoByPeriod(username, fromDate, toDate);
    }

    /**
     * Get analytics info for custom time period
     * 
     * @param username User ID
     * @param fromDate Start date in Unix timestamp (seconds)
     * @param toDate   End date in Unix timestamp (seconds)
     */
    public GetAnalysInfoResponse getInfoAnalysCustomPeriod(String username, long fromDate, long toDate) {
        return getAnalysInfoByPeriod(username, fromDate, toDate);
    }

    /**
     * Helper method to get analytics info for any time period
     */
    private GetAnalysInfoResponse getAnalysInfoByPeriod(String username, long fromDate, long toDate) {
        GetAnalysInfoResponse response = new GetAnalysInfoResponse();

        // Get total amount in period
        Long totalAmount = transactionRepository.getTotalAmountInPeriodByUsername(username, fromDate, toDate);
        response.setTotalAmountInPeriodByUsername(totalAmount != null ? totalAmount : 0L);

        // Get largest transaction in period
        response.setTransactionLargestInPeriodByUsername(
                transactionRepository.getTransactionLargestInPeriodByUsername(username, fromDate, toDate));

        // Get account that received most transfers
        response.setMostAccountInfoTransferManyTimeInPeriod(
                transactionRepository.getMostAccountInfoTransferManyTimeInPeriod(username, fromDate, toDate));

        // Get largest transfer amount
        Long largestTransferAmount = transactionRepository.getTransferHasAmountLargestInPeriod(username, fromDate,
                toDate);
        response.setTransferHasAmountLargestInPeriod(largestTransferAmount != null ? largestTransferAmount : 0L);

        // Get account that received most total amount
        Long accountWithMostAmount = transactionRepository.getAccountHasBeenTransferWithTheMostAmountInPeriod(username,
                fromDate, toDate);
        response.setAccountHasBeenTransferWithTheMostAmountInPeriod(
                accountWithMostAmount != null ? accountWithMostAmount : 0L);

        // ========== PHÁT HIỆN GIAO DỊCH BẤT THƯỜNG ==========

        // Đếm số lượng giao dịch lúc nửa đêm (00:00 - 05:00)
        long midnightTransactionsCount = transactionRepository.findMidnightTransactions(
                username, fromDate, toDate, PageRequest.of(0, Integer.MAX_VALUE))
                .getTotalElements();
        response.setMidnightTransactionsCount(midnightTransactionsCount);

        // Đếm số lượng giao dịch liên tục đến cùng tài khoản
        // Tham số: >= 3 giao dịch trong vòng 10 phút
        long frequentTransactionsCount = transactionRepository.findFrequentTransactionsToSameAccount(
                username, fromDate, toDate, 3, 10, PageRequest.of(0, Integer.MAX_VALUE))
                .getTotalElements();
        response.setFrequentTransactionsToSameAccountCount(frequentTransactionsCount);

        return response;
    }

    // ========== PHƯƠNG THỨC LẤY CHI TIẾT GIAO DỊCH BẤT THƯỜNG ==========

    /**
     * Lấy danh sách giao dịch lúc nửa đêm (00:00 - 05:00)
     * 
     * @param username Tên người dùng
     * @param fromDate Thời gian bắt đầu (Unix timestamp)
     * @param toDate   Thời gian kết thúc (Unix timestamp)
     * @param page     Số trang (bắt đầu từ 0)
     * @param size     Số lượng bản ghi mỗi trang
     * @return Danh sách giao dịch lúc nửa đêm
     */
    public org.springframework.data.domain.Page<com.ebanking.transactionService.entity.Transaction> getMidnightTransactions(
            String username, long fromDate, long toDate, int page, int size) {
        return transactionRepository.findMidnightTransactions(
                username, fromDate, toDate, PageRequest.of(page, size));
    }

    /**
     * Lấy danh sách giao dịch liên tục đến cùng một tài khoản
     * 
     * @param username          Tên người dùng
     * @param fromDate          Thời gian bắt đầu (Unix timestamp)
     * @param toDate            Thời gian kết thúc (Unix timestamp)
     * @param minTransactions   Số lượng giao dịch tối thiểu (mặc định: 3)
     * @param timeWindowMinutes Khoảng thời gian tính bằng phút (mặc định: 10)
     * @param page              Số trang (bắt đầu từ 0)
     * @param size              Số lượng bản ghi mỗi trang
     * @return Danh sách giao dịch bất thường
     */
    public org.springframework.data.domain.Page<com.ebanking.transactionService.entity.Transaction> getFrequentTransactionsToSameAccount(
            String username, long fromDate, long toDate, int minTransactions, int timeWindowMinutes, int page,
            int size) {
        return transactionRepository.findFrequentTransactionsToSameAccount(
                username, fromDate, toDate, minTransactions, timeWindowMinutes, PageRequest.of(page, size));
    }
}
