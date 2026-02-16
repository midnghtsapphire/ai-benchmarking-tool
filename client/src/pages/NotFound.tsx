import { Button } from "@/components/ui/button";
import { Flame, ArrowLeft } from "lucide-react";
import { Link } from "wouter";

export default function NotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
      <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[oklch(0.5_0.16_30)] to-[oklch(0.65_0.14_75)] flex items-center justify-center mb-6 shadow-lg shadow-[oklch(0.5_0.16_30_/_20%)]">
        <Flame className="w-8 h-8 text-[oklch(0.95_0.02_60)]" />
      </div>
      <h1 className="font-display text-5xl text-foreground mb-3">404</h1>
      <p className="text-muted-foreground text-lg mb-8 max-w-md">
        This observation point doesn't exist. The volcanic activity you're looking for may have shifted.
      </p>
      <Link href="/">
        <Button className="bg-[oklch(0.65_0.14_75)] text-[oklch(0.14_0.01_55)] hover:bg-[oklch(0.7_0.14_75)] gap-2">
          <ArrowLeft className="w-4 h-4" />
          Return to Observatory
        </Button>
      </Link>
    </div>
  );
}
