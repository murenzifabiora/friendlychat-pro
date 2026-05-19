import { Server as SocketIOServer, Socket } from 'socket.io';
import User from '../models/User';
import { initNotificationService } from './notificationService';

// Shared map of userId → socketId, exported so notificationService can use it
export const onlineUsers: Map<string, string> = new Map();

export const setupSocketHandlers = (io: SocketIOServer) => {
  // Wire up the notification service so it can push real-time events
  initNotificationService(io, onlineUsers);

  io.on('connection', (socket: Socket) => {
    console.log(`👤 User connected: ${socket.id}`);

    // User joins (authentication)
    socket.on('user-join', (userId: string) => {
      onlineUsers.set(userId, socket.id);
      socket.join(userId);

      // Update user status to online
      User.findByIdAndUpdate(userId, { 'profile.status': 'online' }).catch((err) =>
        console.error('Failed to update user status:', err)
      );

      // Broadcast online users list
      io.emit('users-list', Array.from(onlineUsers.keys()));
    });

    // Chat message
    socket.on('message', (data: any) => {
      const { recipientId, content, type } = data;

      const recipientSocketId = onlineUsers.get(recipientId);
      if (recipientSocketId) {
        io.to(recipientSocketId).emit('receive-message', {
          senderId: data.senderId,
          content,
          type,
          timestamp: new Date(),
        });
      }
    });

    // Call initiation (WebRTC signaling)
    socket.on('call-initiate', (data: any) => {
      const { calleeId, offer, type } = data;
      const calleeSocketId = onlineUsers.get(calleeId);

      if (calleeSocketId) {
        io.to(calleeSocketId).emit('incoming-call', {
          callerId: data.callerId,
          offer,
          type: type || 'audio',
          callerSocketId: socket.id,
        });
      }
    });

    socket.on('call-answer', (data: any) => {
      const { callerId, answer } = data;
      const callerSocketId = onlineUsers.get(callerId);

      if (callerSocketId) {
        io.to(callerSocketId).emit('call-answered', {
          answer,
          calleeSocketId: socket.id,
        });
      }
    });

    socket.on('ice-candidate', (data: any) => {
      const { targetUserId, candidate } = data;
      const targetSocketId = onlineUsers.get(targetUserId);

      if (targetSocketId) {
        io.to(targetSocketId).emit('ice-candidate', { candidate });
      }
    });

    socket.on('call-end', (data: any) => {
      const { recipientId } = data;
      const recipientSocketId = onlineUsers.get(recipientId);

      if (recipientSocketId) {
        io.to(recipientSocketId).emit('call-ended');
      }
    });

    // Voice analysis data
    socket.on('voice-analysis', (data: any) => {
      io.emit('voice-analysis-result', {
        userId: data.userId,
        analysis: data.analysis,
        timestamp: new Date(),
      });
    });

    // User status change
    socket.on('user-status', (data: any) => {
      const { userId, status } = data;
      User.findByIdAndUpdate(userId, { 'profile.status': status }).catch((err) =>
        console.error('Failed to update user status:', err)
      );
      io.emit('user-status-changed', { userId, status });
    });

    // Disconnect
    socket.on('disconnect', () => {
      let disconnectedUserId: string | undefined;
      for (const [userId, socketId] of onlineUsers.entries()) {
        if (socketId === socket.id) {
          disconnectedUserId = userId;
          onlineUsers.delete(userId);
          break;
        }
      }

      if (disconnectedUserId) {
        User.findByIdAndUpdate(disconnectedUserId, { 'profile.status': 'offline' }).catch(
          (err) => console.error('Failed to update user status:', err)
        );
        console.log(`👤 User disconnected: ${socket.id}`);
        io.emit('users-list', Array.from(onlineUsers.keys()));
      }
    });
  });
};
