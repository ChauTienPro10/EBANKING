import { TransferResponse } from '../../../store/fetchAPI/TransactionHistory';

/**
 * Risk levels for suspicious transactions
 */
export type RiskLevel = 'HIGH' | 'MEDIUM' | 'LOW';

/**
 * Types of suspicious activity that can be detected
 */
export type SuspiciousReason =
  | 'LATE_NIGHT' // Transaction between 23:00 - 05:00
  | 'REPEATED_RECIPIENT' // >5 transactions to same account within 1 hour
  | 'LARGE_AMOUNT'; // Transaction amount > 10,000,000 VND

/**
 * Extended transaction interface with suspicious activity metadata
 */
export interface SuspiciousTransaction extends TransferResponse {
  riskLevel: RiskLevel;
  suspiciousReasons: SuspiciousReason[];
  reasonDetails?: {
    lateNightTime?: string; // Time of late night transaction (HH:mm format)
    repeatCount?: number; // Number of repeated transactions
    amount?: number; // Transaction amount for large amount detection
  };
}

/**
 * Analysis result grouping suspicious transactions by risk level
 */
export interface SuspiciousAnalysis {
  highRisk: SuspiciousTransaction[];
  mediumRisk: SuspiciousTransaction[];
  lowRisk: SuspiciousTransaction[];
  totalCount: number;
  lastAnalyzedAt: string;
}

/**
 * Detection thresholds configuration
 */
export interface DetectionThresholds {
  lateNightStart: number; // Hour (0-23), e.g., 23 for 11 PM
  lateNightEnd: number; // Hour (0-23), e.g., 5 for 5 AM
  repeatedTransactionCount: number; // Minimum count to flag as suspicious
  repeatedTransactionWindow: number; // Time window in milliseconds (1 hour = 3600000)
  largeAmountThreshold: number; // Amount in VND
}

/**
 * Default detection thresholds
 */
export const DEFAULT_THRESHOLDS: DetectionThresholds = {
  lateNightStart: 23,
  lateNightEnd: 5,
  repeatedTransactionCount: 5,
  repeatedTransactionWindow: 3600000, // 1 hour in milliseconds
  largeAmountThreshold: 10000000, // 10 million VND
};
