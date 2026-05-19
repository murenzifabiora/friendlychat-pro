# WebRTC Integration Guide

## Overview

VoiceChat Pro uses WebRTC (Web Real-Time Communication) for peer-to-peer audio and video calling without requiring a media server.

## How WebRTC Works

```
┌──────────────────────────────────────────────────────────────────┐
│                                                                    │
│  User A                    Signaling Server                User B  │
│  ┌──────┐                   ┌──────┐                    ┌──────┐  │
│  │ Send │─ SDP Offer ──────>│Socket│─ SDP Offer ──────>│      │  │
│  │ Offer│                   │.io   │                   │ Recv │  │
│  └──────┘                   └──────┘                    │ Offer│  │
│     │                          │                        └──────┘  │
│     │                          │                           │       │
│  ┌──────┐                   ┌──────┐                    ┌──────┐  │
│  │ Recv │<─ SDP Answer ─────│Socket│<─ SDP Answer ─────│ Send │  │
│  │Answer│                   │.io   │                   │Answer│  │
│  └──────┘                   └──────┘                    └──────┘  │
│     │                          │                           │       │
│     │                          │                           │       │
│  ┌──────┐                   ┌──────┐                    ┌──────┐  │
│  │ Send │─ ICE Candidates ─>│Socket│─ ICE Candidates ─>│ Recv │  │
│  │ ICE  │                   │.io   │                   │ ICE  │  │
│  └──────┘                   └──────┘                    └──────┘  │
│     │                          │                           │       │
│     └───────────────────────────────────────────────────────┘     │
│              Peer-to-Peer Connection Established                   │
│         (Audio/Video stream flows directly)                        │
│                                                                    │
└──────────────────────────────────────────────────────────────────┘
```

## Key Concepts

### SDP (Session Description Protocol)
- Describes media session capabilities
- Contains codec information
- Contains network address information
- Exchanged between peers before connection

### ICE (Interactive Connectivity Establishment)
- Finds optimal network path between peers
- Uses STUN servers to find public IP
- Uses TURN servers as fallback
- Exchanges candidate addresses

