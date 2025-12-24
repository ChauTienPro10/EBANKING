package com.ebanking.chatbotService.service;

import com.ebanking.chatbotService.entity.InterestRate;
import com.ebanking.chatbotService.entity.SavingsAccount;
import lombok.extern.slf4j.Slf4j;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

/**
 * Service để truy vấn thông tin savings account từ DB_TRANSACTION_SERVICE
 */
@Service
@Slf4j
public class SavingAccountService {

    private final JdbcTemplate transactionServiceJdbcTemplate;

    public SavingAccountService(Map<String, JdbcTemplate> externalJdbcTemplates) {
        log.info("Initializing SavingAccountService with external JdbcTemplates: {}", 
                 externalJdbcTemplates != null ? externalJdbcTemplates.keySet() : "null");
        
        if (externalJdbcTemplates == null) {
            throw new IllegalStateException("externalJdbcTemplates map is null. Check ExternalDbConfig configuration.");
        }
        
        this.transactionServiceJdbcTemplate = externalJdbcTemplates.get("DB_TRANSACTION_SERVICE");
        
        if (this.transactionServiceJdbcTemplate == null) {
            throw new IllegalStateException("DB_TRANSACTION_SERVICE JdbcTemplate not found in externalJdbcTemplates. Available keys: " 
                                          + externalJdbcTemplates.keySet());
        }
        
        log.info("SavingAccountService initialized successfully with DB_TRANSACTION_SERVICE JdbcTemplate");
    }

    /**
     * Lấy tất cả savings accounts của user theo userId
     */
    public List<SavingsAccount> getSavingsAccountsByUserId(Long userId) {
        try {
            String sql = "SELECT savings_account_id, account_number, user_id, payment_account_id, " +
                        "balance, currency, interest_rate_id, term_months, status, " +
                        "opened_date, maturity_date, closed_date, last_interest_calculated_at, " +
                        "total_interest_earned, created_at, updated_at " +
                        "FROM savings_account " +
                        "WHERE user_id = ? " +
                        "ORDER BY opened_date DESC";
            
            log.debug("Executing SQL for getSavingsAccountsByUserId: {} with userId: {}", sql, userId);
            
            List<SavingsAccount> savingsAccounts = transactionServiceJdbcTemplate.query(sql, new SavingsAccountRowMapper(), userId);
            log.debug("Found {} savings accounts for user {}", savingsAccounts.size(), userId);
            
            return savingsAccounts;
            
        } catch (Exception e) {
            log.error("Lỗi khi lấy savings accounts của user {}: {}", userId, e.getMessage());
            return List.of();
        }
    }

    /**
     * Lấy savings account theo account number
     */
    public SavingsAccount getSavingsAccountByAccountNumber(String accountNumber) {
        try {
            String sql = "SELECT savings_account_id, account_number, user_id, payment_account_id, " +
                        "balance, currency, interest_rate_id, term_months, status, " +
                        "opened_date, maturity_date, closed_date, last_interest_calculated_at, " +
                        "total_interest_earned, created_at, updated_at " +
                        "FROM savings_account " +
                        "WHERE account_number = ?";
            
            log.debug("Executing SQL for getSavingsAccountByAccountNumber: {} with accountNumber: {}", sql, accountNumber);
            
            SavingsAccount savingsAccount = transactionServiceJdbcTemplate.queryForObject(sql, new SavingsAccountRowMapper(), accountNumber);
            log.debug("Found savings account: {}", savingsAccount != null ? savingsAccount.getAccountNumber() : "null");
            
            return savingsAccount;
            
        } catch (Exception e) {
            log.error("Lỗi khi lấy savings account theo số tài khoản {}: {}", accountNumber, e.getMessage());
            return null;
        }
    }

    /**
     * Lấy savings account theo ID
     */
    public SavingsAccount getSavingsAccountById(Long savingsAccountId) {
        try {
            String sql = "SELECT savings_account_id, account_number, user_id, payment_account_id, " +
                        "balance, currency, interest_rate_id, term_months, status, " +
                        "opened_date, maturity_date, closed_date, last_interest_calculated_at, " +
                        "total_interest_earned, created_at, updated_at " +
                        "FROM savings_account " +
                        "WHERE savings_account_id = ?";
            
            log.debug("Executing SQL for getSavingsAccountById: {} with savingsAccountId: {}", sql, savingsAccountId);
            
            SavingsAccount savingsAccount = transactionServiceJdbcTemplate.queryForObject(sql, new SavingsAccountRowMapper(), savingsAccountId);
            log.debug("Found savings account: {}", savingsAccount != null ? savingsAccount.getAccountNumber() : "null");
            
            return savingsAccount;
            
        } catch (Exception e) {
            log.error("Lỗi khi lấy savings account theo ID {}: {}", savingsAccountId, e.getMessage());
            return null;
        }
    }

