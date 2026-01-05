import Link from "next/link";
import { Layers, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Header() {
  return (
    <header className="container py-6">
      <nav className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
            <Layers className="w-5 h-5 text-primary" />
          </div>
          <span className="text-xl font-bold tracking-tight">
            Thumb<span className="text-gradient">Gen</span>
          </span>
        </div>

        <div className="flex items-center gap-4">
          <Link href="/login">
            <Button variant="ghost">Sign in</Button>
          </Link>
          <Link href="/signup">
            <Button variant="glow">
              Get Started
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </nav>
    </header>
  );
}