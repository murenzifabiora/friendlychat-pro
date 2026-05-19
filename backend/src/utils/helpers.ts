export const generateRoomId = (userId1: string, userId2: string): string => {
  return [userId1, userId2].sort().join('-');
};

export const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
};

export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const truncate = (str: string, maxLength: number): string => {
  return str.length > maxLength ? str.slice(0, maxLength) + '...' : str;
};

/**
 * Extract hashtags from text content.
 * Returns lowercase tags without the '#' prefix.
 */
export const extractHashtags = (text: string): string[] => {
  const matches = text.match(/#([a-zA-Z0-9_]+)/g) || [];
  return [...new Set(matches.map((tag) => tag.slice(1).toLowerCase()))];
};

/**
 * Extract @mentions from text content.
 * Returns lowercase usernames without the '@' prefix.
 */
export const extractMentionUsernames = (text: string): string[] => {
  const matches = text.match(/@([a-zA-Z0-9_]+)/g) || [];
  return [...new Set(matches.map((m) => m.slice(1).toLowerCase()))];
};