    /**
     * Lấy savings accounts đang hoạt động của user
     */
    public List<SavingsAccount> getActiveSavingsAccountsByUserId(Long userId) {
        try {
            String sql = "SELECT savings_account_id, account_number, user_id, payment_account_id, " +
                        "balance, currency, interest_rate_id, term_months, status, " +
                        "opened_date, maturity_date, closed_date, last_interest_calculated_at, " +
                        "total_interest_earned, created_at, updated_at " +
                        "FROM savings_account " +
                        "WHERE user_id = ? AND status = 'ACTIVE' " +
                        "ORDER BY opened_date DESC";
            
            log.debug("Executing SQL for getActiveSavingsAccountsByUserId: {} with userId: {}", sql, userId);
            
            List<SavingsAccount> savingsAccounts = transactionServiceJdbcTemplate.query(sql, new SavingsAccountRowMapper(), userId);
            log.debug("Found {} active savings accounts for user {}", savingsAccounts.size(), userId);
            
            return savingsAccounts;
            
        } catch (Exception e) {
            log.error("Lỗi khi lấy active savings accounts của user {}: {}", userId, e.getMessage());
            return List.of();
        }
    }

    /**
     * Lấy savings accounts sắp đáo hạn (trong vòng 30 ngày)
     */
    public List<SavingsAccount> getMaturitySoonSavingsAccountsByUserId(Long userId) {
        try {
            String sql = "SELECT savings_account_id, account_number, user_id, payment_account_id, " +
                        "balance, currency, interest_rate_id, term_months, status, " +
                        "opened_date, maturity_date, closed_date, last_interest_calculated_at, " +
                        "total_interest_earned, created_at, updated_at " +
                        "FROM savings_account " +
                        "WHERE user_id = ? AND status = 'ACTIVE' " +
                        "AND maturity_date <= DATE_ADD(NOW(), INTERVAL 30 DAY) " +
                        "ORDER BY maturity_date ASC";
            
            log.debug("Executing SQL for getMaturitySoonSavingsAccountsByUserId: {} with userId: {}", sql, userId);
            
            List<SavingsAccount> savingsAccounts = transactionServiceJdbcTemplate.query(sql, new SavingsAccountRowMapper(), userId);
            log.debug("Found {} savings accounts maturing soon for user {}", savingsAccounts.size(), userId);
            
            return savingsAccounts;
            
        } catch (Exception e) {
            log.error("Lỗi khi lấy savings accounts sắp đáo hạn của user {}: {}", userId, e.getMessage());
            return List.of();
        }
    }

    /**
     * Lấy tổng số dư tiết kiệm của user
     */
    public BigDecimal getTotalSavingsBalanceByUserId(Long userId) {
        try {
            String sql = "SELECT COALESCE(SUM(balance), 0) as total_savings_balance " +
                        "FROM savings_account " +
                        "WHERE user_id = ? AND status IN ('ACTIVE', 'MATURED')";
            
            log.debug("Executing SQL for getTotalSavingsBalanceByUserId: {} with userId: {}", sql, userId);
            
            BigDecimal totalBalance = transactionServiceJdbcTemplate.queryForObject(sql, BigDecimal.class, userId);
            log.debug("Total savings balance for user {}: {}", userId, totalBalance);
            
            return totalBalance != null ? totalBalance : BigDecimal.ZERO;
            
        } catch (Exception e) {
            log.error("Lỗi khi lấy tổng số dư tiết kiệm của user {}: {}", userId, e.getMessage());
            return BigDecimal.ZERO;
        }
    }

    /**
     * Lấy tổng lãi đã kiếm được của user
     */
    public BigDecimal getTotalInterestEarnedByUserId(Long userId) {
        try {
            String sql = "SELECT COALESCE(SUM(total_interest_earned), 0) as total_interest " +
                        "FROM savings_account " +
                        "WHERE user_id = ?";
            
            log.debug("Executing SQL for getTotalInterestEarnedByUserId: {} with userId: {}", sql, userId);
            
            BigDecimal totalInterest = transactionServiceJdbcTemplate.queryForObject(sql, BigDecimal.class, userId);
            log.debug("Total interest earned for user {}: {}", userId, totalInterest);
            
            return totalInterest != null ? totalInterest : BigDecimal.ZERO;
            
        } catch (Exception e) {
            log.error("Lỗi khi lấy tổng lãi của user {}: {}", userId, e.getMessage());
            return BigDecimal.ZERO;
        }
    }

