import mongoose, { Schema, Document } from 'mongoose';

export interface IVoiceAnalysis extends Document {
  userId: mongoose.Schema.Types.ObjectId;
  callDuration: number;
  emotionalState: string;
  confidence: number;
  detectedPatterns: string[];
  timestamp: Date;
  notes?: string;
}

const voiceAnalysisSchema = new Schema<IVoiceAnalysis>(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    callDuration: {
      type: Number,
      required: true,
    },
    emotionalState: {
      type: String,
      enum: ['happy', 'sad', 'angry', 'calm', 'stressed', 'tired', 'neutral'],
      required: true,
    },
    confidence: {
      type: Number,
      min: 0,
      max: 1,
      required: true,
    },
    detectedPatterns: [String],
    notes: String,
  },
  { timestamps: true }
);

export default mongoose.model<IVoiceAnalysis>('VoiceAnalysis', voiceAnalysisSchema);
