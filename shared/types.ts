// Shared types for frontend and backend

export interface User {
  _id: string;
  username: string;
  email: string;
  profile: {
    avatar?: string;
    bio?: string;
    status: 'online' | 'offline' | 'away';
  };
}

export interface Message {
  _id: string;
  sender: string;
  recipient: string;
  content: string;
  type: 'text' | 'audio' | 'video' | 'note';
  mediaUrl?: string;
  timestamp: Date;
  read: boolean;
}

export interface VoiceAnalysisResult {
  emotionalState: string;
  confidence: number;
  detectedPatterns: string[];
  callDuration: number;
}

export interface CallData {
  fromUser: string;
  toUser: string;
  type: 'audio' | 'video';
  offer?: any;
  answer?: any;
  candidate?: any;
}
