import mongoose, { Document, Schema } from 'mongoose';

export type JobStatus = 'pending' | 'queued' | 'processing' | 'completed' | 'failed';

export interface IJob extends Document {
  userId: mongoose.Types.ObjectId;
  originalFileName: string;
  originalFilePath: string;
  thumbnailFileName?: string;
  thumbnailFilePath?: string;
  fileType: 'image' | 'video';
  status: JobStatus;
  progress: number;
  errorMessage?: string;
  createdAt: Date;
  completedAt?: Date;
}

const jobSchema = new Schema<IJob>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  originalFileName: {
    type: String,
    required: true
  },
  originalFilePath: {
    type: String,
    required: true
  },
  thumbnailFileName: {
    type: String
  },
  thumbnailFilePath: {
    type: String
  },
  fileType: {
    type: String,
    enum: ['image', 'video'],
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'queued', 'processing', 'completed', 'failed'],
    default: 'pending'
  },
  progress: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  errorMessage: {
    type: String
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  completedAt: {
    type: Date
  }
});

export const Job = mongoose.model<IJob>('Job', jobSchema);
