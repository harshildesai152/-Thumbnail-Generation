import { useEffect, useCallback, useState } from 'react';
import { useAtom } from 'jotai';
import { jobsAtom } from '@/store/jobsStore';
import { api } from './api';
import { useSocket } from './useSocket';
import { ThumbnailJob, JobUpdate } from '@/types';
import Cookies from 'js-cookie';

export const useJobs = () => {
  const [jobs, setJobs] = useAtom(jobsAtom);
  const [userId, setUserId] = useState<string | null>(null);

  // Get user profile to extract userId
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const profile = await api.auth.getProfile();
        setUserId(profile.user._id);
      } catch (error) {
        console.error('Failed to fetch user profile:', error);
      }
    };

    fetchUserProfile();
  }, []);

  const { jobUpdates, clearJobUpdates } = useSocket(userId || undefined);

  // Fetch jobs from API
  const fetchJobs = useCallback(async () => {
    try {
      const response = await api.jobs.getUserJobs();
      const jobsData = response.jobs.map((job: any) => ({
        id: job._id,
        fileName: job.originalFileName,
        fileType: job.fileType,
        fileSize: 0, // You might want to add this to the backend response
        status: job.status,
        progress: job.progress || 0,
        thumbnailUrl: job.thumbnailFileName ? `/api/files/thumbnails/${job.thumbnailFileName}` : undefined,
        errorMessage: job.errorMessage,
        createdAt: new Date(job.createdAt),
        updatedAt: new Date(job.updatedAt || job.createdAt),
      }));
      setJobs(jobsData);
    } catch (error) {
      console.error('Failed to fetch jobs:', error);
    }
  }, [setJobs]);

  // Update job status based on socket events
  useEffect(() => {
    if (jobUpdates.length === 0) return;

    setJobs(prevJobs => {
      const updatedJobs = [...prevJobs];

      jobUpdates.forEach((update: JobUpdate) => {
        const jobIndex = updatedJobs.findIndex(job => job.id === update.jobId);
        if (jobIndex !== -1) {
          updatedJobs[jobIndex] = {
            ...updatedJobs[jobIndex],
            status: update.status,
            progress: update.progress,
            errorMessage: update.error,
            updatedAt: new Date(),
            thumbnailUrl: update.result?.thumbnailFileName
              ? `/api/files/thumbnails/${update.result.thumbnailFileName}`
              : updatedJobs[jobIndex].thumbnailUrl,
          };
        }
      });

      return updatedJobs;
    });

    // Clear processed updates
    clearJobUpdates();
  }, [jobUpdates, setJobs, clearJobUpdates]);

  // Load jobs on mount
  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  // Add new jobs after upload
  const addJobs = useCallback((newJobs: any[]) => {
    const formattedJobs: ThumbnailJob[] = newJobs.map(job => ({
      id: job.id,
      fileName: job.originalFileName,
      fileType: job.fileType === 'image' ? 'image' : 'video',
      fileSize: 0, // You might want to get this from the file
      status: job.status as any,
      progress: job.progress || 0,
      createdAt: new Date(job.createdAt),
      updatedAt: new Date(job.createdAt),
      errorMessage: job.error,
    }));

    setJobs(prev => [...formattedJobs, ...prev]);
  }, [setJobs]);

  // Retry a failed job
  const retryJob = useCallback(async (jobId: string) => {
    // Update local state immediately
    setJobs(prev => prev.map(job =>
      job.id === jobId
        ? { ...job, status: 'queued' as const, errorMessage: undefined, updatedAt: new Date() }
        : job
    ));

    // TODO: Implement retry API call if needed
  }, [setJobs]);

  // Delete a job
  const deleteJob = useCallback(async (jobId: string) => {
    // Optimistic update
    setJobs(prev => prev.filter(job => job.id !== jobId));
    
    try {
      await api.jobs.deleteJob(jobId);
    } catch (error) {
       console.error('Failed to delete job:', error);
       // Revert on error (fetch jobs again)
       fetchJobs();
    }
  }, [setJobs, fetchJobs]);

  return {
    jobs,
    fetchJobs,
    addJobs,
    retryJob,
    deleteJob,
  };
};
