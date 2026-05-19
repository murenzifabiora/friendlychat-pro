# VoiceChat Pro - Frontend

React-based web application for real-time chatting and communication.

## 🚀 Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Configuration
Create a `.env.local` file in the frontend directory:

```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_WS_URL=http://localhost:5000
```

### 3. Start Development Server
```bash
npm start
```

The application will run on `http://localhost:3000`

## 📁 Project Structure

- `src/components/` - Reusable React components
- `src/pages/` - Page-level components (Login, Chat, Call, Profile)
- `src/hooks/` - Custom React hooks (useMedia, etc.)
- `src/services/` - API and WebSocket services
- `src/utils/` - Utility functions
- `src/styles/` - Tailwind CSS and custom styles
- `public/` - Static assets

## 🎨 Pages

### Login Page
- User registration and authentication
- JWT token management
- Redirect to chat on successful login

### Chat Page
- Real-time messaging
- Contact list
- Message history
- Quick call access

### Call Page
- Audio/Video calling setup
- Media stream management
- Call controls

### Profile Page
- User profile management
- Avatar and bio editing
- Contact management

## 🔧 Features

### Real-time Communication
- Socket.io for instant messaging
- WebRTC for peer-to-peer calls
- Automatic reconnection handling

### Voice Analysis
- Audio capture and processing
- Real-time analysis of emotional state
- Deception detection
- Voice quality monitoring

### Media Sharing
- Audio notes recording
- Video message recording
- File upload support
- Emoji picker integration

## 📦 Dependencies

- **react** - UI library
- **react-router-dom** - Routing
- **socket.io-client** - Real-time communication
- **axios** - HTTP client
- **tailwindcss** - CSS framework
- **simple-peer** - WebRTC wrapper
- **@tensorflow/tfjs** - ML framework for voice analysis

## 🛠️ Available Scripts

- `npm start` - Start development server
- `npm build` - Build for production
- `npm test` - Run tests
- `npm eject` - Eject from create-react-app

## 🔐 Security

- JWT authentication tokens
- Secure WebSocket connections
- CORS configuration
- Environment variable protection

## 📄 License

MIT
