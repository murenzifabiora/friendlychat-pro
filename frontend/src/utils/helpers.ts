export const formatDate = (date: Date | string): string => {
  const d = new Date(date);
  return d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

export const truncateText = (text: string, length: number): string => {
  return text.length > length ? text.substring(0, length) + '...' : text;
};

export const getInitials = (name: string): string => {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase();
};

export const getStatusColor = (status: string): string => {
  switch (status) {
    case 'online':
      return 'text-green-600';
    case 'away':
      return 'text-yellow-600';
    case 'offline':
      return 'text-gray-600';
    default:
      return 'text-gray-400';
  }
};

/** Extract hashtags from text, returns lowercase tags without '#'. */
export const extractHashtags = (text: string): string[] => {
  const matches = text.match(/#([a-zA-Z0-9_]+)/g) || [];
  return [...new Set(matches.map((tag) => tag.slice(1).toLowerCase()))];
};

/** Extract @mentions from text, returns lowercase usernames without '@'. */
export const extractMentions = (text: string): string[] => {
  const matches = text.match(/@([a-zA-Z0-9_]+)/g) || [];
  return [...new Set(matches.map((m) => m.slice(1).toLowerCase()))];
};

/**
 * Render story/comment content as an array of plain-text and tagged segments.
 * Used by components to highlight #hashtags and @mentions.
 */
export type ContentSegment =
  | { type: 'text'; value: string }
  | { type: 'hashtag'; value: string }
  | { type: 'mention'; value: string };

export const parseContentSegments = (text: string): ContentSegment[] => {
  const segments: ContentSegment[] = [];
  const regex = /(#[a-zA-Z0-9_]+|@[a-zA-Z0-9_]+)/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      segments.push({ type: 'text', value: text.slice(lastIndex, match.index) });
    }
    const token = match[0];
    if (token.startsWith('#')) {
      segments.push({ type: 'hashtag', value: token });
    } else {
      segments.push({ type: 'mention', value: token });
    }
    lastIndex = regex.lastIndex;
  }

  if (lastIndex < text.length) {
    segments.push({ type: 'text', value: text.slice(lastIndex) });
  }

  return segments;
};
