import mongoose, { Schema, Document } from 'mongoose';

export interface IFollow extends Document {
  followerId: mongoose.Schema.Types.ObjectId;
  followingId: mongoose.Schema.Types.ObjectId;
  createdAt: Date;
}

const followSchema = new Schema<IFollow>(
  {
    followerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    followingId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

// Ensure unique follow relationships
followSchema.index({ followerId: 1, followingId: 1 }, { unique: true });

export default mongoose.model<IFollow>('Follow', followSchema);
