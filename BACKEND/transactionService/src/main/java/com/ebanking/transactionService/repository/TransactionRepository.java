package com.ebanking.transactionService.repository;

import com.ebanking.transactionService.entity.Account;
import com.ebanking.transactionService.entity.Transaction;
import org.springframework.data.domain.Page;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import org.springframework.data.domain.Pageable;

import java.time.LocalDateTime;
import java.math.BigDecimal;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Long> {

        @Query("SELECT t FROM Transaction t WHERE " +
                        "(:accountNumber IS NULL OR t.senderAccountNumber = :accountNumber OR t.receiverAccountNumber = :accountNumber) AND " +
                        "(:fromDate IS NULL OR t.transactionAt >= :fromDate) AND " +
                        "(:toDate IS NULL OR t.transactionAt <= :toDate)")
        Page<Transaction> findByAccountNumberAndDateRange(
                        @Param("accountNumber") String accountNumber,
                        @Param("fromDate") LocalDateTime fromDate,
                        @Param("toDate") LocalDateTime toDate,
                        Pageable pageable);

        // Get total amount of all transactions in a period by username
        @Query("SELECT COALESCE(SUM(t.amount), 0) FROM Transaction t WHERE " +
                        "t.username = :username AND " +
                        "t.status = 'SUCCESS' AND " +
                        "FUNCTION('UNIX_TIMESTAMP', t.transactionAt) BETWEEN :fromDate AND :toDate")
        Long getTotalAmountInPeriodByUsername(@Param("username") String username,
                        @Param("fromDate") long fromDate,
                        @Param("toDate") long toDate);

        // Get total number of transactions in a period by username
        @Query("SELECT COUNT(t) FROM Transaction t WHERE " +
                        "t.username = :username AND " +
                        "t.status = 'SUCCESS' AND " +
                        "FUNCTION('UNIX_TIMESTAMP', t.transactionAt) BETWEEN :fromDate AND :toDate")
        Long countTransactionsInPeriodByUsername(@Param("username") String username,
                        @Param("fromDate") long fromDate,
                        @Param("toDate") long toDate);

        // Get the transaction with the largest amount in a period by username
        @Query("SELECT t FROM Transaction t WHERE " +
                        "t.username = :username AND " +
                        "t.status = 'SUCCESS' AND " +
                        "FUNCTION('UNIX_TIMESTAMP', t.transactionAt) BETWEEN :fromDate AND :toDate " +
                        "ORDER BY t.amount DESC LIMIT 1")
        Transaction getTransactionLargestInPeriodByUsername(@Param("username") String username,
                        @Param("fromDate") long fromDate,
                        @Param("toDate") long toDate);

        // Get the account that received the most transfers in a period
        @Query(value = "SELECT a.* FROM account a " +
                        "INNER JOIN (" +
                        "    SELECT t.receiver_account_number, COUNT(*) as transfer_count " +
                        "    FROM transaction t " +
                        "    WHERE t.username = :username " +
                        "    AND t.status = 'SUCCESS' " +
                        "    AND UNIX_TIMESTAMP(t.transaction_at) BETWEEN :fromDate AND :toDate " +
                        "    GROUP BY t.receiver_account_number " +
                        "    ORDER BY transfer_count DESC " +
                        "    LIMIT 1" +
                        ") AS most_transferred " +
                        "ON a.account_number = most_transferred.receiver_account_number", nativeQuery = true)
        Account getMostAccountInfoTransferManyTimeInPeriod(@Param("username") String username,
                        @Param("fromDate") long fromDate,
                        @Param("toDate") long toDate);

        // Get transfer statistics (count and total amount) for a specific receiver
        // account
        @Query("SELECT COUNT(t), COALESCE(SUM(t.amount), 0) FROM Transaction t WHERE " +
                        "t.username = :username AND " +
                        "t.receiverAccountNumber = :receiverAccountNumber AND " +
                        "t.status = 'SUCCESS' AND " +
                        "FUNCTION('UNIX_TIMESTAMP', t.transactionAt) BETWEEN :fromDate AND :toDate")
        java.util.List<Object[]> getTransferStatsByReceiver(@Param("username") String username,
                        @Param("receiverAccountNumber") String receiverAccountNumber,
                        @Param("fromDate") long fromDate,
                        @Param("toDate") long toDate);

        // Get the largest transfer amount in a period by username
        @Query("SELECT COALESCE(MAX(t.amount), 0) FROM Transaction t WHERE " +
                        "t.username = :username AND " +
                        "t.status = 'SUCCESS' AND " +
                        "FUNCTION('UNIX_TIMESTAMP', t.transactionAt) BETWEEN :fromDate AND :toDate")
        Long getTransferHasAmountLargestInPeriod(@Param("username") String username,
                        @Param("fromDate") long fromDate,
                        @Param("toDate") long toDate);

        // Get the account number that received the most total amount in a period
        @Query(value = "SELECT t.receiver_account_number " +
                        "FROM transaction t " +
                        "WHERE t.username = :username " +
                        "AND t.status = 'SUCCESS' " +
                        "AND UNIX_TIMESTAMP(t.transaction_at) BETWEEN :fromDate AND :toDate " +
                        "GROUP BY t.receiver_account_number " +
                        "ORDER BY SUM(t.amount) DESC " +
                        "LIMIT 1", nativeQuery = true)
        Long getAccountHasBeenTransferWithTheMostAmountInPeriod(@Param("username") String username,
                        @Param("fromDate") long fromDate,
                        @Param("toDate") long toDate);

        // Get total incoming amount for an account in a period
        @Query("SELECT COALESCE(SUM(t.amount), 0) FROM Transaction t WHERE " +
                        "t.receiverAccountNumber = :accountNumber AND " +
                        "t.status = 'SUCCESS' AND " +
                        "t.transactionAt BETWEEN :fromDate AND :toDate")
        BigDecimal getTotalIncomingAmountByAccountNumber(@Param("accountNumber") String accountNumber,
                        @Param("fromDate") LocalDateTime fromDate,
                        @Param("toDate") LocalDateTime toDate);

        // Get total outgoing amount for an account in a period
        @Query("SELECT COALESCE(SUM(t.amount), 0) FROM Transaction t WHERE " +
                        "t.senderAccountNumber = :accountNumber AND " +
                        "t.status = 'SUCCESS' AND " +
                        "t.transactionAt BETWEEN :fromDate AND :toDate")
        BigDecimal getTotalOutgoingAmountByAccountNumber(@Param("accountNumber") String accountNumber,
                        @Param("fromDate") LocalDateTime fromDate,
                        @Param("toDate") LocalDateTime toDate);

        // ========== PHÁT HIỆN GIAO DỊCH BẤT THƯỜNG ==========

        /**
         * Lấy các giao dịch thực hiện lúc nửa đêm (từ 00:00 đến 05:00)
         * Đây là dấu hiệu bất thường vì ít người thực hiện giao dịch vào giờ này
         * 
         * @param username Tên người dùng
         * @param fromDate Thời gian bắt đầu (Unix timestamp)
         * @param toDate   Thời gian kết thúc (Unix timestamp)
         * @param pageable Phân trang
         * @return Danh sách giao dịch lúc nửa đêm
         */
        @Query("SELECT t FROM Transaction t WHERE " +
                        "t.username = :username AND " +
                        "t.status = 'SUCCESS' AND " +
                        "FUNCTION('UNIX_TIMESTAMP', t.transactionAt) BETWEEN :fromDate AND :toDate AND " +
                        "FUNCTION('HOUR', t.transactionAt) >= 0 AND " +
                        "FUNCTION('HOUR', t.transactionAt) < 5")
        Page<Transaction> findMidnightTransactions(@Param("username") String username,
                        @Param("fromDate") long fromDate,
                        @Param("toDate") long toDate,
                        Pageable pageable);

        /**
         * Lấy các giao dịch liên tục gửi đến cùng một tài khoản trong khoảng thời gian
         * ngắn
         * Phát hiện các tài khoản nhận được nhiều giao dịch từ cùng một người trong
         * thời gian ngắn
         * 
         * @param username          Tên người dùng
         * @param fromDate          Thời gian bắt đầu (Unix timestamp)
         * @param toDate            Thời gian kết thúc (Unix timestamp)
         * @param minTransactions   Số lượng giao dịch tối thiểu để coi là bất thường
         *                          (ví dụ: 3)
         * @param timeWindowMinutes Khoảng thời gian tính bằng phút (ví dụ: 10 phút)
         * @return Danh sách giao dịch bất thường
         */
        @Query(value = "SELECT t1.* FROM transaction t1 " +
                        "WHERE t1.username = :username " +
                        "AND t1.status = 'SUCCESS' " +
                        "AND UNIX_TIMESTAMP(t1.transaction_at) BETWEEN :fromDate AND :toDate " +
                        "AND ( " +
                        "    SELECT COUNT(*) FROM transaction t2 " +
                        "    WHERE t2.username = t1.username " +
                        "    AND t2.receiver_account_number = t1.receiver_account_number " +
                        "    AND t2.status = 'SUCCESS' " +
                        "    AND ABS(TIMESTAMPDIFF(MINUTE, t1.transaction_at, t2.transaction_at)) <= :timeWindowMinutes "
                        +
                        ") >= :minTransactions " +
                        "ORDER BY t1.transaction_at DESC", nativeQuery = true)
        Page<Transaction> findFrequentTransactionsToSameAccount(@Param("username") String username,
                        @Param("fromDate") long fromDate,
                        @Param("toDate") long toDate,
                        @Param("minTransactions") int minTransactions,
                        @Param("timeWindowMinutes") int timeWindowMinutes,
                        Pageable pageable);
}