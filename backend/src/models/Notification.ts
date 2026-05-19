import mongoose, { Schema, Document } from 'mongoose';

export type NotificationType = 'like' | 'comment' | 'mention' | 'follow';

export interface INotification extends Document {
  userId: mongoose.Schema.Types.ObjectId;   // recipient
  actorId: mongoose.Schema.Types.ObjectId;  // who triggered it
  type: NotificationType;
  storyId?: mongoose.Schema.Types.ObjectId;
  commentId?: mongoose.Schema.Types.ObjectId;
  read: boolean;
  createdAt: Date;
}

const notificationSchema = new Schema<INotification>(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    actorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    type: {
      type: String,
      enum: ['like', 'comment', 'mention', 'follow'],
      required: true,
    },
    storyId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Story',
    },
    commentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Comment',
    },
    read: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export default mongoose.model<INotification>('Notification', notificationSchema);
