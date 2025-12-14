import i18n from '../../i18n';

// Exchange rate: 1 USD = 25,000 VND (you can adjust this or make it dynamic)
const VND_TO_USD_RATE = 25000;

/**
 * Format currency based on current language
 * @param amount - Amount in VND (from database)
 * @param currency - Currency code from database (default: 'VNĐ')
 * @returns Formatted currency string with appropriate symbol
 */
export const formatCurrencyByLanguage = (
  amount: number | undefined | null,
  currency: string = 'VNĐ',
): string => {
  if (amount === undefined || amount === null) {
    return '';
  }

  const currentLanguage = i18n.language;

  // If language is English, convert to USD
  if (currentLanguage === 'en') {
    const usdAmount = amount / VND_TO_USD_RATE;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(usdAmount);
  }

  // Default: Vietnamese - show VND
  return `${amount.toLocaleString('vi-VN')} đ`;
};

/**
 * Format currency amount without symbol
 * @param amount - Amount in VND
 * @returns Formatted number string
 */
export const formatAmount = (amount: number | undefined | null): string => {
  if (amount === undefined || amount === null) {
    return '';
  }

  const currentLanguage = i18n.language;

  if (currentLanguage === 'en') {
    const usdAmount = amount / VND_TO_USD_RATE;
    return usdAmount.toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }

  return amount.toLocaleString('vi-VN');
};

/**
 * Get currency symbol based on current language
 * @returns Currency symbol ($ or đ)
 */
export const getCurrencySymbol = (): string => {
  const currentLanguage = i18n.language;
  return currentLanguage === 'en' ? '$' : 'đ';
};

/**
 * Convert VND to USD
 * @param vndAmount - Amount in VND
 * @returns Amount in USD
 */
export const convertVNDtoUSD = (vndAmount: number): number => {
  return vndAmount / VND_TO_USD_RATE;
};

/**
 * Convert USD to VND
 * @param usdAmount - Amount in USD
 * @returns Amount in VND
 */
export const convertUSDtoVND = (usdAmount: number): number => {
  return usdAmount * VND_TO_USD_RATE;
};
