import io, { Socket } from 'socket.io-client';

const SOCKET_URL = (typeof process !== 'undefined' && process.env.REACT_APP_WS_URL) ? process.env.REACT_APP_WS_URL : 'http://localhost:5001';

let socket: Socket | null = null;

export const connectSocket = (userId: string): Socket => {
  if (socket && socket.connected) return socket;

  socket = io(SOCKET_URL, {
    reconnection: true,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
    reconnectionAttempts: 5,
  });

  socket.on('connect', () => {
    console.log('✅ Connected to server');
    socket?.emit('user-join', userId);
  });

  socket.on('disconnect', () => {
    console.log('❌ Disconnected from server');
  });

  socket.on('error', (error: any) => {
    console.error('Socket error:', error);
  });

  return socket;
};

export const getSocket = (): Socket | null => socket;

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

// Message events
export const sendMessage = (data: any) => {
  socket?.emit('message', data);
};

export const onReceiveMessage = (callback: (data: any) => void) => {
  socket?.off('receive-message');
  socket?.on('receive-message', callback);
};

// Call events
export const initiateCall = (calleeId: string, callData: any) => {
  const callerId = localStorage.getItem('userId');
  socket?.emit('call-initiate', { calleeId, callerId, ...callData });
};

export const answerCall = (callerId: string, answer: any) => {
  socket?.emit('call-answer', { callerId, answer });
};

export const endCall = (recipientId: string) => {
  socket?.emit('call-end', { recipientId });
};

export const onIncomingCall = (callback: (data: any) => void) => {
  socket?.off('incoming-call');
  socket?.on('incoming-call', callback);
};

export const onCallAnswered = (callback: (data: any) => void) => {
  socket?.off('call-answered');
  socket?.on('call-answered', callback);
};

export const onCallEnded = (callback: () => void) => {
  socket?.off('call-ended');
  socket?.on('call-ended', callback);
};

// ICE candidates
export const sendIceCandidate = (targetUserId: string, candidate: any) => {
  socket?.emit('ice-candidate', { targetUserId, candidate });
};

export const onIceCandidate = (callback: (data: any) => void) => {
  socket?.off('ice-candidate');
  socket?.on('ice-candidate', callback);
};

// Users list
export const onUsersList = (callback: (users: string[]) => void) => {
  socket?.off('users-list');
  socket?.on('users-list', callback);
};

// Voice analysis
export const sendVoiceAnalysis = (data: any) => {
  socket?.emit('voice-analysis', data);
};

export const onVoiceAnalysis = (callback: (data: any) => void) => {
  socket?.off('voice-analysis-result');
  socket?.on('voice-analysis-result', callback);
};

// User status
export const updateUserStatus = (userId: string, status: string) => {
  socket?.emit('user-status', { userId, status });
};

export const onUserStatusChanged = (callback: (data: any) => void) => {
  socket?.off('user-status-changed');
  socket?.on('user-status-changed', callback);
};

// Notifications
export const onNotification = (callback: (notification: any) => void) => {
  socket?.off('notification');
  socket?.on('notification', callback);
};

export const offNotification = () => {
  socket?.off('notification');
};
