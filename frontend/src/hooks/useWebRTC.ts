import { useEffect, useRef, useState, useCallback } from 'react';
import SimplePeer from 'simple-peer';
import {
  sendIceCandidate,
  onIceCandidate,
  onCallAnswered,
  onCallEnded,
  answerCall,
  endCall,
} from '../services/socketService';

export type CallStatus = 'idle' | 'calling' | 'ringing' | 'connected' | 'ended';

interface UseWebRTCOptions {
  isVideoEnabled: boolean;
  isAudioEnabled: boolean;
}

export const useWebRTC = ({ isVideoEnabled, isAudioEnabled }: UseWebRTCOptions) => {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [callStatus, setCallStatus] = useState<CallStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const peerRef = useRef<SimplePeer.Instance | null>(null);
  const remoteUserIdRef = useRef<string | null>(null);

  const getLocalStream = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: isAudioEnabled,
        video: isVideoEnabled,
      });
      setLocalStream(stream);
      return stream;
    } catch (err: any) {
      setError('Could not access camera/microphone: ' + err.message);
      return null;
    }
  }, [isVideoEnabled, isAudioEnabled]);

  const stopLocalStream = useCallback(() => {
    localStream?.getTracks().forEach((t) => t.stop());
    setLocalStream(null);
  }, [localStream]);

  const createPeer = useCallback(
    (stream: MediaStream, initiator: boolean, signal?: any) => {
      const peer = new SimplePeer({
        initiator,
        stream,
        trickle: false,
        config: {
          iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:stun1.l.google.com:19302' },
          ],
        },
      });

      peer.on('signal', (data) => {
        if (initiator) {
          // Offer — handled by caller
        } else {
          // Answer
          if (remoteUserIdRef.current) {
            answerCall(remoteUserIdRef.current, data);
          }
        }
      });

      peer.on('stream', (remoteMediaStream) => {
        setRemoteStream(remoteMediaStream);
        setCallStatus('connected');
      });

      peer.on('error', (err) => {
        console.error('Peer error:', err);
        setError('Connection error: ' + err.message);
      });

      peer.on('close', () => {
        setCallStatus('ended');
        setRemoteStream(null);
      });

      if (!initiator && signal) {
        peer.signal(signal);
      }

      peerRef.current = peer;
      return peer;
    },
    []
  );

  // Start a call (initiator)
  const startCall = useCallback(
    async (targetUserId: string): Promise<any> => {
      remoteUserIdRef.current = targetUserId;
      const stream = await getLocalStream();
      if (!stream) return null;

      setCallStatus('calling');
      const peer = createPeer(stream, true);

      return new Promise((resolve) => {
        peer.on('signal', (offer) => {
          resolve(offer);
        });
      });
    },
    [getLocalStream, createPeer]
  );

  // Accept an incoming call
  const acceptCall = useCallback(
    async (callerId: string, offer: any) => {
      remoteUserIdRef.current = callerId;
      const stream = await getLocalStream();
      if (!stream) return;

      setCallStatus('connected');
      createPeer(stream, false, offer);
    },
    [getLocalStream, createPeer]
  );

  // Handle call answered (caller side)
  const handleCallAnswered = useCallback((answer: any) => {
    peerRef.current?.signal(answer);
  }, []);

  // End the call
  const hangUp = useCallback(
    (remoteUserId?: string) => {
      peerRef.current?.destroy();
      peerRef.current = null;
      stopLocalStream();
      setRemoteStream(null);
      setCallStatus('ended');
      if (remoteUserId) endCall(remoteUserId);
    },
    [stopLocalStream]
  );

  // Toggle audio
  const toggleAudio = useCallback(() => {
    localStream?.getAudioTracks().forEach((t) => {
      t.enabled = !t.enabled;
    });
  }, [localStream]);

  // Toggle video
  const toggleVideo = useCallback(() => {
    localStream?.getVideoTracks().forEach((t) => {
      t.enabled = !t.enabled;
    });
  }, [localStream]);

  // Listen for call answered
  useEffect(() => {
    onCallAnswered((data) => {
      handleCallAnswered(data.answer);
    });
  }, [handleCallAnswered]);

  // Listen for call ended
  useEffect(() => {
    onCallEnded(() => {
      hangUp();
    });
  }, [hangUp]);

  return {
    localStream,
    remoteStream,
    callStatus,
    error,
    startCall,
    acceptCall,
    hangUp,
    toggleAudio,
    toggleVideo,
  };
};