    /**
     * Kiểm tra savings account có thuộc về user không
     */
    public boolean isSavingsAccountBelongsToUser(String accountNumber, Long userId) {
        try {
            String sql = "SELECT COUNT(*) FROM savings_account WHERE account_number = ? AND user_id = ?";
            
            Integer count = transactionServiceJdbcTemplate.queryForObject(sql, Integer.class, accountNumber, userId);
            boolean belongs = count != null && count > 0;
            
            log.debug("Savings account {} belongs to user {}: {}", accountNumber, userId, belongs);
            return belongs;
            
        } catch (Exception e) {
            log.error("Lỗi khi kiểm tra savings account {} thuộc user {}: {}", accountNumber, userId, e.getMessage());
            return false;
        }
    }

    /**
     * Lấy thông tin savings accounts để hiển thị cho chatbot
     */
    public String getSavingsAccountDisplayInfo(Long userId) {
        try {
            List<SavingsAccount> savingsAccounts = getSavingsAccountsByUserId(userId);
            
            if (savingsAccounts.isEmpty()) {
                return "Không tìm thấy tài khoản tiết kiệm nào cho người dùng này.";
            }

            StringBuilder info = new StringBuilder();
            info.append("Thông tin tài khoản tiết kiệm:\n");
            
            for (SavingsAccount account : savingsAccounts) {
                info.append("- Số tài khoản: ").append(account.getAccountNumber()).append("\n");
                info.append("  + Số dư: ").append(String.format("%,.0f %s", account.getBalance(), account.getCurrency())).append("\n");
                info.append("  + Kỳ hạn: ").append(account.getTermMonths()).append(" tháng\n");
                info.append("  + Trạng thái: ").append(account.getStatus()).append("\n");
                info.append("  + Ngày mở: ").append(account.getOpenedDate()).append("\n");
                info.append("  + Ngày đáo hạn: ").append(account.getMaturityDate()).append("\n");
                
                if (account.getTotalInterestEarned() != null && account.getTotalInterestEarned().compareTo(BigDecimal.ZERO) > 0) {
                    info.append("  + Lãi đã kiếm: ").append(String.format("%,.0f %s", account.getTotalInterestEarned(), account.getCurrency())).append("\n");
                }
                
                info.append("\n");
            }
            
            // Thêm tổng kết
            BigDecimal totalBalance = getTotalSavingsBalanceByUserId(userId);
            BigDecimal totalInterest = getTotalInterestEarnedByUserId(userId);
            
            info.append("Tổng số dư tiết kiệm: ").append(String.format("%,.0f VNĐ", totalBalance)).append("\n");
            info.append("Tổng lãi đã kiếm: ").append(String.format("%,.0f VNĐ", totalInterest)).append("\n");
            
            return info.toString();
            
        } catch (Exception e) {
            log.error("Lỗi khi lấy thông tin hiển thị savings accounts cho user {}: {}", userId, e.getMessage());
            return "Không thể lấy thông tin tài khoản tiết kiệm lúc này.";
        }
    }

    /**
     * Lấy thông tin savings accounts ngắn gọn cho chatbot
     */
    public String getSavingsAccountSummary(Long userId) {
        try {
            List<SavingsAccount> savingsAccounts = getActiveSavingsAccountsByUserId(userId);
            
            if (savingsAccounts.isEmpty()) {
                return "Không có tài khoản tiết kiệm đang hoạt động.";
            }

            StringBuilder summary = new StringBuilder();
            summary.append("Bạn có ").append(savingsAccounts.size()).append(" tài khoản tiết kiệm đang hoạt động:\n");
            
            for (SavingsAccount account : savingsAccounts) {
                summary.append("- ").append(account.getAccountNumber())
                       .append(" (").append(account.getTermMonths()).append(" tháng): ")
                       .append(String.format("%,.0f %s", account.getBalance(), account.getCurrency()))
                       .append("\n");
            }
            
            BigDecimal totalBalance = getTotalSavingsBalanceByUserId(userId);
            summary.append("Tổng tiết kiệm: ").append(String.format("%,.0f VNĐ", totalBalance));
            
            return summary.toString();
            
        } catch (Exception e) {
            log.error("Lỗi khi lấy tóm tắt savings accounts cho user {}: {}", userId, e.getMessage());
            return "Không thể lấy thông tin tài khoản tiết kiệm.";
        }
    }

