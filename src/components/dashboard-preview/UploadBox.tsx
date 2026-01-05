import { Card } from "@/components/ui/card";

export default function UploadBox() {
  return (
    <Card className="flex flex-col items-center justify-center border-dashed border-white/20 bg-black/20 text-center py-12">
      <div className="text-cyan-400 text-2xl mb-3">⬆</div>
      <p className="text-sm font-medium">Drop files here</p>
      <p className="text-xs text-muted-foreground mt-1">
        Images & Videos
      </p>
    </Card>
  );
}
