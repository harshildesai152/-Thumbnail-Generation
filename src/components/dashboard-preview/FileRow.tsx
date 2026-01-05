import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

type Props = {
  name: string;
  status: "completed" | "processing" | "queued";
  progress: number;
};

const STATUS_COLORS = {
  completed: "bg-green-500",
  processing: "bg-blue-500",
  queued: "bg-yellow-500",
};

export default function FileRow({ name, status, progress }: Props) {
  return (
    <div className="flex items-center gap-4 p-4 rounded-lg bg-black/30 border border-white/10">

      <div className="w-8 h-8 rounded-md bg-white/10 flex items-center justify-center">
        📄
      </div>

      <div className="flex-1">
        <p className="text-sm font-medium text-white">{name}</p>
        <Progress value={progress} className="mt-2 h-2" />
      </div>

      <Badge className={`${STATUS_COLORS[status]} text-black`}>
        {status}
      </Badge>
    </div>
  );
}
