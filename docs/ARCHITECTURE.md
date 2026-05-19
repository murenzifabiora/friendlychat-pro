# Architecture Overview

## System Architecture

VoiceChat Pro uses a modern full-stack architecture with real-time communication capabilities.

```
┌─────────────────────────────────────────────────────────────────┐
│                         Client Layer (Frontend)                  │
│                                                                   │
│  ┌──────────────────┐  ┌──────────────────┐  ┌───────────────┐ │
│  │   React App      │  │  WebRTC Peer     │  │  Socket.io    │ │
│  │  (Components)    │  │  Connection      │  │  Client       │ │
│  └──────────────────┘  └──────────────────┘  └───────────────┘ │
│          │                      │                      │         │
│          └──────────────────────┴──────────────────────┘         │
│                          HTTP/WS                                 │
└─────────────────────────────────────────────────────────────────┘
                              │
                    ┌─────────┴─────────┐
                    │                   │
                    ▼                   ▼
         ┌─────────────────┐  ┌─────────────────┐
         │  HTTP Requests  │  │ WebSocket Conn  │
         │  (REST API)     │  │ (Real-time)     │
         └─────────────────┘  └─────────────────┘
                    │                   │
                    └─────────┬─────────┘
                              │
┌─────────────────────────────────────────────────────────────────┐
│                   Application Layer (Backend)                    │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │              Express.js Server                            │  │
│  │                                                            │  │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐   │  │
│  │  │   Routes     │  │ Controllers  │  │ Middleware   │   │  │
│  │  └──────────────┘  └──────────────┘  └──────────────┘   │  │
│  │                                                            │  │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐   │  │
│  │  │  Services    │  │   Utilities  │  │ Voice Anal.  │   │  │
│  │  └──────────────┘  └──────────────┘  └──────────────┘   │  │
│  └──────────────────────────────────────────────────────────┘  │
│                            │                                    │
│              ┌─────────────┼─────────────┐                      │
│              │                           │                      │
│  ┌───────────▼──────────┐   ┌───────────▼────────────┐         │
│  │  Socket.io Server    │   │  Authentication (JWT)  │         │
│  │  (Real-time Events)  │   │  (Token Validation)    │         │
│  └──────────────────────┘   └────────────────────────┘         │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
                              │
              ┌───────────────┼───────────────┐
              │               │               │
              ▼               ▼               ▼
        ┌──────────┐   ┌──────────┐   ┌──────────────┐
        │ MongoDB  │   │  File    │   │ WebRTC      │
        │ Database │   │ Storage  │   │ Signaling   │
        └──────────┘   └──────────┘   └──────────────┘
```

## Component Hierarchy

### Backend Services

```
Server (Express + Socket.io)
├── Authentication Middleware
├── Routes
│   ├── /api/auth - Authentication
│   ├── /api/users - User Management
│   ├── /api/messages - Messaging
│   └── /api/voice-analysis - Voice Analysis
├── Controllers
│   ├── authController
│   ├── userController
│   ├── messageController
│   └── voiceAnalysisController
├── Models
│   ├── User
│   ├── Message
│   └── VoiceAnalysis
└── Services
    ├── voiceAnalysisService
    └── notificationService
```

### Frontend Components

```
App
├── LoginPage
├── ChatPage
│   ├── Sidebar (Contacts)
│   ├── ChatArea
│   │   ├── ChatHeader
│   │   ├── MessageList
│   │   └── InputArea
│   └── Controls
├── CallPage
│   ├── VideoPreview
│   ├── CallControls
│   └── VoiceAnalysisPanel
└── ProfilePage
    ├── ProfileInfo
    ├── EditForm
    └── ContactsList
```

## Data Flow

### Chat Message Flow

1. **User sends message** → Frontend
2. **API Call** → `POST /api/messages`
3. **Backend validates** and stores in MongoDB
4. **Socket.io emit** → All connected clients
5. **Frontend receives** and updates UI

