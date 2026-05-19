import mongoose, { Schema, Document } from 'mongoose';

export interface IStory extends Document {
  userId: mongoose.Schema.Types.ObjectId;
  content: string;
  image?: string;
  visibility: 'public' | 'followers' | 'private';
  likes: mongoose.Schema.Types.ObjectId[];
  comments: mongoose.Schema.Types.ObjectId[];
  hashtags: string[];
  mentions: mongoose.Schema.Types.ObjectId[];
  createdAt: Date;
  expiresAt: Date;
}

const storySchema = new Schema<IStory>(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    content: {
      type: String,
      required: true,
      maxlength: 500,
    },
    image: String,
    visibility: {
      type: String,
      enum: ['public', 'followers', 'private'],
      default: 'public',
    },
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    comments: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Comment',
      },
    ],
    hashtags: [
      {
        type: String,
        lowercase: true,
        trim: true,
      },
    ],
    mentions: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      index: { expireAfterSeconds: 0 },
    },
  },
  { timestamps: true }
);

// Text index for full-text search on content and hashtags
storySchema.index({ content: 'text', hashtags: 'text' });
// Index for hashtag filtering
storySchema.index({ hashtags: 1 });

export default mongoose.model<IStory>('Story', storySchema);
