/**
 * Utility functions for eKYC status and expiration checks
 */

/**
 * Check if eKYC is expired
 * @param verifiedAt - Unix timestamp in milliseconds
 * @returns true if expired, false otherwise
 */
export const isEkycExpired = (
  verifiedAt: number | null | undefined,
): boolean => {
  if (!verifiedAt) return false;

  try {
    // Demo: Check if older than 5 minutes
    // Production: Change to 365 * 24 * 60 * 60 * 1000 for 1 year
    const expirationTime = 5 * 60 * 1000; // 5 minutes in milliseconds
    // const expirationTime = 365 * 24 * 60 * 60 * 1000; // 1 year in milliseconds

    const now = Date.now();
    return now - verifiedAt > expirationTime;
  } catch (error) {
    console.error('Error checking eKYC expiration:', error);
    return false;
  }
};
