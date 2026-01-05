import { Badge } from "@/components/ui/badge";

export default function HeroBadge() {
  return (
    <Badge
      variant="outline"
      className="border-cyan-400/30 text-cyan-400 px-4 py-1"
    >
      ⚡ Powered by Sharp & FFmpeg
    </Badge>
  );
}
