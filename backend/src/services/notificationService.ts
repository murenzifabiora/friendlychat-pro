import { Server as SocketIOServer } from 'socket.io';
import Notification, { NotificationType } from '../models/Notification';

let ioInstance: SocketIOServer | null = null;

// Map of userId → socketId (shared with socketService via this module)
let onlineUsersRef: Map<string, string> = new Map();

export const initNotificationService = (
  io: SocketIOServer,
  onlineUsers: Map<string, string>
) => {
  ioInstance = io;
  onlineUsersRef = onlineUsers;
};

interface CreateNotificationOptions {
  userId: string;       // recipient
  actorId: string;      // who triggered it
  type: NotificationType;
  storyId?: string;
  commentId?: string;
}

/**
 * Create a notification in the DB and push it to the recipient via socket if online.
 * Skips creating a notification when actor === recipient.
 */
export const createNotification = async (opts: CreateNotificationOptions) => {
  const { userId, actorId, type, storyId, commentId } = opts;

  // Don't notify yourself
  if (userId === actorId) return;

  try {
    const notification = await Notification.create({
      userId,
      actorId,
      type,
      storyId: storyId || undefined,
      commentId: commentId || undefined,
      read: false,
    });

    await notification.populate('actorId', 'username profile');
    if (storyId) await notification.populate('storyId', 'content');

    // Push real-time notification if recipient is online
    if (ioInstance) {
      const recipientSocketId = onlineUsersRef.get(userId);
      if (recipientSocketId) {
        ioInstance.to(recipientSocketId).emit('notification', notification);
      }
    }

    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
  }
};
