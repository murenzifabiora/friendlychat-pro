import React from 'react';
import { FiFile, FiDownload } from 'react-icons/fi';

interface Message {
  _id: string;
  sender: { _id: string; username: string } | string;
  content: string;
  type?: 'text' | 'audio' | 'video' | 'note';
  mediaUrl?: string;
  timestamp: Date | string;
}

interface ChatMessageProps {
  message: Message;
  isOwn: boolean;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ message, isOwn }) => {
  const time = new Date(message.timestamp).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  const renderContent = () => {
    switch (message.type) {
      case 'audio':
        return (
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2 text-xs opacity-75 mb-1">
              <span>🎙️</span>
              <span>Voice Note</span>
            </div>
            {message.mediaUrl ? (
              <audio
                src={message.mediaUrl}
                controls
                className="max-w-xs h-8"
                style={{ filter: isOwn ? 'invert(1) hue-rotate(180deg)' : 'none' }}
              />
            ) : (
              <span className="text-xs opacity-75">[Audio note]</span>
            )}
          </div>
        );

      case 'video':
        return (
          <div className="flex flex-col gap-1">
            {message.mediaUrl ? (
              <video
                src={message.mediaUrl}
                controls
                className="max-w-xs rounded-lg"
                style={{ maxHeight: '200px' }}
              />
            ) : (
              <span className="text-xs opacity-75">📹 [Video]</span>
            )}
          </div>
        );

      case 'note':
        return (
          <div className="flex items-center gap-2">
            <FiFile size={18} />
            <span className="text-sm flex-1 truncate max-w-[160px]">
              {message.content || 'File attachment'}
            </span>
            {message.mediaUrl && (
              <a
                href={message.mediaUrl}
                download
                className="opacity-75 hover:opacity-100"
                onClick={(e) => e.stopPropagation()}
              >
                <FiDownload size={16} />
              </a>
            )}
          </div>
        );

      default:
        return <p className="break-words text-sm leading-relaxed">{message.content}</p>;
    }
  };

  return (
    <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'} mb-3`}>
      {/* Avatar for received messages */}
      {!isOwn && (
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-xs font-bold mr-2 flex-shrink-0 self-end">
          {typeof message.sender === 'object'
            ? message.sender.username[0]?.toUpperCase()
            : '?'}
        </div>
      )}

      <div
        className={`max-w-xs lg:max-w-md px-4 py-2.5 rounded-2xl shadow-sm ${
          isOwn
            ? 'bg-blue-600 text-white rounded-br-sm'
            : 'bg-white text-gray-900 rounded-bl-sm border border-gray-100'
        }`}
      >
        {renderContent()}
        <p
          className={`text-xs mt-1 text-right ${
            isOwn ? 'text-blue-100' : 'text-gray-400'
          }`}
        >
          {time}
        </p>
      </div>
    </div>
  );
};

export default ChatMessage;
