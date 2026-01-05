import { atom } from 'jotai';
import type { ThumbnailJob, UploadFile, JobStats } from '@/types';

// Mock initial data
const initialJobs: ThumbnailJob[] = [
  {
    id: '1',
    fileName: 'vacation-photo.jpg',
    fileType: 'image',
    fileSize: 2500000,
    status: 'completed',
    thumbnailUrl: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=128&h=128&fit=crop',
    createdAt: new Date(Date.now() - 1000 * 60 * 30), // 30 mins ago
    updatedAt: new Date(Date.now() - 1000 * 60 * 29),
  },
  {
    id: '2',
    fileName: 'product-demo.mp4',
    fileType: 'video',
    fileSize: 45000000,
    status: 'processing',
    progress: 45,
    createdAt: new Date(Date.now() - 1000 * 60 * 5), // 5 mins ago
    updatedAt: new Date(Date.now()),
  },
  {
    id: '3',
    fileName: 'team-photo.png',
    fileType: 'image',
    fileSize: 1200000,
    status: 'queued',
    createdAt: new Date(Date.now() - 1000 * 30), // 30 secs ago
    updatedAt: new Date(Date.now() - 1000 * 30),
  },
];

export const jobsAtom = atom<ThumbnailJob[]>(initialJobs);
export const uploadingFilesAtom = atom<UploadFile[]>([]);

export const jobStatsAtom = atom<JobStats>((get) => {
  const jobs = get(jobsAtom);
  return {
    total: jobs.length,
    queued: jobs.filter((j) => j.status === 'queued').length,
    processing: jobs.filter((j) => j.status === 'processing').length,
    completed: jobs.filter((j) => j.status === 'completed').length,
    failed: jobs.filter((j) => j.status === 'failed').length,
  };
});
