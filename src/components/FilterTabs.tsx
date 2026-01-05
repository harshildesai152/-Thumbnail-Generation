import { cn } from '@/lib/utils';
import type { JobStatus } from '@/types';

interface FilterTabsProps {
  activeFilter: 'all' | JobStatus;
  onFilterChange: (filter: 'all' | JobStatus) => void;
  counts: {
    all: number;
    queued: number;
    processing: number;
    completed: number;
    failed: number;
  };
}

const tabs = [
  { id: 'all' as const, label: 'All' },
  { id: 'queued' as const, label: 'Queued' },
  { id: 'processing' as const, label: 'Processing' },
  { id: 'completed' as const, label: 'Completed' },
  { id: 'failed' as const, label: 'Failed' },
];

export function FilterTabs({ activeFilter, onFilterChange, counts }: FilterTabsProps) {
  return (
    <div className="flex items-center gap-1 p-1 bg-muted/50 rounded-lg overflow-x-auto">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onFilterChange(tab.id)}
          className={cn(
            'px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200 whitespace-nowrap',
            'flex items-center gap-2',
            activeFilter === tab.id
              ? 'bg-background text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
          )}
        >
          {tab.label}
          <span className={cn(
            'text-xs font-mono tabular-nums px-1.5 py-0.5 rounded',
            activeFilter === tab.id
              ? 'bg-muted text-foreground'
              : 'bg-muted/50 text-muted-foreground'
          )}>
            {counts[tab.id]}
          </span>
        </button>
      ))}
    </div>
  );
}