### Voice Call Flow

1. **User initiates call** → Sends `call-initiate` event
2. **Server broadcasts** → `incoming-call` to recipient
3. **Recipient accepts** → Sends `call-answer` event
4. **WebRTC connection** → Peer-to-peer connection established
5. **Audio/Video stream** → Direct P2P transmission
6. **Voice analysis** → Real-time analysis of voice
7. **Results broadcast** → Send analysis to clients

### Voice Analysis Flow

1. **Audio captured** from microphone
2. **Audio context created** for processing
3. **Frequency analysis** performed
4. **Features extracted**:
   - Pitch detection
   - Energy levels
   - Speech rate
   - Voice stability
5. **Emotional state determined** based on features
6. **Patterns detected**:
   - Deception indicators
   - Fatigue signals
   - Stress patterns
7. **Results sent** to server
8. **Results stored** in MongoDB
9. **Results displayed** in UI

## Technology Stack Details

### Frontend Stack
- **React 18** - UI rendering with hooks
- **TypeScript** - Type safety
- **Socket.io Client** - Real-time communication
- **Axios** - HTTP client
- **Tailwind CSS** - Styling
- **Simple-Peer** - WebRTC abstraction
- **TensorFlow.js** - ML inference (optional)

### Backend Stack
- **Node.js** - Runtime
- **Express.js** - Web framework
- **Socket.io** - WebSocket server
- **MongoDB** - NoSQL database
- **Mongoose** - ODM
- **JWT** - Authentication
- **bcryptjs** - Password hashing

## Security Architecture

### Authentication Flow

```
┌──────────────┐
│    Client    │
└──────────────┘
       │
       │ POST /auth/login (email, password)
       ▼
┌──────────────────────────────┐
│    Backend - Auth Route      │
├──────────────────────────────┤
│ 1. Validate input            │
│ 2. Find user in DB           │
│ 3. Compare password hash     │
│ 4. Generate JWT token        │
│ 5. Return token              │
└──────────────────────────────┘
       │
       │ Return token
       ▼
┌──────────────────────────────┐
│    Client - Store Token      │
│    localStorage.token        │
└──────────────────────────────┘
       │
       │ Include token in headers
       │ Authorization: Bearer {token}
       ▼
┌──────────────────────────────┐
│    Backend - JWT Middleware  │
├──────────────────────────────┤
│ 1. Extract token             │
│ 2. Verify signature          │
│ 3. Validate expiration       │
│ 4. Attach user to request    │
└──────────────────────────────┘
       │
       │ Continue to route handler
       ▼
┌──────────────────────────────┐
│    Protected Route Handler   │
│    (Has user context)        │
└──────────────────────────────┘
```

### WebSocket Security

- JWT authentication on connection
- Token validation before any event handling
- User ID attached to all messages
- Rate limiting on events (to be implemented)
- Input validation and sanitization

## Scalability Considerations

### Current Architecture
- Single Node.js server
- MongoDB database
- Local file storage
- Direct P2P for calls

### Future Enhancements
- Load balancer (nginx)
- Multiple backend instances
- Redis for session storage
- CDN for media files
- Message queue (RabbitMQ) for scalability
- Microservices architecture
- Database replication/sharding

## Error Handling

### Frontend Error Handling
```typescript
try {
  // API call
} catch (error) {
  // Show user-friendly error message
  // Log to error tracking service
  // Retry mechanism if applicable
}
```

### Backend Error Handling
```typescript
try {
  // Process request
} catch (error) {
  // Log error
  // Send appropriate HTTP status
  // Return error response to client
}
```

## Performance Optimization

- JWT tokens reduce database queries
- WebRTC P2P reduces server bandwidth
- Lazy loading of components
- Efficient re-renders with React hooks
- Message pagination
- Indexed MongoDB queries

---

This architecture provides a foundation for a scalable, real-time communication platform with voice analysis capabilities.