    // ===== INTEREST RATE METHODS =====

    /**
     * Lấy tất cả lãi suất đang hoạt động
     */
    public List<InterestRate> getActiveInterestRates() {
        try {
            String sql = "SELECT interest_rate_id, term_months, min_amount, max_amount, " +
                        "annual_rate, status, effective_from, effective_to, created_at, updated_at " +
                        "FROM interest_rate " +
                        "WHERE status = 'ACTIVE' " +
                        "AND effective_from <= NOW() " +
                        "AND (effective_to IS NULL OR effective_to > NOW()) " +
                        "ORDER BY term_months ASC, min_amount ASC";
            
            log.debug("Executing SQL for getActiveInterestRates: {}", sql);
            
            List<InterestRate> interestRates = transactionServiceJdbcTemplate.query(sql, new InterestRateRowMapper());
            log.debug("Found {} active interest rates", interestRates.size());
            
            return interestRates;
            
        } catch (Exception e) {
            log.error("Lỗi khi lấy danh sách lãi suất hoạt động: {}", e.getMessage());
            return List.of();
        }
    }

    public String getActiveInterestRatesAsString() {

        List<InterestRate> rates = getActiveInterestRates();

        if (rates.isEmpty()) {
            return "Hiện tại ngân hàng chưa có chương trình lãi suất tiết kiệm nào đang áp dụng.";
        }

        StringBuilder sb = new StringBuilder();
        sb.append("**Lãi suất tiết kiệm hiện hành:**\n");

        for (InterestRate rate : rates) {
            sb.append(String.format(
                    "- Kỳ hạn %d tháng | Số tiền từ %s đến %s | Lãi suất %.2f%%/năm\n",
                    rate.getTermMonths(),
                    formatAmount(rate.getMinAmount(), true),
                    formatAmount(rate.getMaxAmount(), false),
                    rate.getAnnualRate()
            ));
        }

        return sb.toString();
    }

    private String formatAmount(BigDecimal amount, boolean isMin) {
        if (amount == null) {
            return isMin ? "Không giới hạn" : "Không giới hạn";
        }
        return String.format("%,d VNĐ", amount.longValue());
    }

    /**
     * Lấy lãi suất theo ID
     */
    public InterestRate getInterestRateById(Long interestRateId) {
        try {
            String sql = "SELECT interest_rate_id, term_months, min_amount, max_amount, " +
                        "annual_rate, status, effective_from, effective_to, created_at, updated_at " +
                        "FROM interest_rate " +
                        "WHERE interest_rate_id = ?";
            
            log.debug("Executing SQL for getInterestRateById: {} with interestRateId: {}", sql, interestRateId);
            
            InterestRate interestRate = transactionServiceJdbcTemplate.queryForObject(sql, new InterestRateRowMapper(), interestRateId);
            log.debug("Found interest rate: {}", interestRate != null ? interestRate.getInterestRateId() : "null");
            
            return interestRate;
            
        } catch (Exception e) {
            log.error("Lỗi khi lấy lãi suất theo ID {}: {}", interestRateId, e.getMessage());
            return null;
        }
    }

    /**
     * Lấy lãi suất phù hợp cho kỳ hạn và số tiền
     */
    public InterestRate getApplicableInterestRate(Integer termMonths, BigDecimal amount) {
        try {
            String sql = "SELECT interest_rate_id, term_months, min_amount, max_amount, " +
                        "annual_rate, status, effective_from, effective_to, created_at, updated_at " +
                        "FROM interest_rate " +
                        "WHERE status = 'ACTIVE' " +
                        "AND term_months = ? " +
                        "AND min_amount <= ? " +
                        "AND (max_amount IS NULL OR max_amount >= ?) " +
                        "AND effective_from <= NOW() " +
                        "AND (effective_to IS NULL OR effective_to > NOW()) " +
                        "ORDER BY min_amount DESC " +
                        "LIMIT 1";
            
            log.debug("Executing SQL for getApplicableInterestRate: {} with termMonths: {}, amount: {}", sql, termMonths, amount);
            
            InterestRate interestRate = transactionServiceJdbcTemplate.queryForObject(sql, new InterestRateRowMapper(), termMonths, amount, amount);
            log.debug("Found applicable interest rate: {}", interestRate != null ? interestRate.getAnnualRate() : "null");
            
            return interestRate;
            
        } catch (Exception e) {
            log.error("Lỗi khi lấy lãi suất phù hợp cho kỳ hạn {} tháng, số tiền {}: {}", termMonths, amount, e.getMessage());
            return null;
        }
    }

