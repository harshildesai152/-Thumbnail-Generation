'use client';

import { useState, useMemo, useCallback } from 'react';
import { useAtom } from 'jotai';
import { ListFilter, Clock, Loader2, CheckCircle2, XCircle, LayoutGrid } from 'lucide-react';
import { Header } from '@/components/Header';
import { UploadZone } from '@/components/UploadZone';
import { JobCard } from '@/components/JobCard';
import { StatsCard } from '@/components/StatsCard';
import { FilterTabs } from '@/components/FilterTabs';
import { jobsAtom, jobStatsAtom } from '@/store/jobsStore';
import type { JobStatus } from '@/types';

export default function Dashboard() {
  const [jobs, setJobs] = useAtom(jobsAtom);
  const [stats] = useAtom(jobStatsAtom);
  const [activeFilter, setActiveFilter] = useState<'all' | JobStatus>('all');

  const filteredJobs = useMemo(() => {
    if (activeFilter === 'all') return jobs;
    return jobs.filter(job => job.status === activeFilter);
  }, [jobs, activeFilter]);

  const handleRetry = useCallback((id: string) => {
    setJobs(prev => prev.map(job => 
      job.id === id 
        ? { ...job, status: 'queued' as JobStatus, errorMessage: undefined, updatedAt: new Date() }
        : job
    ));
  }, [setJobs]);

  const handleDelete = useCallback((id: string) => {
    setJobs(prev => prev.filter(job => job.id !== id));
  }, [setJobs]);

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="container py-8">
        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <StatsCard
            label="Total Jobs"
            value={stats.total}
            icon={LayoutGrid}
            variant="default"
          />
          <StatsCard
            label="Queued"
            value={stats.queued}
            icon={Clock}
            variant="queued"
          />
          <StatsCard
            label="Processing"
            value={stats.processing}
            icon={Loader2}
            variant="processing"
          />
          <StatsCard
            label="Completed"
            value={stats.completed}
            icon={CheckCircle2}
            variant="completed"
          />
          <StatsCard
            label="Failed"
            value={stats.failed}
            icon={XCircle}
            variant="failed"
          />
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Upload Section */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <h2 className="text-lg font-semibold mb-4">Upload Files</h2>
              <UploadZone />
            </div>
          </div>

          {/* Jobs List */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Job Queue</h2>
              <div className="flex items-center gap-2 text-muted-foreground">
                <ListFilter className="w-4 h-4" />
                <span className="text-sm">Filter</span>
              </div>
            </div>

            <FilterTabs
              activeFilter={activeFilter}
              onFilterChange={setActiveFilter}
              counts={{
                all: stats.total,
                queued: stats.queued,
                processing: stats.processing,
                completed: stats.completed,
                failed: stats.failed,
              }}
            />

            <div className="mt-6 space-y-4">
              {filteredJobs.length === 0 ? (
                <div className="rounded-xl border bg-card p-12 text-center text-muted-foreground">
                  <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                    <LayoutGrid className="w-8 h-8 text-muted-foreground/50" />
                  </div>
                  <h3 className="text-lg font-medium mb-2 text-foreground">No jobs found</h3>
                  <p className="text-sm">
                    {activeFilter === 'all' 
                      ? 'Upload files to start generating thumbnails'
                      : `No ${activeFilter} jobs at the moment`
                    }
                  </p>
                </div>
              ) : (
                filteredJobs.map(job => (
                  <JobCard
                    key={job.id}
                    job={job}
                    onRetry={handleRetry}
                    onDelete={handleDelete}
                  />
                ))
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
