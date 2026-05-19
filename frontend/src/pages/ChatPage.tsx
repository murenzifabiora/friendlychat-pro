import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  connectSocket,
  sendMessage,
  onReceiveMessage,
  onUsersList,
  onIncomingCall,
  initiateCall,
  onCallEnded,
} from '../services/socketService';
import { chatService, userService } from '../services/apiService';
import { useWebRTC } from '../hooks/useWebRTC';
import UserList from '../components/UserList';
import ChatBox from '../components/ChatBox';
import Sidebar from '../components/Sidebar';
import Navigation from '../components/Navigation';
import CallWindow from '../components/CallWindow';
import IncomingCallModal from '../components/IncomingCallModal';

const ChatPage: React.FC = () => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isVideoEnabled, setIsVideoEnabled] = useState(false);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [activeCallUser, setActiveCallUser] = useState<any>(null);
  const [incomingCall, setIncomingCall] = useState<{
    callerId: string;
    callerName: string;
    offer: any;
    type: 'audio' | 'video';
  } | null>(null);

  // Keep a ref to selectedUser so socket callbacks always see the latest value
  const selectedUserRef = React.useRef<any>(null);
  selectedUserRef.current = selectedUser;

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
    const userId = localStorage.getItem('userId');
    const token = localStorage.getItem('token');

    if (!token || !userId) {
      navigate('/login');
      return;
    }

    const initialize = async () => {
      await Promise.all([loadCurrentUser(), loadUsers()]);
      connectSocket(userId);
      setupSocketListeners();
      setLoading(false);
    };

    initialize();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navigate]);

  const loadCurrentUser = async () => {
    try {
      const response = await userService.getProfile();
      setCurrentUser(response.data);
    } catch (error) {
      console.error('Error loading current user:', error);
    }
  };

  const loadUsers = async () => {
    try {
      const response = await userService.getAllUsers();
      const userId = localStorage.getItem('userId');
      setUsers(response.data.filter((u: any) => u._id !== userId));
    } catch (error) {
      console.error('Error loading users:', error);
    }
  };

  const loadMessages = async (userId: string) => {
    try {
      const response = await chatService.getMessages(userId);
      setMessages(response.data);
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const setupSocketListeners = () => {
    onReceiveMessage((_data: any) => {
      // Reload messages from DB to get proper populated data
      if (selectedUserRef.current) {
        loadMessages(selectedUserRef.current._id);
      }
    });

    onUsersList((userIds: string[]) => {
      setUsers((prev) =>
        prev.map((user) => ({
          ...user,
          profile: {
            ...user.profile,
            status: userIds.includes(user._id) ? 'online' : 'offline',
          },
        }))
      );
    });

    onIncomingCall((data: any) => {
      setUsers((currentUsers) => {
        const caller = currentUsers.find((u) => u._id === data.callerId);
        setIncomingCall({
          callerId: data.callerId,
          callerName: caller?.username || 'Unknown',
          offer: data.offer,
          type: data.type || 'audio',
        });
        return currentUsers;
      });
    });

    onCallEnded(() => {
      setActiveCallUser(null);
    });
  };

  const handleSelectUser = (user: any) => {
    setSelectedUser(user);
    loadMessages(user._id);
  };

  const handleSendMessage = async (message: string, type: string = 'text') => {
    if (!selectedUser || !message.trim()) return;
    try {
      const userId = localStorage.getItem('userId');
      const response = await chatService.sendMessage(selectedUser._id, message, type);
      // Add the saved message directly (has proper _id and populated fields)
      setMessages((prev) => [...prev, response.data]);
      // Also notify recipient via socket
      sendMessage({
        senderId: userId,
        recipientId: selectedUser._id,
        content: message,
        type,
        timestamp: new Date(),
      });
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleSendFile = async (file: File, type: 'audio' | 'video' | 'note') => {
    if (!selectedUser) return;
    try {
      const formData = new FormData();
      formData.append('file', file);

      const uploadResponse = await chatService.uploadMedia(formData);
      const mediaUrl = `http://localhost:5001${uploadResponse.data?.url || ''}`;

      const response = await chatService.sendMessage(
        selectedUser._id,
        file.name,
        type,
        mediaUrl
      );
      setMessages((prev) => [...prev, response.data]);
    } catch (error) {
      console.error('Error sending file:', error);
    }
  };

  const handleStartCall = useCallback(
    async (callType: 'audio' | 'video') => {
      if (!selectedUser) return;
      setIsVideoEnabled(callType === 'video');
      setActiveCallUser(selectedUser);
      const offer = await startCall(selectedUser._id);
      if (offer) {
        initiateCall(selectedUser._id, { type: callType, offer });
      }
    },
    [selectedUser, startCall]
  );

  const handleAcceptCall = useCallback(async () => {
    if (!incomingCall) return;
    const caller = users.find((u) => u._id === incomingCall.callerId);
    setActiveCallUser(caller);
    setIsVideoEnabled(incomingCall.type === 'video');
    setIncomingCall(null);
    await acceptCall(incomingCall.callerId, incomingCall.offer);
  }, [incomingCall, users, acceptCall]);

  const handleDeclineCall = () => setIncomingCall(null);

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

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    navigate('/login');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Active call overlay
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

      <Navigation currentUser={currentUser} onLogout={handleLogout} />

      <div className="flex flex-1 overflow-hidden">
        <Sidebar
          onChatClick={() => {}}
          onCallClick={() => navigate('/call')}
          onProfileClick={() => navigate('/profile')}
          onLogout={handleLogout}
          activeTab="chat"
        />

        <div className="flex flex-1 overflow-hidden">
          <UserList
            users={users}
            selectedUserId={selectedUser?._id}
            onSelectUser={handleSelectUser}
          />
          <ChatBox
            userId={localStorage.getItem('userId') || ''}
            selectedUser={selectedUser}
            messages={messages}
            onSendMessage={handleSendMessage}
            onSendFile={handleSendFile}
            onStartCall={handleStartCall}
          />
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
