import { ArrowRight, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Hero() {
  return (
    <section className="container py-24 text-center relative">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative z-10">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-sm text-primary mb-8">
          <Zap className="w-4 h-4" />
          Powered by Sharp & FFmpeg
        </div>

        <h1 className="text-5xl md:text-7xl font-bold leading-tight mb-6">
          Generate thumbnails<br />
          <span className="text-gradient">in seconds</span>
        </h1>

        <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-12">
          Upload your images and videos, and get perfectly sized 128×128 thumbnails
          with real-time processing status. Built with Node.js, BullMQ, and Redis.
        </p>

        <div className="flex items-center justify-center gap-4">
          <Button variant="glow" size="lg">
            Start Free
            <ArrowRight className="w-4 h-4" />
          </Button>
          <Button variant="outline" size="lg">
            Sign In
          </Button>
        </div>
      </div>
    </section>
  );
}
