import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FiLogOut, FiBell, FiMessageSquare, FiRss, FiUser } from 'react-icons/fi';
import { useNotifications } from '../context/NotificationContext';
import NotificationPanel from './NotificationPanel';

interface NavigationProps {
  currentUser: { username: string; email: string } | null;
  onLogout: () => void;
  onMenuToggle?: () => void;
}

const Navigation: React.FC<NavigationProps> = ({ currentUser, onLogout, onMenuToggle }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { unreadCount } = useNotifications();
  const [showNotifications, setShowNotifications] = useState(false);

  const navLinks = [
    { path: '/chat', label: 'Chat', icon: <FiMessageSquare size={18} /> },
    { path: '/feed', label: 'Feed', icon: <FiRss size={18} /> },
    { path: '/profile', label: 'Profile', icon: <FiUser size={18} /> },
  ];

  return (
    <nav className="bg-gradient-to-r from-blue-600 to-blue-800 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center gap-6">
            <span
              className="text-2xl font-bold cursor-pointer"
              onClick={() => navigate('/chat')}
            >
              🎙️ VoiceChat Pro
            </span>

            {/* Nav links */}
            {currentUser && (
              <div className="hidden sm:flex items-center gap-1">
                {navLinks.map((link) => (
                  <button
                    key={link.path}
                    onClick={() => navigate(link.path)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition ${
                      location.pathname === link.path
                        ? 'bg-white bg-opacity-20 text-white'
                        : 'text-blue-100 hover:bg-white hover:bg-opacity-10'
                    }`}
                  >
                    {link.icon}
                    {link.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right side */}
          {currentUser && (
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="font-semibold text-sm">{currentUser.username}</p>
                <p className="text-blue-100 text-xs">{currentUser.email}</p>
              </div>

              {/* Notification bell */}
              <div className="relative">
                <button
                  onClick={() => setShowNotifications((v) => !v)}
                  className="relative p-2 hover:bg-blue-700 rounded-full transition"
                  aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ''}`}
                >
                  <FiBell size={20} />
                  {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center px-1">
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                  )}
                </button>

                {showNotifications && (
                  <NotificationPanel onClose={() => setShowNotifications(false)} />
                )}
              </div>

              <button
                onClick={onLogout}
                className="p-2 hover:bg-blue-700 rounded-full transition"
                title="Logout"
                aria-label="Logout"
              >
                <FiLogOut size={20} />
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
