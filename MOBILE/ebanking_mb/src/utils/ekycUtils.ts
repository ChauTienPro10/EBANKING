/**
 * Utility functions for eKYC status and expiration checks
 */

/**
 * Check if eKYC is expired
 * @param verifiedAt - Unix timestamp in milliseconds (string or number)
 * @returns true if expired, false otherwise
 */
export const isEkycExpired = (
  verifiedAt: string | number | null | undefined,
): boolean => {
  if (!verifiedAt) return false;

  try {
    // Convert string to number if needed
    const timestamp =
      typeof verifiedAt === 'string' ? parseInt(verifiedAt, 10) : verifiedAt;

    if (isNaN(timestamp)) return false;

    // Demo
    // const expirationTime = 5 * 60 * 1000;
    const expirationTime = 24 * 60 * 60 * 1000;

    const now = Date.now();
    return now - timestamp > expirationTime;
  } catch (error) {
    console.error('Error checking eKYC expiration:', error);
    return false;
  }
};
