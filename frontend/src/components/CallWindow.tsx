import React, { useState, useEffect, useRef } from 'react';
import {
  FiPhone,
  FiPhoneOff,
  FiMic,
  FiMicOff,
  FiVideo,
  FiVideoOff,
  FiMaximize2,
  FiMinimize2,
  FiActivity,
} from 'react-icons/fi';
import { useVoiceAnalysis } from '../hooks/useVoiceAnalysis';
import VoiceAnalysisPanel from './VoiceAnalysisPanel';

interface CallWindowProps {
  remoteName: string;
  onEndCall: () => void;
  isVideoEnabled?: boolean;
  isAudioEnabled?: boolean;
  onToggleVideo?: () => void;
  onToggleAudio?: () => void;
  localStream?: MediaStream | null;
  remoteStream?: MediaStream | null;
}

const CallWindow: React.FC<CallWindowProps> = ({
  remoteName,
  onEndCall,
  isVideoEnabled = false,
  isAudioEnabled = true,
  onToggleVideo,
  onToggleAudio,
  localStream,
  remoteStream,
}) => {
  const [callDuration, setCallDuration] = useState(0);
  const [showAnalysis, setShowAnalysis] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);

  // Analyze the remote stream (the person you're talking to)
  const { result: remoteAnalysis, isAnalyzing } = useVoiceAnalysis(
    remoteStream || null,
    true
  );

  // Also analyze local stream
  const { result: localAnalysis } = useVoiceAnalysis(localStream || null, true);

  useEffect(() => {
    const interval = setInterval(() => setCallDuration((prev) => prev + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [localStream]);

  useEffect(() => {
    if (remoteVideoRef.current && remoteStream) {
      remoteVideoRef.current.srcObject = remoteStream;
    }
  }, [remoteStream]);

  const formatDuration = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h > 0 ? h + ':' : ''}${m.toString().padStart(2, '0')}:${s
      .toString()
      .padStart(2, '0')}`;
  };

  return (
    <div
      className={`${
        isFullscreen ? 'fixed inset-0' : 'fixed inset-0'
      } bg-gradient-to-b from-gray-900 to-gray-950 flex flex-col z-50`}
    >
      {/* Main video area */}
      <div className="flex-1 relative overflow-hidden">
        {/* Remote video (full background) */}
        {isVideoEnabled && remoteStream ? (
          <video
            ref={remoteVideoRef}
            autoPlay
            playsInline
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-center">
              <div className="w-36 h-36 rounded-full bg-gradient-to-br from-blue-500 to-purple-700 mx-auto mb-4 flex items-center justify-center text-6xl shadow-2xl">
                {remoteName[0]?.toUpperCase() || '?'}
              </div>
              <h2 className="text-white text-3xl font-bold">{remoteName}</h2>
              <p className="text-gray-400 mt-2 text-lg">{formatDuration(callDuration)}</p>
            </div>
          </div>
        )}

        {/* Local video (picture-in-picture) */}
        {isVideoEnabled && localStream && (
          <div className="absolute bottom-4 right-4 w-36 h-28 rounded-xl overflow-hidden border-2 border-gray-600 shadow-xl">
            <video
              ref={localVideoRef}
              autoPlay
              muted
              playsInline
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Call timer overlay */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-black bg-opacity-50 rounded-full px-4 py-1">
          <span className="text-white text-sm font-mono">{formatDuration(callDuration)}</span>
        </div>

        {/* Voice Analysis Panel */}
        {showAnalysis && (
          <div className="absolute top-4 left-4 flex flex-col gap-3">
            <VoiceAnalysisPanel
              result={remoteAnalysis}
              isAnalyzing={isAnalyzing}
              userName={remoteName}
            />
            {localAnalysis && (
              <VoiceAnalysisPanel
                result={localAnalysis}
                isAnalyzing={true}
                userName="You"
              />
            )}
          </div>
        )}

        {/* Toggle analysis button */}
        <button
          onClick={() => setShowAnalysis(!showAnalysis)}
          className={`absolute top-4 right-4 p-2 rounded-full transition ${
            showAnalysis
              ? 'bg-blue-600 text-white'
              : 'bg-black bg-opacity-50 text-gray-300 hover:bg-opacity-70'
          }`}
          title="Toggle Voice Analysis"
        >
          <FiActivity size={20} />
        </button>
      </div>

      {/* Controls bar */}
      <div className="bg-gray-900 bg-opacity-95 px-6 py-5 flex justify-center items-center gap-5 border-t border-gray-800">
        {/* Mute */}
        <ControlButton
          onClick={onToggleAudio}
          active={isAudioEnabled}
          activeIcon={<FiMic size={22} />}
          inactiveIcon={<FiMicOff size={22} />}
          label={isAudioEnabled ? 'Mute' : 'Unmute'}
          inactiveColor="bg-red-600 hover:bg-red-700"
        />

        {/* Video */}
        <ControlButton
          onClick={onToggleVideo}
          active={isVideoEnabled}
          activeIcon={<FiVideo size={22} />}
          inactiveIcon={<FiVideoOff size={22} />}
          label={isVideoEnabled ? 'Stop Video' : 'Start Video'}
          inactiveColor="bg-red-600 hover:bg-red-700"
        />

        {/* End call */}
        <button
          onClick={onEndCall}
          className="p-4 rounded-full bg-red-600 hover:bg-red-700 text-white transition shadow-lg hover:scale-105"
          title="End Call"
          aria-label="End call"
        >
          <FiPhoneOff size={26} />
        </button>
      </div>
    </div>
  );
};

interface ControlButtonProps {
  onClick?: () => void;
  active: boolean;
  activeIcon: React.ReactNode;
  inactiveIcon: React.ReactNode;
  label: string;
  inactiveColor?: string;
}

const ControlButton: React.FC<ControlButtonProps> = ({
  onClick,
  active,
  activeIcon,
  inactiveIcon,
  label,
  inactiveColor = 'bg-red-600 hover:bg-red-700',
}) => (
  <button
    onClick={onClick}
    className={`flex flex-col items-center gap-1 group`}
    title={label}
    aria-label={label}
  >
    <div
      className={`p-4 rounded-full transition shadow-md group-hover:scale-105 ${
        active
          ? 'bg-gray-700 hover:bg-gray-600 text-white'
          : `${inactiveColor} text-white`
      }`}
    >
      {active ? activeIcon : inactiveIcon}
    </div>
    <span className="text-gray-400 text-xs">{label}</span>
  </button>
);

export default CallWindow;