### STUN Server
- Session Traversal Utilities for NAT
- Helps clients discover public IP address
- Minimal server resources required
- Free options available (Google's STUN)

### TURN Server
- Traversal Using Relays around NAT
- Relays media if direct connection impossible
- Required for many corporate networks
- More resource intensive

## Implementation

### 1. Initialize WebRTC

```typescript
interface RTCConfig {
  iceServers: [
    {
      urls: 'stun:stun.l.google.com:19302',
    },
    {
      urls: 'turn:your-turn-server.com',
      username: 'username',
      credential: 'password',
    },
  ],
}

const peerConnection = new RTCPeerConnection(RTCConfig);
```

### 2. Get User Media

```typescript
// Audio only
const audioStream = await navigator.mediaDevices.getUserMedia({
  audio: {
    echoCancellation: true,
    noiseSuppression: true,
    autoGainControl: true,
  },
});

// Video and audio
const mediaStream = await navigator.mediaDevices.getUserMedia({
  audio: true,
  video: {
    width: { ideal: 1280 },
    height: { ideal: 720 },
  },
});

// Add tracks to peer connection
mediaStream.getTracks().forEach((track) => {
  peerConnection.addTrack(track, mediaStream);
});
```

### 3. Create Offer (Caller)

```typescript
// Only the caller creates an offer
const offer = await peerConnection.createOffer();
await peerConnection.setLocalDescription(offer);

// Send offer to peer via signaling server
socket.emit('call-offer', {
  to: recipientUserId,
  offer: offer,
});
```

### 4. Handle Offer (Callee)

```typescript
socket.on('call-offer', async (data) => {
  const { offer } = data;

  // Set remote description
  await peerConnection.setRemoteDescription(
    new RTCSessionDescription(offer)
  );

  // Create answer
  const answer = await peerConnection.createAnswer();
  await peerConnection.setLocalDescription(answer);

  // Send answer back
  socket.emit('call-answer', {
    to: data.from,
    answer: answer,
  });
});
```

### 5. Exchange ICE Candidates

```typescript
// When local ICE candidate is generated
peerConnection.onicecandidate = (event) => {
  if (event.candidate) {
    socket.emit('ice-candidate', {
      to: recipientUserId,
      candidate: event.candidate,
    });
  }
};

// Receive ICE candidate
socket.on('ice-candidate', async (data) => {
  const { candidate } = data;
  try {
    await peerConnection.addIceCandidate(
      new RTCIceCandidate(candidate)
    );
  } catch (error) {
    console.error('Error adding ICE candidate:', error);
  }
});
```

### 6. Handle Remote Stream

```typescript
peerConnection.ontrack = (event) => {
  const remoteStream = event.streams[0];

  if (remoteVideo) {
    remoteVideo.srcObject = remoteStream;
  }

  // Update voice analysis with remote stream
  analyzeRemoteVoice(remoteStream);
};

peerConnection.onconnectionstatechange = () => {
  console.log('Connection state:', peerConnection.connectionState);

  if (peerConnection.connectionState === 'connected') {
    console.log('✅ Peer-to-peer connection established');
  } else if (peerConnection.connectionState === 'failed') {
    console.log('❌ Connection failed');
    // Attempt to reconnect or end call
  }
};
```

## Call Flow Diagram

```
Initiator                                               Receiver
    │                                                      │
    │                                                      │
    │──────── Request to call ─────────────────────────────>│
    │                                                      │
    │                                          Show incoming call
    │<───── Call accepted ──────────────────────────────────│
    │                                                      │
    │──────── Create Offer ──────────────────────────────────>│
    │                                                      │
    │<───── Create Answer ──────────────────────────────────│
    │                                                      │
    │──────── ICE Candidates ──────────────────────────────>│
    │<───── ICE Candidates ──────────────────────────────────│
    │                                                      │
    │              Peer Connection Established               │
    │                                                      │
    ├─────> Stream Data <────────────────────────────────┤
    │                                                      │
    │         Audio/Video Call Active                      │
    │         Voice Analysis Running                       │
    │                                                      │
    │                                                      │
    │──────── Call End ──────────────────────────────────────>│
    │                                                      │
    │              Connection Closed                       │
    │                                                      │
```

## Error Handling

### Common Errors

```typescript
// Microphone/camera not found
try {
  const stream = await navigator.mediaDevices.getUserMedia({
    audio: true,
    video: true,
  });
} catch (error) {
  if (error.name === 'NotFoundError') {
    console.error('Camera/microphone not found');
  } else if (error.name === 'NotAllowedError') {
    console.error('Permission denied');
  } else if (error.name === 'NotReadableError') {
    console.error('Device already in use');
  }
}

// Connection failed
peerConnection.onconnectionstatechange = () => {
  if (peerConnection.connectionState === 'failed') {
    // Try to reconnect
    peerConnection.restartIce();
  }
};

// ICE candidate error
peerConnection.onicecandidate = (event) => {
  if (event.candidate === null && !event.complete) {
    console.log('ICE gathering error');
  }
};
```

## Performance Optimization

### Codec Selection

```typescript
const configuration = {
  iceServers: [...],
  sdpSemantics: 'unified-plan',
};

const peerConnection = new RTCPeerConnection(configuration);

// Prefer VP9 codec
const transceivers = peerConnection.getTransceivers();
transceivers.forEach((transceiver) => {
  const sender = transceiver.sender;
  if (sender && sender.track?.kind === 'video') {
    const params = sender.getParameters();
    if (!params.encodings) {
      params.encodings = [{}];
    }
    params.encodings[0].priority = 'high';
    sender.setParameters(params);
  }
});
```

### Bandwidth Limitation

```typescript
async function limitBandwidth(peerConnection, maxBitrate) {
  const stats = await peerConnection.getStats();
  stats.forEach((report) => {
    if (
      report.type === 'outbound-rtp' &&
      report.mediaType === 'video'
    ) {
      const params = report.getParameters?.();
      if (params?.encodings) {
        params.encodings[0].maxBitrate = maxBitrate;
        report.setParameters?.(params);
      }
    }
  });
}
```

## Public STUN Servers

```javascript
const stunServers = [
  'stun:stun.l.google.com:19302',
  'stun:stun1.l.google.com:19302',
  'stun:stun2.l.google.com:19302',
  'stun:stun3.l.google.com:19302',
  'stun:stun4.l.google.com:19302',
  'stun:stun.stunprotocol.org:3478',
  'stun:stun.voip.blackberry.com:3478',
];
```

## Browser Support

| Browser | Audio | Video | Notes |
|---------|-------|-------|-------|
| Chrome | ✅ | ✅ | Full support |
| Firefox | ✅ | ✅ | Full support |
| Safari | ✅ | ✅ | Limited TURN support |
| Edge | ✅ | ✅ | Full support |
| IE | ❌ | ❌ | Not supported |

## Testing

```typescript
// Check WebRTC support
const isWebRTCSupported = () => {
  const RTCPeerConnection =
    window.RTCPeerConnection ||
    (window as any).webkitRTCPeerConnection ||
    (window as any).mozRTCPeerConnection;
  return !!RTCPeerConnection;
};

// Monitor connection state
peerConnection.onconnectionstatechange = () => {
  console.log(`Connection state: ${peerConnection.connectionState}`);
  console.log(`ICE connection state: ${peerConnection.iceConnectionState}`);
  console.log(`ICE gathering state: ${peerConnection.iceGatheringState}`);
};

// Monitor stats
setInterval(async () => {
  const stats = await peerConnection.getStats();
  stats.forEach((report) => {
    console.log(`[${report.type}]`, report);
  });
}, 1000);
```

## Troubleshooting

### No Video/Audio
1. Check permissions granted
2. Verify getUserMedia constraints
3. Check if tracks are added to peer connection
4. Monitor console for errors

### Choppy Connection
1. Reduce video resolution
2. Limit bitrate
3. Check network bandwidth
4. Try different STUN/TURN servers

### Can't Connect
1. Check firewall settings
2. Verify TURN server credentials
3. Ensure signaling server is running
4. Check ICE candidates are exchanged

### Echo or Noise
1. Enable echo cancellation
2. Enable noise suppression
3. Adjust microphone input level
4. Check speaker volume

---

For detailed WebRTC implementation, refer to MDN Web Docs and the WebRTC specification.
