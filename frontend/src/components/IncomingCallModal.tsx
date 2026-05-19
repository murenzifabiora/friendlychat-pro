import React, { useEffect, useState } from 'react';
import { FiPhone, FiPhoneOff, FiVideo } from 'react-icons/fi';

interface IncomingCallModalProps {
  callerName: string;
  callType: 'audio' | 'video';
  onAccept: () => void;
  onDecline: () => void;
}

const IncomingCallModal: React.FC<IncomingCallModalProps> = ({
  callerName,
  callType,
  onAccept,
  onDecline,
}) => {
  const [ringing, setRinging] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => setRinging((r) => !r), 600);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70 backdrop-blur-sm">
      <div className="bg-gray-800 rounded-2xl shadow-2xl p-8 flex flex-col items-center gap-6 w-80 border border-gray-700">
        {/* Animated avatar */}
        <div
          className={`w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-4xl shadow-lg transition-transform duration-300 ${
            ringing ? 'scale-110' : 'scale-100'
          }`}
        >
          {callType === 'video' ? '📹' : '📞'}
        </div>

        <div className="text-center">
          <p className="text-gray-400 text-sm mb-1">Incoming {callType} call</p>
          <h2 className="text-white text-2xl font-bold">{callerName}</h2>
        </div>

        <div className="flex gap-8">
          {/* Decline */}
          <button
            onClick={onDecline}
            className="flex flex-col items-center gap-2 group"
            aria-label="Decline call"
          >
            <div className="w-16 h-16 rounded-full bg-red-600 hover:bg-red-700 flex items-center justify-center transition shadow-lg group-hover:scale-105">
              <FiPhoneOff size={28} className="text-white" />
            </div>
            <span className="text-gray-400 text-xs">Decline</span>
          </button>

          {/* Accept */}
          <button
            onClick={onAccept}
            className="flex flex-col items-center gap-2 group"
            aria-label="Accept call"
          >
            <div className="w-16 h-16 rounded-full bg-green-500 hover:bg-green-600 flex items-center justify-center transition shadow-lg group-hover:scale-105">
              {callType === 'video' ? (
                <FiVideo size={28} className="text-white" />
              ) : (
                <FiPhone size={28} className="text-white" />
              )}
            </div>
            <span className="text-gray-400 text-xs">Accept</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default IncomingCallModal;
