import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiArrowLeft, FiMic, FiVideo, FiPhone } from 'react-icons/fi';
import { useWebRTC } from '../hooks/useWebRTC';
import CallWindow from '../components/CallWindow';
import IncomingCallModal from '../components/IncomingCallModal';
import UserList from '../components/UserList';
import { userService } from '../services/apiService';
import { initiateCall, onIncomingCall, onCallEnded } from '../services/socketService';

const CallPage: React.FC = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [callType, setCallType] = useState<'audio' | 'video'>('audio');
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isVideoEnabled, setIsVideoEnabled] = useState(false);
  const [incomingCall, setIncomingCall] = useState<{
    callerId: string;
    callerName: string;
    offer: any;
    type: 'audio' | 'video';
  } | null>(null);
  const [activeCallUser, setActiveCallUser] = useState<any>(null);

  const {
    localStream,
    remoteStream,
    callStatus,
    startCall,
    acceptCall,
    hangUp,
    toggleAudio,
    toggleVideo,
  } = useWebRTC({ isVideoEnabled, isAudioEnabled });

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    onIncomingCall((data: any) => {
      const caller = users.find((u) => u._id === data.callerId);
      setIncomingCall({
        callerId: data.callerId,
        callerName: caller?.username || 'Unknown',
        offer: data.offer,
        type: data.type || 'audio',
      });
    });

    onCallEnded(() => {
      setActiveCallUser(null);
    });
  }, [users]);

  const loadUsers = async () => {
    try {
      const response = await userService.getAllUsers();
      const userId = localStorage.getItem('userId');
      setUsers(response.data.filter((u: any) => u._id !== userId));
    } catch (error) {
      console.error('Error loading users:', error);
    }
  };

  const handleStartCall = useCallback(async () => {
    if (!selectedUser) return;
    setActiveCallUser(selectedUser);
    const offer = await startCall(selectedUser._id);
    if (offer) {
      initiateCall(selectedUser._id, { type: callType, offer });
    }
  }, [selectedUser, callType, startCall]);

  const handleAcceptCall = useCallback(async () => {
    if (!incomingCall) return;
    const caller = users.find((u) => u._id === incomingCall.callerId);
    setActiveCallUser(caller);
    setIncomingCall(null);
    await acceptCall(incomingCall.callerId, incomingCall.offer);
  }, [incomingCall, users, acceptCall]);

  const handleDeclineCall = useCallback(() => {
    setIncomingCall(null);
  }, []);

  const handleEndCall = useCallback(() => {
    hangUp(activeCallUser?._id);
    setActiveCallUser(null);
  }, [hangUp, activeCallUser]);

  const handleToggleAudio = () => {
    toggleAudio();
    setIsAudioEnabled((v) => !v);
  };

  const handleToggleVideo = () => {
    toggleVideo();
    setIsVideoEnabled((v) => !v);
  };

  // Active call screen
  if (activeCallUser && (callStatus === 'calling' || callStatus === 'connected')) {
    return (
      <CallWindow
        remoteName={activeCallUser.username}
        onEndCall={handleEndCall}
        isVideoEnabled={isVideoEnabled}
        isAudioEnabled={isAudioEnabled}
        onToggleVideo={handleToggleVideo}
        onToggleAudio={handleToggleAudio}
        localStream={localStream}
        remoteStream={remoteStream}
      />
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      {/* Incoming call modal */}
      {incomingCall && (
        <IncomingCallModal
          callerName={incomingCall.callerName}
          callType={incomingCall.type}
          onAccept={handleAcceptCall}
          onDecline={handleDeclineCall}
        />
      )}

      {/* Header */}
      <div className="bg-blue-600 text-white shadow p-4 flex items-center">
        <button
          onClick={() => navigate('/chat')}
          className="mr-4 p-2 hover:bg-blue-700 rounded-lg transition"
          aria-label="Back to chat"
        >
          <FiArrowLeft className="text-xl" />
        </button>
        <h1 className="text-2xl font-bold">Calls</h1>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Users List */}
        <div className="w-72 border-r border-gray-200 bg-white flex flex-col">
          <div className="p-4 border-b border-gray-200">
            <h2 className="font-bold text-gray-900">Contacts</h2>
            <p className="text-sm text-gray-500">Select a contact to call</p>
          </div>
          <div className="flex-1 overflow-y-auto">
            <UserList
              users={users}
              selectedUserId={selectedUser?._id}
              onSelectUser={setSelectedUser}
            />
          </div>
        </div>

        {/* Call Setup Area */}
        <div className="flex-1 flex flex-col items-center justify-center gap-8 p-8 bg-gradient-to-br from-gray-50 to-blue-50">
          {selectedUser ? (
            <>
              {/* User avatar */}
              <div className="text-center">
                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-400 to-purple-600 mx-auto mb-4 flex items-center justify-center text-5xl text-white font-bold shadow-xl">
                  {selectedUser.username[0]?.toUpperCase()}
                </div>
                <h2 className="text-2xl font-bold text-gray-900">{selectedUser.username}</h2>
                <p className="text-gray-500">{selectedUser.email}</p>
                <div className="flex items-center justify-center gap-1 mt-1">
                  <span
                    className={`w-2.5 h-2.5 rounded-full ${
                      selectedUser.profile?.status === 'online'
                        ? 'bg-green-500'
                        : 'bg-gray-400'
                    }`}
                  />
                  <span className="text-sm text-gray-500 capitalize">
                    {selectedUser.profile?.status || 'offline'}
                  </span>
                </div>
              </div>

              {/* Call type selector */}
              <div className="flex gap-4 bg-white rounded-2xl p-2 shadow-md">
                <button
                  onClick={() => setCallType('audio')}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium transition ${
                    callType === 'audio'
                      ? 'bg-blue-600 text-white shadow'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <FiMic size={18} />
                  Audio Call
                </button>
                <button
                  onClick={() => setCallType('video')}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium transition ${
                    callType === 'video'
                      ? 'bg-blue-600 text-white shadow'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <FiVideo size={18} />
                  Video Call
                </button>
              </div>

              {/* Start call button */}
              <button
                onClick={handleStartCall}
                disabled={selectedUser.profile?.status !== 'online'}
                className="flex items-center gap-3 px-8 py-4 bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white font-bold rounded-full text-lg transition shadow-lg hover:shadow-xl disabled:cursor-not-allowed"
              >
                <FiPhone size={22} />
                {callType === 'video' ? 'Start Video Call' : 'Start Audio Call'}
              </button>

              {selectedUser.profile?.status !== 'online' && (
                <p className="text-gray-500 text-sm">
                  {selectedUser.username} is currently offline
                </p>
              )}
            </>
          ) : (
            <div className="text-center text-gray-500">
              <div className="text-6xl mb-4">📞</div>
              <p className="text-xl font-medium text-gray-700">Select a contact</p>
              <p className="text-gray-500 mt-1">Choose someone from the list to call</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CallPage;
