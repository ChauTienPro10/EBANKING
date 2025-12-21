/**
 * Utility functions for eKYC status and expiration checks
 */

/**
 * Check if eKYC is expired
 * @param verifiedAt - Verification timestamp (can be LocalDateTime array or ISO string)
 * @returns true if expired, false otherwise
 */
export const isEkycExpired = (verifiedAt: any): boolean => {
  if (!verifiedAt) return false;

  try {
    let verifiedDate: Date;

    // Handle LocalDateTime array: [year, month, day, hour, minute, second, nano]
    if (Array.isArray(verifiedAt) && verifiedAt.length >= 6) {
      const [year, month, day, hour, minute, second] = verifiedAt;
      verifiedDate = new Date(year, month - 1, day, hour, minute, second);
    }
    // Handle string dates (ISO format)
    else if (typeof verifiedAt === 'string') {
      verifiedDate = new Date(verifiedAt);
    }
    // Handle timestamp
    else if (typeof verifiedAt === 'number') {
      verifiedDate = new Date(verifiedAt);
    } else {
      return false;
    }

    // Demo: Check if older than 5 minutes
    // Production: Change to 365 days (1 year)
    const expirationTime = 5 * 60 * 1000; // 5 minutes in milliseconds
    // const expirationTime = 365 * 24 * 60 * 60 * 1000; // 1 year in milliseconds

    const now = Date.now();
    const verifiedTime = verifiedDate.getTime();

    return now - verifiedTime > expirationTime;
  } catch (error) {
    console.error('Error checking eKYC expiration:', error);
    return false;
  }
};
