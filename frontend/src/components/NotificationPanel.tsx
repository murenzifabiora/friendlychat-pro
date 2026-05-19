import React, { useRef, useEffect } from 'react';
import { FiBell, FiCheck, FiTrash2, FiX } from 'react-icons/fi';
import { FaHeart, FaComment, FaAt, FaUserPlus } from 'react-icons/fa';
import { useNotifications, Notification } from '../context/NotificationContext';

interface NotificationPanelProps {
  onClose: () => void;
}

const typeIcon = (type: Notification['type']) => {
  switch (type) {
    case 'like':
      return <FaHeart className="text-red-400" size={14} />;
    case 'comment':
      return <FaComment className="text-blue-400" size={14} />;
    case 'mention':
      return <FaAt className="text-purple-400" size={14} />;
    case 'follow':
      return <FaUserPlus className="text-green-400" size={14} />;
  }
};

const typeLabel = (n: Notification): string => {
  const actor = n.actorId?.username ?? 'Someone';
  switch (n.type) {
    case 'like':
      return `${actor} liked your story`;
    case 'comment':
      return `${actor} commented on your story`;
    case 'mention':
      return `${actor} mentioned you`;
    case 'follow':
      return `${actor} started following you`;
  }
};

const NotificationPanel: React.FC<NotificationPanelProps> = ({ onClose }) => {
  const { notifications, loading, markAsRead, markAllAsRead, removeNotification } =
    useNotifications();
  const panelRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [onClose]);

  return (
    <div
      ref={panelRef}
      className="absolute right-0 top-12 w-80 bg-gray-800 border border-gray-700 rounded-xl shadow-2xl z-50 overflow-hidden"
      role="dialog"
      aria-label="Notifications"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-700">
        <div className="flex items-center gap-2">
          <FiBell className="text-blue-400" size={16} />
          <span className="text-white font-semibold text-sm">Notifications</span>
        </div>
        <div className="flex items-center gap-2">
          {notifications.some((n) => !n.read) && (
            <button
              onClick={markAllAsRead}
              className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 transition"
              title="Mark all as read"
            >
              <FiCheck size={12} />
              All read
            </button>
          )}
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition"
            aria-label="Close notifications"
          >
            <FiX size={16} />
          </button>
        </div>
      </div>

      {/* List */}
      <div className="max-h-96 overflow-y-auto">
        {loading && notifications.length === 0 ? (
          <div className="flex items-center justify-center py-8">
            <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-8 text-gray-400 text-sm">
            No notifications yet
          </div>
        ) : (
          notifications.map((n) => (
            <div
              key={n._id}
              className={`flex items-start gap-3 px-4 py-3 border-b border-gray-700 hover:bg-gray-750 transition cursor-pointer ${
                !n.read ? 'bg-gray-700 bg-opacity-40' : ''
              }`}
              onClick={() => !n.read && markAsRead(n._id)}
            >
              {/* Actor avatar */}
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center flex-shrink-0 overflow-hidden">
                {n.actorId?.profile?.avatar ? (
                  <img
                    src={n.actorId.profile.avatar}
                    alt={n.actorId.username}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-white text-xs font-bold">
                    {n.actorId?.username?.[0]?.toUpperCase()}
                  </span>
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1 mb-0.5">
                  {typeIcon(n.type)}
                  <p className="text-white text-xs font-medium truncate">{typeLabel(n)}</p>
                </div>
                {n.storyId?.content && (
                  <p className="text-gray-400 text-xs truncate">"{n.storyId.content}"</p>
                )}
                <p className="text-gray-500 text-xs mt-0.5">
                  {new Date(n.createdAt).toLocaleDateString()}
                </p>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-1 flex-shrink-0">
                {!n.read && (
                  <span className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0" aria-label="Unread" />
                )}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeNotification(n._id);
                  }}
                  className="text-gray-500 hover:text-red-400 transition p-1"
                  aria-label="Delete notification"
                >
                  <FiTrash2 size={12} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default NotificationPanel;
