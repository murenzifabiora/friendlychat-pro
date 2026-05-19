import React from 'react';
import { FiPhone, FiMessageSquare, FiUser, FiLogOut, FiMail } from 'react-icons/fi';

interface SidebarProps {
  onChatClick: () => void;
  onCallClick: () => void;
  onProfileClick: () => void;
  onFeedClick?: () => void;
  onLogout: () => void;
  activeTab?: 'chat' | 'call' | 'profile' | 'feed';
}

const Sidebar: React.FC<SidebarProps> = ({
  onChatClick,
  onCallClick,
  onProfileClick,
  onFeedClick,
  onLogout,
  activeTab = 'chat',
}) => {
  const isActive = (tab: string) => activeTab === tab;

  return (
    <div className="w-20 bg-gradient-to-b from-blue-700 to-blue-900 flex flex-col items-center py-8 gap-6 shadow-lg">
      {/* Chat */}
      <button
        onClick={onChatClick}
        className={`p-3 rounded-lg transition ${
          isActive('chat')
            ? 'bg-blue-600 text-white'
            : 'text-blue-200 hover:bg-blue-700 hover:text-white'
        }`}
        title="Chat"
      >
        <FiMessageSquare size={24} />
      </button>

      {/* Calls */}
      <button
        onClick={onCallClick}
        className={`p-3 rounded-lg transition ${
          isActive('call')
            ? 'bg-blue-600 text-white'
            : 'text-blue-200 hover:bg-blue-700 hover:text-white'
        }`}
        title="Calls"
      >
        <FiPhone size={24} />
      </button>

      {/* Feed */}
      {onFeedClick && (
        <button
          onClick={onFeedClick}
          className={`p-3 rounded-lg transition ${
            isActive('feed')
              ? 'bg-blue-600 text-white'
              : 'text-blue-200 hover:bg-blue-700 hover:text-white'
          }`}
          title="Feed"
        >
          <FiMail size={24} />
        </button>
      )}

      {/* Profile */}
      <button
        onClick={onProfileClick}
        className={`p-3 rounded-lg transition ${
          isActive('profile')
            ? 'bg-blue-600 text-white'
            : 'text-blue-200 hover:bg-blue-700 hover:text-white'
        }`}
        title="Profile"
      >
        <FiUser size={24} />
      </button>

      {/* Logout */}
      <div className="flex-1" />
      <button
        onClick={onLogout}
        className="p-3 rounded-lg text-blue-200 hover:bg-red-600 hover:text-white transition"
        title="Logout"
      >
        <FiLogOut size={24} />
      </button>
    </div>
  );
};

export default Sidebar;
