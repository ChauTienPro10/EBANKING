/**
 * Message grouping and display utilities
 */

// Time gap threshold for message grouping (5 minutes)
export const TIME_GAP_THRESHOLD = 5 * 60 * 1000;

/**
 * Check if a message is the first in a group
 * Messages are grouped by sender and time proximity
 */
export const isFirstInGroup = (
  currentMessage: any,
  nextMessage: any | null,
  threshold: number = TIME_GAP_THRESHOLD,
): boolean => {
  if (!nextMessage || nextMessage.senderId !== currentMessage.senderId) {
    return true;
  }

  const timeDiff = Math.abs(
    new Date(currentMessage.createdAt).getTime() -
      new Date(nextMessage.createdAt).getTime(),
  );
  return timeDiff > threshold;
};

/**
 * Check if a message is the last in a group
 */
export const isLastInGroup = (
  currentMessage: any,
  prevMessage: any | null,
): boolean => {
  return !prevMessage || prevMessage.senderId !== currentMessage.senderId;
};

/**
 * Check if the recipient has replied after this message
 */
export const hasReplied = (
  messages: any[],
  currentIndex: number,
  accountNumber: string,
): boolean => {
  const prevMessage =
    currentIndex < messages.length - 1 ? messages[currentIndex + 1] : null;
  return !!(prevMessage && prevMessage.senderId !== accountNumber);
};
