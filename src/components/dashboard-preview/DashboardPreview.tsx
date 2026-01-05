import { Image, Video } from "lucide-react";

export default function DashboardPreview() {
  return (
    <section className="container pb-24">
      <div className="glass-card p-2 md:p-4 max-w-5xl mx-auto">
        <div className="rounded-lg overflow-hidden bg-card border border-border">
          <div className="flex items-center gap-2 px-4 py-3 border-b border-border">
            <div className="w-3 h-3 rounded-full bg-destructive/60" />
            <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
            <div className="w-3 h-3 rounded-full bg-green-500/60" />
            <span className="text-xs text-muted-foreground ml-2 font-mono">dashboard.thumbgen.dev</span>
          </div>

          <div className="p-6 md:p-8">
            <div className="grid md:grid-cols-3 gap-4">
              {/* Upload zone mock */}
              <div className="upload-zone flex flex-col items-center justify-center gap-3 text-center min-h-[200px]">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                </div>
                <p className="text-sm font-medium">Drop files here</p>
                <p className="text-xs text-muted-foreground">Images & Videos</p>
              </div>

              {/* Job cards mock */}
              <div className="md:col-span-2 space-y-3">
                <div className="glass-card p-4 flex items-center gap-4">
                  <div className="w-14 h-14 rounded-lg bg-muted flex items-center justify-center overflow-hidden">
                    <Image className="w-6 h-6 text-muted-foreground" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-white">vacation-photo.jpg</p>
                    <div className="h-1.5 bg-muted rounded-full mt-2 overflow-hidden">
                      <div className="h-full bg-green-500 w-full rounded-full" />
                    </div>
                  </div>
                  <span className="status-badge status-completed">Completed</span>
                </div>

                <div className="glass-card p-4 flex items-center gap-4">
                  <div className="w-14 h-14 rounded-lg bg-muted flex items-center justify-center">
                    <Video className="w-6 h-6 text-muted-foreground" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-white">product-demo.mp4</p>
                    <div className="h-1.5 bg-muted rounded-full mt-2 overflow-hidden">
                      <div className="h-full bg-blue-500 w-2/3 rounded-full animate-shimmer" />
                    </div>
                  </div>
                  <span className="status-badge status-processing">
                    <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse mr-2" />
                    Processing
                  </span>
                </div>

                <div className="glass-card p-4 flex items-center gap-4 opacity-70">
                  <div className="w-14 h-14 rounded-lg bg-muted flex items-center justify-center">
                    <Image className="w-6 h-6 text-muted-foreground" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-white">team-photo.png</p>
                    <p className="text-xs text-muted-foreground mt-1">Waiting in queue...</p>
                  </div>
                  <span className="status-badge status-queued">Queued</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
