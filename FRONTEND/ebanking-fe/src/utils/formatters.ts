/**
 * Utility functions for formatting data
 */

/**
 * Format number with Vietnamese locale
 */
export function formatNumber(num: number | string | undefined | null): string {
  if (num === undefined || num === null) return '0';
  
  const numValue = typeof num === 'string' ? parseFloat(num) : num;
  if (isNaN(numValue)) return '0';
  
  return numValue.toLocaleString('vi-VN');
}

/**
 * Format currency amount
 */
export function formatCurrency(amount: string | number | undefined | null, currency: string = 'VNĐ'): string {
  if (!amount) return `0 ${currency}`;
  
  const numValue = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(numValue)) return `0 ${currency}`;
  
  return `${formatNumber(numValue)} ${currency}`;
}

/**
 * Format large numbers with units (K, M, B)
 */
export function formatLargeNumber(num: number | string | undefined | null): string {
  if (num === undefined || num === null) return '0';
  
  const numValue = typeof num === 'string' ? parseFloat(num) : num;
  if (isNaN(numValue)) return '0';
  
  if (numValue >= 1000000000) {
    return (numValue / 1000000000).toFixed(1) + 'B';
  }
  if (numValue >= 1000000) {
    return (numValue / 1000000).toFixed(1) + 'M';
  }
  if (numValue >= 1000) {
    return (numValue / 1000).toFixed(1) + 'K';
  }
  
  return numValue.toString();
}

/**
 * Format percentage
 */
export function formatPercentage(value: number | undefined | null, decimals: number = 1): string {
  if (value === undefined || value === null || isNaN(value)) return '0%';
  return `${value.toFixed(decimals)}%`;
}

/**
 * Format date to Vietnamese format
 */
export function formatDate(date: Date | string | number): string {
  const dateObj = new Date(date);
  if (isNaN(dateObj.getTime())) return '';
  
  return dateObj.toLocaleDateString('vi-VN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
}

/**
 * Format time to Vietnamese format
 */
export function formatTime(date: Date | string | number): string {
  const dateObj = new Date(date);
  if (isNaN(dateObj.getTime())) return '';
  
  return dateObj.toLocaleTimeString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

/**
 * Format datetime to Vietnamese format
 */
export function formatDateTime(date: Date | string | number): string {
  const dateObj = new Date(date);
  if (isNaN(dateObj.getTime())) return '';
  
  return dateObj.toLocaleString('vi-VN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}