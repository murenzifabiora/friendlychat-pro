// Shared constants

export const VOICE_ANALYSIS_EMOTIONS = [
  'happy',
  'sad',
  'angry',
  'calm',
  'stressed',
  'tired',
  'neutral',
] as const;

export const CALL_TYPES = ['audio', 'video'] as const;

export const MESSAGE_TYPES = ['text', 'audio', 'video', 'note'] as const;

export const USER_STATUS = ['online', 'offline', 'away'] as const;

// API Endpoints
export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    LOGOUT: '/auth/logout',
  },
  USERS: {
    PROFILE: '/users/profile',
    CONTACTS: '/users/contacts',
    SEARCH: '/users/search',
  },
  MESSAGES: {
    GET: '/messages',
    SEND: '/messages',
    UPLOAD: '/messages/upload',
  },
  VOICE_ANALYSIS: {
    ANALYZE: '/voice-analysis',
    HISTORY: '/voice-analysis/history',
  },
} as const;

// WebSocket Events
export const SOCKET_EVENTS = {
  CONNECT: 'connect',
  DISCONNECT: 'disconnect',
  MESSAGE: 'message',
  VOICE_ANALYSIS: 'voice-analysis',
  VOICE_ANALYSIS_RESULT: 'voice-analysis-result',
  CALL_INITIATE: 'call-initiate',
  INCOMING_CALL: 'incoming-call',
  CALL_ANSWER: 'call-answer',
  CALL_ANSWERED: 'call-answered',
  CALL_END: 'call-end',
  CALL_ENDED: 'call-ended',
  USER_STATUS: 'user-status',
} as const;
