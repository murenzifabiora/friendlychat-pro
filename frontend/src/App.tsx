import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './styles/index.css';
import ChatPage from './pages/ChatPage';
import CallPage from './pages/CallPage';
import ProfilePage from './pages/ProfilePage';
import LoginPage from './pages/LoginPage';
import FeedPage from './pages/FeedPage';
import UserProfileView from './components/UserProfileView';
import { NotificationProvider } from './context/NotificationContext';

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    const token = localStorage.getItem('token');
    setIsAuthenticated(!!token);
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-secondary">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <Router>
      <NotificationProvider>
        <Routes>
          <Route
            path="/login"
            element={isAuthenticated ? <Navigate to="/chat" /> : <LoginPage onLogin={() => setIsAuthenticated(true)} />}
          />
          <Route
            path="/chat"
            element={isAuthenticated ? <ChatPage /> : <Navigate to="/login" />}
          />
          <Route
            path="/call"
            element={isAuthenticated ? <CallPage /> : <Navigate to="/login" />}
          />
          <Route
            path="/profile"
            element={isAuthenticated ? <ProfilePage /> : <Navigate to="/login" />}
          />
          <Route
            path="/feed"
            element={isAuthenticated ? <FeedPage /> : <Navigate to="/login" />}
          />
          <Route
            path="/user/:userId"
            element={isAuthenticated ? <UserProfileView /> : <Navigate to="/login" />}
          />
          <Route path="/" element={isAuthenticated ? <Navigate to="/chat" /> : <Navigate to="/login" />} />
        </Routes>
      </NotificationProvider>
    </Router>
  );
};

export default App;