    /**
     * Lấy danh sách lãi suất theo kỳ hạn
     */
    public List<InterestRate> getInterestRatesByTerm(Integer termMonths) {
        try {
            String sql = "SELECT interest_rate_id, term_months, min_amount, max_amount, " +
                        "annual_rate, status, effective_from, effective_to, created_at, updated_at " +
                        "FROM interest_rate " +
                        "WHERE status = 'ACTIVE' " +
                        "AND term_months = ? " +
                        "AND effective_from <= NOW() " +
                        "AND (effective_to IS NULL OR effective_to > NOW()) " +
                        "ORDER BY min_amount ASC";
            
            log.debug("Executing SQL for getInterestRatesByTerm: {} with termMonths: {}", sql, termMonths);
            
            List<InterestRate> interestRates = transactionServiceJdbcTemplate.query(sql, new InterestRateRowMapper(), termMonths);
            log.debug("Found {} interest rates for term {} months", interestRates.size(), termMonths);
            
            return interestRates;
            
        } catch (Exception e) {
            log.error("Lỗi khi lấy lãi suất theo kỳ hạn {} tháng: {}", termMonths, e.getMessage());
            return List.of();
        }
    }

    /**
     * Tính lãi suất dự kiến cho một khoản tiết kiệm
     */
    public BigDecimal calculateExpectedInterest(BigDecimal principal, Integer termMonths, BigDecimal annualRate) {
        try {
            // Công thức: Lãi = Gốc × Lãi suất năm × (Số tháng / 12)
            BigDecimal monthlyRate = annualRate.divide(BigDecimal.valueOf(12), 10, BigDecimal.ROUND_HALF_UP);
            BigDecimal expectedInterest = principal.multiply(monthlyRate).multiply(BigDecimal.valueOf(termMonths));
            
            log.debug("Calculated expected interest: principal={}, termMonths={}, annualRate={}, result={}", 
                     principal, termMonths, annualRate, expectedInterest);
            
            return expectedInterest.setScale(2, BigDecimal.ROUND_HALF_UP);
            
        } catch (Exception e) {
            log.error("Lỗi khi tính lãi suất dự kiến: principal={}, termMonths={}, annualRate={}, error={}", 
                     principal, termMonths, annualRate, e.getMessage());
            return BigDecimal.ZERO;
        }
    }

    /**
     * Lấy thông tin lãi suất để hiển thị cho chatbot
     */
    public String getInterestRateDisplayInfo() {
        try {
            List<InterestRate> interestRates = getActiveInterestRates();
            
            if (interestRates.isEmpty()) {
                return "Hiện tại không có lãi suất nào đang áp dụng.";
            }

            StringBuilder info = new StringBuilder();
            info.append("Bảng lãi suất tiết kiệm hiện tại:\n\n");
            
            // Group by term
            Map<Integer, List<InterestRate>> ratesByTerm = new java.util.HashMap<>();
            for (InterestRate rate : interestRates) {
                ratesByTerm.computeIfAbsent(rate.getTermMonths(), k -> new java.util.ArrayList<>()).add(rate);
            }
            
            for (Map.Entry<Integer, List<InterestRate>> entry : ratesByTerm.entrySet()) {
                Integer term = entry.getKey();
                List<InterestRate> rates = entry.getValue();
                
                info.append("Kỳ hạn ").append(term).append(" tháng:\n");
                
                for (InterestRate rate : rates) {
                    info.append("  - Từ ").append(String.format("%,.0f", rate.getMinAmount()));
                    
                    if (rate.getMaxAmount() != null) {
                        info.append(" đến ").append(String.format("%,.0f", rate.getMaxAmount()));
                    } else {
                        info.append(" trở lên");
                    }
                    
                    info.append(" VNĐ: ").append(String.format("%.2f", rate.getAnnualRate().multiply(BigDecimal.valueOf(100)))).append("%/năm\n");
                }
                
                info.append("\n");
            }
            
            return info.toString();
            
        } catch (Exception e) {
            log.error("Lỗi khi lấy thông tin hiển thị lãi suất: {}", e.getMessage());
            return "Không thể lấy thông tin lãi suất lúc này.";
        }
    }

