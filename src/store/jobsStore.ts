import { atom } from 'jotai';
import type { ThumbnailJob, UploadFile, JobStats, JobUpdate } from '@/types';

export const jobsAtom = atom<ThumbnailJob[]>([]);
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
