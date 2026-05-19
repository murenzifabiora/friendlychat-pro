# VoiceChat Pro - Backend API

Express.js server with Socket.io for real-time communication and MongoDB for data storage.

## 🚀 Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Configuration
Create a `.env` file in the backend directory:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/voicechat
JWT_SECRET=your_super_secret_jwt_key_change_in_production
CLIENT_URL=http://localhost:3000
NODE_ENV=development
```

### 3. Start Development Server
```bash
npm run dev
```

The server will run on `http://localhost:5000`

## 📁 Project Structure

- `src/server.ts` - Main application entry point
- `src/models/` - MongoDB schemas (User, Message, VoiceAnalysis)
- `src/routes/` - API endpoint handlers
- `src/controllers/` - Business logic
- `src/middleware/` - Authentication, validation
- `src/services/` - Core services
- `src/utils/` - Helper functions
- `uploads/` - File storage for media

## 🔌 WebSocket Events

### Incoming Events
- `message` - New chat message
- `voice-analysis` - Voice analysis data
- `call-initiate` - Initiate a call
- `call-answer` - Answer incoming call
- `call-end` - End call
- `user-status` - Update user status

### Outgoing Events
- `message` - Broadcast message
- `voice-analysis-result` - Broadcast voice analysis
- `incoming-call` - New call notification
- `call-answered` - Call accepted
- `call-ended` - Call finished
- `user-list` - Active users list

## 🗄️ Database Models

### User
```typescript
{
  username: string
  email: string
  password: string (hashed)
  profile: {
    avatar: string
    bio: string
    status: 'online' | 'offline' | 'away'
  }
  contacts: ObjectId[]
  createdAt: Date
}
```

### Message
```typescript
{
  sender: ObjectId
  recipient: ObjectId
  content: string
  type: 'text' | 'audio' | 'video' | 'note'
  mediaUrl?: string
  read: boolean
  timestamp: Date
}
```

### VoiceAnalysis
```typescript
{
  userId: ObjectId
  callDuration: number
  emotionalState: string
  confidence: number (0-1)
  detectedPatterns: string[]
  timestamp: Date
}
```

## 🔐 Authentication

Uses JWT tokens for authentication:
- Tokens included in request headers: `Authorization: Bearer <token>`
- Token expiration: 24 hours
- Refresh token support for extended sessions

## 📝 API Endpoints

(To be documented in API.md)

## 🛠️ Built With

- Express.js - Web framework
- Socket.io - Real-time communication
- MongoDB - NoSQL database
- Mongoose - ODM
- JWT - Authentication
- bcryptjs - Password hashing

## 📄 License

MIT
