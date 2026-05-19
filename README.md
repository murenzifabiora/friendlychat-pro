# VoiceChat Pro - Real-time Communication Platform

A modern web application for real-time online chatting with advanced voice analysis capabilities, video/audio calling, and multimedia sharing.

## 🎯 Features

### Communication
- **Real-time Text Chat**: Instant messaging with emoji support
- **Video Calling**: High-quality peer-to-peer video calls
- **Audio Calling**: Crystal-clear voice calls
- **Voice Notes**: Record and send audio messages
- **Video Messages**: Record and share video clips

### Voice Analysis
- **Lie Detection**: AI-powered voice pattern analysis
- **Emotional State**: Detect happiness, sadness, anger, stress
- **Fatigue Detection**: Identify when someone is tired or sleeping
- **Voice Quality**: Monitor connection and audio quality
- **Stress Levels**: Real-time stress detection

### User Experience
- **User Profiles**: Customize your profile with avatar and bio
- **Contact Management**: Add/remove friends and contacts
- **Online Status**: See who's available to chat
- **Notification System**: Get notified of messages and calls
- **Dark/Light Mode**: Choose your preferred theme

## 🛠 Tech Stack

### Frontend
- React 18+
- TypeScript
- Tailwind CSS
- Socket.io Client
- WebRTC
- TensorFlow.js (voice analysis)

### Backend
- Node.js
- Express.js
- Socket.io
- WebRTC Signaling
- MongoDB/Mongoose
- JWT Authentication

### DevOps
- Docker (optional)
- Environment Configuration

## 📦 Project Structure

```
E-learning/
├── backend/                 # Express API & WebSocket server
│   ├── src/
│   │   ├── routes/         # API endpoints
│   │   ├── models/         # Database schemas
│   │   ├── controllers/    # Request handlers
│   │   ├── middleware/     # Auth, validation, etc.
│   │   ├── services/       # Business logic
│   │   └── utils/          # Helpers & utilities
│   ├── package.json
│   └── README.md
├── frontend/                # React web application
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── pages/          # Page components
│   │   ├── hooks/          # Custom React hooks
│   │   ├── services/       # API & WebSocket clients
│   │   ├── utils/          # Utilities
│   │   ├── styles/         # Tailwind CSS
│   │   └── App.tsx
│   ├── public/
│   ├── package.json
│   └── README.md
├── shared/                  # Shared types & constants
│   ├── types.ts
│   └── constants.ts
├── docs/                    # Documentation
└── .github/                # GitHub config
```

## 🚀 Quick Start

### Prerequisites
- Node.js 16+ and npm/yarn
- MongoDB (local or Atlas)
- Git

### Backend Setup
```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

### Frontend Setup
```bash
cd frontend
npm install
npm start
```

Visit `http://localhost:3000` in your browser.

## 📝 Configuration

Create `.env` files in both `backend/` and `frontend/` directories:

**Backend .env:**
```
PORT=5000
MONGODB_URI=mongodb://localhost:27017/voicechat
JWT_SECRET=your_jwt_secret
NODE_ENV=development
```

**Frontend .env:**
```
REACT_APP_API_URL=http://localhost:5000
REACT_APP_WS_URL=ws://localhost:5000
```

## 🔐 Authentication

The platform uses JWT tokens for secure authentication:
- Register new accounts
- Login with credentials
- Automatic token refresh
- Secure WebSocket connections

## 📞 API Documentation

See [backend/API.md](backend/API.md) for complete API documentation.

## 🎨 Voice Analysis Details

The voice analysis system uses:
- Web Audio API for voice capture
- TensorFlow.js models for ML inference
- Pattern matching for deception detection
- Prosody analysis for emotional detection

## 🐛 Troubleshooting

### Microphone not working
- Check browser permissions
- Ensure HTTPS in production
- Test with different browsers

### Connection issues
- Verify MongoDB is running
- Check firewall settings
- Review socket.io configuration

## 📄 License

MIT License - See LICENSE file

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📧 Support

For issues and questions, please open an issue on GitHub.
