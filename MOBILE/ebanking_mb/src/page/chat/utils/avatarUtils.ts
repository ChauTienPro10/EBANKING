/**
 * Avatar utility functions for chat
 * Generates consistent colors and text for user avatars
 */

const AVATAR_COLORS = [
  '#FF6B6B',
  '#4ECDC4',
  '#45B7D1',
  '#FFA07A',
  '#98D8C8',
  '#F7DC6F',
  '#BB8FCE',
  '#85C1E2',
  '#F8B739',
  '#52B788',
  '#FF8C94',
  '#A8DADC',
  '#E76F51',
  '#2A9D8F',
  '#E9C46A',
  '#F4A582',
  '#8E7CC3',
  '#6C5B7B',
  '#C06C84',
  '#F67280',
];

/**
 * Generate a consistent color based on a string input
 * Same string will always produce the same color
 */
export const getAvatarColor = (text: string): string => {
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    hash = text.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % AVATAR_COLORS.length;
  return AVATAR_COLORS[index];
};

/**
 * Get the first letter of a name in uppercase for avatar display
 */
export const getAvatarText = (name?: string): string => {
  if (!name) return '?';
  return name.charAt(0).toUpperCase();
};
