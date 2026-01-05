export type JobStatus = 'queued' | 'processing' | 'completed' | 'failed';

export interface ThumbnailJob {
  id: string;
  fileName: string;
  fileType: 'image' | 'video';
  fileSize: number;
  status: JobStatus;
  progress?: number;
  thumbnailUrl?: string; // For completed jobs
  errorMessage?: string; // For failed jobs
  createdAt: Date;
  updatedAt: Date;
}

export interface UploadFile {
  id: string;
  file: File;
  progress: number;
  status: 'uploading' | 'completed' | 'error';
}

export interface JobStats {
  total: number;
  queued: number;
  processing: number;
  completed: number;
  failed: number;
}
