import React, { useEffect, useRef } from 'react';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';
import { FiPhone, FiVideo } from 'react-icons/fi';

interface Message {
  _id: string;
  sender: { _id: string; username: string } | string;
  content: string;
  type?: 'text' | 'audio' | 'video' | 'note';
  mediaUrl?: string;
  timestamp: Date | string;
}

interface ChatBoxProps {
  userId: string;
  selectedUser: any;
  messages: Message[];
  onSendMessage: (message: string, type?: 'text' | 'audio' | 'video' | 'note') => void;
  onSendFile?: (file: File, type: 'audio' | 'video' | 'note') => void;
  onStartCall?: (type: 'audio' | 'video') => void;
  isLoading?: boolean;
}

const ChatBox: React.FC<ChatBoxProps> = ({
  userId,
  selectedUser,
  messages,
  onSendMessage,
  onSendFile,
  onStartCall,
  isLoading = false,
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!selectedUser) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-6xl mb-4">💬</div>
          <h3 className="text-xl font-semibold text-gray-700 mb-2">
            Select a conversation
          </h3>
          <p className="text-gray-500">
            Choose a contact from the list to start chatting
          </p>
        </div>
      </div>
    );
  }

  const senderId = typeof messages[0]?.sender === 'object'
    ? messages[0]?.sender?._id
    : messages[0]?.sender;

  return (
    <div className="flex-1 flex flex-col bg-gray-50 min-w-0">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold">
            {selectedUser.username[0]?.toUpperCase()}
          </div>
          <div>
            <h2 className="font-semibold text-gray-900">{selectedUser.username}</h2>
            <div className="flex items-center gap-1">
              <span
                className={`w-2 h-2 rounded-full ${
                  selectedUser.profile?.status === 'online'
                    ? 'bg-green-500'
                    : selectedUser.profile?.status === 'away'
                    ? 'bg-yellow-500'
                    : 'bg-gray-400'
                }`}
              />
              <span className="text-xs text-gray-500 capitalize">
                {selectedUser.profile?.status || 'offline'}
              </span>
            </div>
          </div>
        </div>

        {/* Call buttons */}
        {onStartCall && (
          <div className="flex gap-2">
            <button
              onClick={() => onStartCall('audio')}
              className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition"
              title="Audio call"
            >
              <FiPhone size={20} />
            </button>
            <button
              onClick={() => onStartCall('video')}
              className="p-2 text-blue-600 hover:bg-blue-50 rounded-full transition"
              title="Video call"
            >
              <FiVideo size={20} />
            </button>
          </div>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-1">
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-12">
            <div className="text-4xl mb-3">👋</div>
            <p className="text-gray-500">
              No messages yet. Say hello to{' '}
              <span className="font-semibold">{selectedUser.username}</span>!
            </p>
          </div>
        ) : (
          messages.map((message) => (
            <ChatMessage
              key={message._id}
              message={message}
              isOwn={
                typeof message.sender === 'object'
                  ? message.sender._id === userId
                  : message.sender === userId
              }
            />
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <ChatInput
        onSendMessage={onSendMessage}
        onSendFile={onSendFile}
        disabled={isLoading}
      />
    </div>
  );
};

export default ChatBox;
