import { cn } from '@/lib/utils';
import type { JobStatus } from '@/types';

interface StatusBadgeProps {
  status: JobStatus;
}

const styles = {
  queued: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20',
  processing: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
  completed: 'bg-green-500/10 text-green-500 border-green-500/20',
  failed: 'bg-red-500/10 text-red-500 border-red-500/20',
};

const labels = {
  queued: 'Queued',
  processing: 'Processing',
  completed: 'Completed',
  failed: 'Failed',
};

export function StatusBadge({ status }: StatusBadgeProps) {
  return (
    <div className={cn(
      'px-2.5 py-0.5 rounded-full text-xs font-medium border',
      styles[status]
    )}>
      {labels[status]}
    </div>
  );
}
