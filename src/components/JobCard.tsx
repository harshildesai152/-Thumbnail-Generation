
import { Image, Video, Download, Eye, RefreshCw, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/StatusBadge';
import type { ThumbnailJob } from '@/types';
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog";

interface JobCardProps {
  job: ThumbnailJob;
  onRetry?: (id: string) => void;
  onDelete?: (id: string) => void;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatTimeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return 'Just now';
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  return `${Math.floor(seconds / 86400)}d ago`;
}

export function JobCard({ job, onRetry, onDelete }: JobCardProps) {
  const FileIcon = job.fileType === 'video' ? Video : Image;

  return (
    <div className="rounded-xl border bg-card text-card-foreground shadow-sm animate-fade-in group hover:shadow-md transition-shadow">
      <div className="p-4">
        <div className="flex items-start gap-4">
          {/* Thumbnail or placeholder */}
          <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-muted flex-shrink-0 border border-border">
            {job.status === 'completed' && job.thumbnailUrl ? (
              <img
                src={job.thumbnailUrl}
                alt={job.fileName}
                className="w-full h-full object-cover"
              />
            ) : job.status === 'processing' ? (
              <div className="w-full h-full flex items-center justify-center">
                <div className="relative">
                  <FileIcon className="w-8 h-8 text-muted-foreground/50" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-12 h-12 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                  </div>
                </div>
              </div>
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <FileIcon className="w-8 h-8 text-muted-foreground/50" />
              </div>
            )}
            
            {/* File type indicator */}
            <div className="absolute bottom-1 right-1 w-5 h-5 rounded bg-background/80 backdrop-blur flex items-center justify-center border border-border">
              <FileIcon className="w-3 h-3 text-foreground" />
            </div>
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <h3 className="text-sm font-medium truncate" title={job.fileName}>
                  {job.fileName}
                </h3>
                <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                  <span className="font-mono">{formatFileSize(job.fileSize)}</span>
                  <span>•</span>
                  <span suppressHydrationWarning>{formatTimeAgo(job.createdAt)}</span>
                </div>
              </div>
              <StatusBadge status={job.status} />
            </div>

            {/* Progress bar for processing */}
            {job.status === 'processing' && job.progress !== undefined && (
              <div className="mt-3">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="text-muted-foreground">Processing...</span>
                  <span className="text-blue-500 font-mono">{job.progress}%</span>
                </div>
                <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500 transition-all duration-300 rounded-full animate-shimmer"
                    style={{ width: `${job.progress}%` }}
                  />
                </div>
              </div>
            )}

            {/* Error message */}
            {job.status === 'failed' && job.errorMessage && (
              <p className="mt-2 text-xs text-red-500">
                {job.errorMessage}
              </p>
            )}

            {/* Actions */}
            <div className="flex items-center gap-2 mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
              {job.status === 'completed' && (
                <>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm" className="h-8 text-xs bg-background/50 backdrop-blur-sm">
                        <Eye className="w-3.5 h-3.5 mr-2" />
                        View
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl bg-card/95 backdrop-blur-xl border-border/50 p-0 overflow-hidden gap-0">
                      {/* Header */}
                      <div className="flex items-center justify-between p-4 border-b border-border/50">
                        <div className="flex items-center gap-2">
                          <FileIcon className="w-4 h-4 text-primary" />
                          <span className="font-medium text-sm">{job.fileName}</span>
                        </div>
                        {/* Close button is automatically added by DialogContent */}
                      </div>

                      {/* Image Viewer */}
                      <div className="relative aspect-video w-full bg-black/5 flex items-center justify-center overflow-hidden">
                         {/* Background Blur Effect */}
                         {job.thumbnailUrl && (
                          <div 
                            className="absolute inset-0 opacity-20 blur-[100px] scale-110"
                            style={{ backgroundImage: `url(${job.thumbnailUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
                          />
                        )}
                        
                        {job.thumbnailUrl && (
                          <img
                            src={job.thumbnailUrl}
                            alt={job.fileName}
                            className="relative w-full h-full object-contain z-10"
                          />
                        )}
                      </div>

                      {/* Footer */}
                      <div className="flex items-center justify-between p-4 bg-muted/30 border-t border-border/50">
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span className="font-mono">{formatFileSize(job.fileSize)}</span>
                          <span>•</span>
                          <span className="capitalize">{job.fileType}</span>
                          <span>•</span>
                          <StatusBadge status={job.status} />
                        </div>
                        <Button size="sm" className="gap-2">
                          <Download className="w-4 h-4" />
                          Download
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                  <Button variant="outline" size="sm" className="h-8 text-xs bg-background/50 backdrop-blur-sm">
                    <Download className="w-3.5 h-3.5 mr-2" />
                    Download
                  </Button>
                </>
              )}
              
              {job.status === 'failed' && (
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 text-xs bg-background/50 backdrop-blur-sm"
                  onClick={() => onRetry?.(job.id)}
                >
                  <RefreshCw className="w-3.5 h-3.5 mr-2" />
                  Retry
                </Button>
              )}
              
              <Button
                variant="ghost"
                size="sm"
                className="h-8 text-xs text-muted-foreground hover:text-destructive ml-auto"
                onClick={() => onDelete?.(job.id)}
              >
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
