import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface StatsCardProps {
  label: string;
  value: number;
  icon: LucideIcon;
  variant: 'default' | 'queued' | 'processing' | 'completed' | 'failed';
}

const variantStyles = {
  default: 'text-foreground',
  queued: 'text-yellow-500',
  processing: 'text-blue-500',
  completed: 'text-green-500',
  failed: 'text-red-500',
};

const bgStyles = {
  default: 'bg-muted',
  queued: 'bg-yellow-500/10',
  processing: 'bg-blue-500/10',
  completed: 'bg-green-500/10',
  failed: 'bg-red-500/10',
};

export function StatsCard({ label, value, icon: Icon, variant }: StatsCardProps) {
  return (
    <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-4">
      <div className="flex items-center gap-3">
        <div className={cn(
          'w-10 h-10 rounded-lg flex items-center justify-center',
          bgStyles[variant]
        )}>
          <Icon className={cn('w-5 h-5', variantStyles[variant])} />
        </div>
        <div>
          <p className="text-2xl font-semibold tabular-nums">{value}</p>
          <p className="text-xs text-muted-foreground">{label}</p>
        </div>
      </div>
    </div>
  );
}
