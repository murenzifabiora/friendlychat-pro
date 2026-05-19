# Getting Started with VoiceChat Pro

Welcome to VoiceChat Pro! This guide will help you get the application up and running.

## Prerequisites

Before you start, ensure you have:
- **Node.js** 16+ and npm/yarn installed
- **MongoDB** running locally or access to MongoDB Atlas
- **Git** for version control
- A modern web browser (Chrome, Firefox, Safari, or Edge)

## Quick Start

### Step 1: Clone and Navigate
```bash
cd E-learning
```

### Step 2: Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Create .env file with your configuration
# (already provided as .env in the backend folder)

# Start the development server
npm run dev
```

The backend will be available at `http://localhost:5000`

### Step 3: Frontend Setup

In a new terminal:

```bash
cd frontend

# Install dependencies
npm install

# Create .env.local file with your configuration
# (already provided as .env.local in the frontend folder)

# Start the development server
npm start
```

The frontend will be available at `http://localhost:3000`

### Step 4: MongoDB Setup

Option A - Local MongoDB:
```bash
# Make sure MongoDB is running
mongod
```

Option B - MongoDB Atlas (Cloud):
1. Create a MongoDB Atlas account
2. Create a cluster
3. Update `MONGODB_URI` in `backend/.env` with your connection string

## 🎯 Features Overview

### 1. Authentication
- Register new account
- Login with email/password
- JWT token management
- Automatic session handling

### 2. Real-time Chat
- Send text messages instantly
- View message history
- Read receipts
- Online status indicator

### 3. Voice/Video Calling
- Audio calling with WebRTC
- Video calling with real-time video stream
- Call controls (mute, hang up)
- Call history

### 4. Voice Analysis
The platform analyzes user voice during calls to detect:
- **Emotional State**: Happy, sad, angry, calm, stressed, tired, neutral
- **Fatigue Level**: Detect tiredness or sleep state
- **Deception Patterns**: Identify suspicious voice patterns
- **Voice Quality**: Monitor connection quality
- **Speech Rate**: Analyze speaking speed and patterns

### 5. Media Sharing
- Send audio notes
- Send video messages
- Share files and attachments
- Emoji support in messages

### 6. User Profiles
- Customize profile with avatar
- Add biography
- Manage contacts
- Update online status

## 📁 Project Structure

```
E-learning/
├── backend/
│   ├── src/
│   │   ├── server.ts           # Main server file
│   │   ├── models/             # Database schemas
│   │   ├── routes/             # API endpoints
│   │   ├── controllers/        # Business logic
│   │   ├── middleware/         # Auth & validation
│   │   ├── services/           # Core services
│   │   └── utils/              # Helper functions
│   ├── uploads/                # File storage
│   ├── package.json
│   ├── tsconfig.json
│   ├── .env                    # Configuration
│   └── README.md
│
├── frontend/
│   ├── src/
│   │   ├── components/         # React components
│   │   ├── pages/              # Page components
│   │   ├── hooks/              # Custom hooks
│   │   ├── services/           # API/Socket services
│   │   ├── utils/              # Utilities
│   │   ├── styles/             # CSS files
│   │   ├── App.tsx             # Main app component
│   │   └── index.tsx           # Entry point
│   ├── public/
│   ├── package.json
│   ├── tsconfig.json
│   ├── tailwind.config.js
│   ├── .env.local              # Configuration
│   └── README.md
│
├── shared/
│   ├── types.ts                # Shared TypeScript types
│   ├── constants.ts            # Shared constants
│   └── voiceAnalysis.ts        # Voice analysis utilities
│
├── docs/
├── .github/
└── README.md
```

## 🔧 Environment Variables

### Backend (.env)
```
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/voicechat
JWT_SECRET=your_secret_key
CLIENT_URL=http://localhost:3000
```

### Frontend (.env.local)
```
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_WS_URL=http://localhost:5000
```

## 🚀 Available Commands

### Backend
```bash
cd backend
npm run dev      # Start development server with hot reload
npm run build    # Build TypeScript
npm start        # Start production server
npm run watch    # Watch for TypeScript changes
```

### Frontend
```bash
cd frontend
npm start        # Start development server
npm run build    # Build for production
npm test         # Run tests
npm run eject    # Eject from create-react-app
```

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/logout` - Logout user

### Users
- `GET /api/users/profile` - Get current user profile
- `PUT /api/users/profile` - Update profile
- `GET /api/users/contacts` - Get user contacts
- `POST /api/users/contacts/:id` - Add contact
- `DELETE /api/users/contacts/:id` - Remove contact
- `GET /api/users/search?q=query` - Search users

### Messages
- `GET /api/messages/:userId` - Get messages with user
- `POST /api/messages` - Send message
- `POST /api/messages/upload` - Upload media

### Voice Analysis
- `POST /api/voice-analysis` - Analyze voice data
- `GET /api/voice-analysis/history` - Get analysis history

## 🎮 WebSocket Events

### Client → Server
- `message` - Send chat message
- `voice-analysis` - Send voice analysis data
- `call-initiate` - Start a call
- `call-answer` - Answer incoming call
- `call-end` - End call
- `user-status` - Update user status

### Server → Client
- `message` - New message received
- `voice-analysis-result` - Voice analysis complete
- `incoming-call` - Incoming call notification
- `call-answered` - Call accepted
- `call-ended` - Call finished
- `user-list` - Update user list

## 🐛 Troubleshooting

### Microphone/Camera not working
1. Check browser permissions
2. Ensure HTTPS in production
3. Test in different browser
4. Check browser console for errors

### Connection issues
1. Verify MongoDB is running
2. Check backend is running on port 5000
3. Check firewall settings
4. Review `.env` configuration

### Build errors
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Port already in use
```bash
# Change PORT in backend/.env or use different port
# For frontend, create .env.local with:
# PORT=3001
```

## 📚 Additional Resources

- [React Documentation](https://react.dev)
- [Express.js Documentation](https://expressjs.com)
- [Socket.io Documentation](https://socket.io/docs/)
- [WebRTC Documentation](https://developer.mozilla.org/en-US/docs/Web/API/WebRTC_API)
- [MongoDB Documentation](https://docs.mongodb.com)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit a pull request

## 📄 License

MIT License

## 💡 Support

For issues or questions:
1. Check the troubleshooting section
2. Review the README.md files in backend/ and frontend/
3. Check browser console and backend logs
4. Open an issue with details

---

Happy chatting! 🎉