    /**
     * Lấy thông tin lãi suất cho một kỳ hạn cụ thể
     */
    public String getInterestRateInfoByTerm(Integer termMonths) {
        try {
            List<InterestRate> interestRates = getInterestRatesByTerm(termMonths);
            
            if (interestRates.isEmpty()) {
                return "Không có lãi suất nào cho kỳ hạn " + termMonths + " tháng.";
            }

            StringBuilder info = new StringBuilder();
            info.append("Lãi suất kỳ hạn ").append(termMonths).append(" tháng:\n");
            
            for (InterestRate rate : interestRates) {
                info.append("- Từ ").append(String.format("%,.0f", rate.getMinAmount()));
                
                if (rate.getMaxAmount() != null) {
                    info.append(" đến ").append(String.format("%,.0f", rate.getMaxAmount()));
                } else {
                    info.append(" trở lên");
                }
                
                info.append(" VNĐ: ").append(String.format("%.2f", rate.getAnnualRate().multiply(BigDecimal.valueOf(100)))).append("%/năm\n");
            }
            
            return info.toString();
            
        } catch (Exception e) {
            log.error("Lỗi khi lấy thông tin lãi suất cho kỳ hạn {} tháng: {}", termMonths, e.getMessage());
            return "Không thể lấy thông tin lãi suất cho kỳ hạn này.";
        }
    }

    /**
     * Tính toán và hiển thị lãi suất dự kiến
     */
    public String calculateAndDisplayExpectedInterest(BigDecimal amount, Integer termMonths) {
        try {
            InterestRate applicableRate = getApplicableInterestRate(termMonths, amount);
            
            if (applicableRate == null) {
                return "Không tìm thấy lãi suất phù hợp cho số tiền " + String.format("%,.0f", amount) + " VNĐ và kỳ hạn " + termMonths + " tháng.";
            }
            
            BigDecimal expectedInterest = calculateExpectedInterest(amount, termMonths, applicableRate.getAnnualRate());
            BigDecimal totalAmount = amount.add(expectedInterest);
            
            StringBuilder result = new StringBuilder();
            result.append("Dự tính lãi suất cho khoản tiết kiệm:\n");
            result.append("- Số tiền gốc: ").append(String.format("%,.0f VNĐ", amount)).append("\n");
            result.append("- Kỳ hạn: ").append(termMonths).append(" tháng\n");
            result.append("- Lãi suất: ").append(String.format("%.2f", applicableRate.getAnnualRate().multiply(BigDecimal.valueOf(100)))).append("%/năm\n");
            result.append("- Lãi dự kiến: ").append(String.format("%,.0f VNĐ", expectedInterest)).append("\n");
            result.append("- Tổng tiền nhận được: ").append(String.format("%,.0f VNĐ", totalAmount)).append("\n");
            
            return result.toString();
            
        } catch (Exception e) {
            log.error("Lỗi khi tính toán lãi suất dự kiến: amount={}, termMonths={}, error={}", amount, termMonths, e.getMessage());
            return "Không thể tính toán lãi suất dự kiến lúc này.";
        }
    }

    /**
     * Lấy thông tin lãi suất phù hợp dưới dạng string cho chatbot
     */
    public String getApplicableInterestRateAsString(Integer termMonths, BigDecimal amount) {
        try {
            InterestRate applicableRate = getApplicableInterestRate(termMonths, amount);
            
            if (applicableRate == null) {
                return "Không tìm thấy lãi suất phù hợp cho số tiền " + String.format("%,.0f", amount) + " VNĐ và kỳ hạn " + termMonths + " tháng.";
            }
            
            StringBuilder result = new StringBuilder();
            result.append("Lãi suất áp dụng:\n");
            result.append("- Kỳ hạn: ").append(termMonths).append(" tháng\n");
            result.append("- Số tiền: ").append(String.format("%,.0f VNĐ", amount)).append("\n");
            result.append("- Lãi suất: ").append(String.format("%.2f", applicableRate.getAnnualRate().multiply(BigDecimal.valueOf(100)))).append("%/năm\n");
            
            return result.toString();
            
        } catch (Exception e) {
            log.error("Lỗi khi lấy lãi suất phù hợp: termMonths={}, amount={}, error={}", termMonths, amount, e.getMessage());
            return "Không thể lấy thông tin lãi suất lúc này.";
        }
    }

