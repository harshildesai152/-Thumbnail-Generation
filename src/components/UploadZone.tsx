'use client';

import { useCallback, useState } from 'react';
import { useAtom } from 'jotai';
import { Upload, Image, Video, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { uploadingFilesAtom } from '@/store/jobsStore';
import type { UploadFile } from '@/types';
import { api } from '@/lib/api';
import { useJobs } from '@/lib/useJobs';
import { toast } from 'sonner';

export function UploadZone() {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadingFiles, setUploadingFiles] = useAtom(uploadingFilesAtom);
  const { addJobs } = useJobs();

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const processFiles = useCallback(async (files: FileList) => {
    const validFiles = Array.from(files).filter(file =>
      file.type.startsWith('image/') || file.type.startsWith('video/')
    );

    if (validFiles.length === 0) {
      toast.error('No valid files selected. Please select images or videos.');
      return;
    }

    // Create upload file entries for progress tracking
    const newUploads: UploadFile[] = validFiles.map(file => ({
      id: crypto.randomUUID(),
      file,
      progress: 0,
      status: 'uploading',
    }));

    setUploadingFiles(prev => [...prev, ...newUploads]);

    try {
      // Update progress to show upload starting
      setUploadingFiles(prev =>
        prev.map(f => ({ ...f, progress: 10 }))
      );

      // Upload files via API
      const response = await api.upload.uploadFiles(files);

      // Update progress to complete
      setUploadingFiles(prev =>
        prev.map(f => ({ ...f, progress: 100, status: 'completed' }))
      );

      // Add jobs to the state
      addJobs(response.jobs);

      toast.success(`Successfully uploaded ${response.jobs.length} file(s)`);

      // Remove from uploading list after a delay
      setTimeout(() => {
        setUploadingFiles(prev => prev.filter(f =>
          !newUploads.some(upload => upload.id === f.id)
        ));
      }, 2000);

    } catch (error) {
      console.error('Upload failed:', error);
      toast.error('Upload failed. Please try again.');

      // Mark uploads as failed
      setUploadingFiles(prev =>
        prev.map(f => ({ ...f, status: 'error' }))
      );

      // Remove failed uploads after delay
      setTimeout(() => {
        setUploadingFiles(prev => prev.filter(f =>
          !newUploads.some(upload => upload.id === f.id)
        ));
      }, 3000);
    }
  }, [setUploadingFiles, addJobs]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
    }
  }, [processFiles]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFiles(e.target.files);
    }
  }, [processFiles]);

  const removeUpload = useCallback((id: string) => {
    setUploadingFiles(prev => prev.filter(f => f.id !== id));
  }, [setUploadingFiles]);

  return (
    <div className="space-y-4">
      <div
        className={cn('upload-zone cursor-pointer min-h-[200px] flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-xl transition-all',
          isDragging ? 'border-primary bg-primary/5' : 'border-border bg-card hover:bg-muted/50'
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => document.getElementById('file-input')?.click()}
      >
        <input
          id="file-input"
          type="file"
          multiple
          accept="image/*,video/*"
          className="hidden"
          onChange={handleFileSelect}
        />
        
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 border border-primary/20">
            <Upload className="w-7 h-7 text-primary" />
          </div>
          
          <div>
            <p className="text-lg font-medium text-foreground">
              Drop files here or click to upload
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Supports images and videos up to 100MB
            </p>
          </div>
          
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Image className="w-4 h-4" />
              JPG, PNG, GIF, WebP
            </span>
            <span className="flex items-center gap-1.5">
              <Video className="w-4 h-4" />
              MP4, MOV, AVI, WebM
            </span>
          </div>
        </div>
      </div>

      {/* Uploading files */}
      {uploadingFiles.length > 0 && (
        <div className="space-y-2">
          {uploadingFiles.map((upload) => (
            <div
              key={upload.id}
              className="rounded-lg border bg-card p-3 flex items-center gap-3 animate-fade-in"
            >
              <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                {upload.file.type.startsWith('video/') ? (
                  <Video className="w-5 h-5 text-muted-foreground" />
                ) : (
                  <Image className="w-5 h-5 text-muted-foreground" />
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{upload.file.name}</p>
                <div className="mt-1.5 h-1.5 bg-muted rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary transition-all duration-200 rounded-full"
                    style={{ width: `${upload.progress}%` }}
                  />
                </div>
              </div>
              
              <span className="text-xs text-muted-foreground font-mono">
                {upload.progress}%
              </span>
              
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={(e) => {
                  e.stopPropagation();
                  removeUpload(upload.id);
                }}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