    /**
     * Lấy tổng lãi đã nhận được của user từ tất cả tài khoản tiết kiệm
     */
    public String getTotalInterestEarnedAsString(Long userId) {
        try {
            BigDecimal totalInterest = getTotalInterestEarnedByUserId(userId);
            List<SavingsAccount> accounts = getSavingsAccountsByUserId(userId);
            
            if (accounts.isEmpty()) {
                return "Bạn chưa có tài khoản tiết kiệm nào.";
            }
            
            StringBuilder result = new StringBuilder();
            result.append("Tổng lãi đã nhận được từ tiết kiệm:\n");
            result.append("- Tổng lãi: ").append(String.format("%,.0f VNĐ", totalInterest)).append("\n");
            result.append("- Từ ").append(accounts.size()).append(" tài khoản tiết kiệm\n\n");
            
            result.append("Chi tiết theo từng tài khoản:\n");
            for (SavingsAccount account : accounts) {
                result.append("- ").append(account.getAccountNumber());
                if (account.getTotalInterestEarned() != null) {
                    result.append(": ").append(String.format("%,.0f VNĐ", account.getTotalInterestEarned()));
                } else {
                    result.append(": 0 VNĐ");
                }
                result.append(" (").append(account.getStatus()).append(")\n");
            }
            
            return result.toString();
            
        } catch (Exception e) {
            log.error("Lỗi khi lấy tổng lãi của user {}: {}", userId, e.getMessage());
            return "Không thể lấy thông tin tổng lãi lúc này.";
        }
    }

    /**
     * Lấy thông tin lãi suất tháng này (lãi suất hiện tại đang áp dụng)
     */
    public String getCurrentMonthInterestRatesAsString() {
        try {
            List<InterestRate> currentRates = getActiveInterestRates();
            
            if (currentRates.isEmpty()) {
                return "Hiện tại không có lãi suất nào đang áp dụng.";
            }
            
            StringBuilder result = new StringBuilder();
            result.append("Lãi suất tiết kiệm tháng này:\n\n");
            
            // Group by term
            Map<Integer, List<InterestRate>> ratesByTerm = new java.util.HashMap<>();
            for (InterestRate rate : currentRates) {
                ratesByTerm.computeIfAbsent(rate.getTermMonths(), k -> new java.util.ArrayList<>()).add(rate);
            }
            
            for (Map.Entry<Integer, List<InterestRate>> entry : ratesByTerm.entrySet()) {
                Integer term = entry.getKey();
                List<InterestRate> rates = entry.getValue();
                
                result.append("📅 Kỳ hạn ").append(term).append(" tháng:\n");
                
                for (InterestRate rate : rates) {
                    result.append("  💰 Từ ").append(String.format("%,.0f", rate.getMinAmount()));
                    
                    if (rate.getMaxAmount() != null) {
                        result.append(" - ").append(String.format("%,.0f", rate.getMaxAmount()));
                    } else {
                        result.append(" trở lên");
                    }
                    
                    result.append(" VNĐ: ").append(String.format("%.2f", rate.getAnnualRate().multiply(BigDecimal.valueOf(100)))).append("%/năm\n");
                }
                
                result.append("\n");
            }
            
            result.append("⏰ Có hiệu lực từ: ").append(LocalDateTime.now().toLocalDate()).append("\n");
            
            return result.toString();
            
        } catch (Exception e) {
            log.error("Lỗi khi lấy lãi suất tháng này: {}", e.getMessage());
            return "Không thể lấy thông tin lãi suất tháng này.";
        }
    }

    /**
     * Lấy thông tin tài khoản tiết kiệm và lãi suất của user
     */
    public String getUserSavingsAndInterestSummary(Long userId) {
        try {
            List<SavingsAccount> accounts = getActiveSavingsAccountsByUserId(userId);
            
            if (accounts.isEmpty()) {
                return "Bạn chưa có tài khoản tiết kiệm nào đang hoạt động.";
            }
            
            StringBuilder result = new StringBuilder();
            result.append("Tóm tắt tài khoản tiết kiệm của bạn:\n\n");
            
            BigDecimal totalBalance = BigDecimal.ZERO;
            BigDecimal totalInterest = BigDecimal.ZERO;
            
            for (SavingsAccount account : accounts) {
                result.append("📋 ").append(account.getAccountNumber()).append("\n");
                result.append("  💵 Số dư: ").append(String.format("%,.0f %s", account.getBalance(), account.getCurrency())).append("\n");
                result.append("  📅 Kỳ hạn: ").append(account.getTermMonths()).append(" tháng\n");
                result.append("  📈 Đáo hạn: ").append(account.getMaturityDate().toLocalDate()).append("\n");
                
                if (account.getTotalInterestEarned() != null) {
                    result.append("  💰 Lãi đã nhận: ").append(String.format("%,.0f %s", account.getTotalInterestEarned(), account.getCurrency())).append("\n");
                    totalInterest = totalInterest.add(account.getTotalInterestEarned());
                }
                
                totalBalance = totalBalance.add(account.getBalance());
                result.append("\n");
            }
            
            result.append("📊 Tổng kết:\n");
            result.append("  💵 Tổng số dư: ").append(String.format("%,.0f VNĐ", totalBalance)).append("\n");
            result.append("  💰 Tổng lãi đã nhận: ").append(String.format("%,.0f VNĐ", totalInterest)).append("\n");
            
            return result.toString();
            
        } catch (Exception e) {
            log.error("Lỗi khi lấy tóm tắt tiết kiệm của user {}: {}", userId, e.getMessage());
            return "Không thể lấy thông tin tóm tắt tiết kiệm.";
        }
    }

    // Row Mappers
    private static class SavingsAccountRowMapper implements RowMapper<SavingsAccount> {
        @Override
        public SavingsAccount mapRow(ResultSet rs, int rowNum) throws SQLException {
            return SavingsAccount.builder()
                    .savingsAccountId(rs.getLong("savings_account_id"))
                    .accountNumber(rs.getString("account_number"))
                    .userId(rs.getLong("user_id"))
                    .paymentAccountId(rs.getLong("payment_account_id"))
                    .balance(rs.getBigDecimal("balance"))
                    .currency(rs.getString("currency"))
                    .interestRateId(rs.getLong("interest_rate_id"))
                    .termMonths(rs.getInt("term_months"))
                    .status(rs.getString("status"))
                    .openedDate(rs.getTimestamp("opened_date") != null ? 
                               rs.getTimestamp("opened_date").toLocalDateTime() : null)
                    .maturityDate(rs.getTimestamp("maturity_date") != null ? 
                                 rs.getTimestamp("maturity_date").toLocalDateTime() : null)
                    .closedDate(rs.getTimestamp("closed_date") != null ? 
                               rs.getTimestamp("closed_date").toLocalDateTime() : null)
                    .lastInterestCalculatedAt(rs.getTimestamp("last_interest_calculated_at") != null ? 
                                            rs.getTimestamp("last_interest_calculated_at").toLocalDateTime() : null)
                    .totalInterestEarned(rs.getBigDecimal("total_interest_earned"))
                    .createdAt(rs.getTimestamp("created_at") != null ? 
                              rs.getTimestamp("created_at").toLocalDateTime() : null)
                    .updatedAt(rs.getTimestamp("updated_at") != null ? 
                              rs.getTimestamp("updated_at").toLocalDateTime() : null)
                    .build();
        }
    }

    private static class InterestRateRowMapper implements RowMapper<InterestRate> {
        @Override
        public InterestRate mapRow(ResultSet rs, int rowNum) throws SQLException {
            return InterestRate.builder()
                    .interestRateId(rs.getLong("interest_rate_id"))
                    .termMonths(rs.getInt("term_months"))
                    .minAmount(rs.getBigDecimal("min_amount"))
                    .maxAmount(rs.getBigDecimal("max_amount"))
                    .annualRate(rs.getBigDecimal("annual_rate"))
                    .status(rs.getString("status"))
                    .effectiveFrom(rs.getTimestamp("effective_from") != null ? 
                                  rs.getTimestamp("effective_from").toLocalDateTime() : null)
                    .effectiveTo(rs.getTimestamp("effective_to") != null ? 
                                rs.getTimestamp("effective_to").toLocalDateTime() : null)
                    .createdAt(rs.getTimestamp("created_at") != null ? 
                              rs.getTimestamp("created_at").toLocalDateTime() : null)
                    .updatedAt(rs.getTimestamp("updated_at") != null ? 
                              rs.getTimestamp("updated_at").toLocalDateTime() : null)
                    .build();
        }
    }
}