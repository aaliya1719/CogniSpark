"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Droplets, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";

export function HydrationTracker() {
  const [glasses, setGlasses] = useState<boolean[]>(new Array(8).fill(false));

  const toggleGlass = (index: number) => {
    const newGlasses = [...glasses];
    newGlasses[index] = !newGlasses[index];
    setGlasses(newGlasses);
    if (session) void saveHydration(newGlasses);
  };

  const saveHydration = async (newGlasses: boolean[]) => {
    try {
      await fetch("/api/hydration", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ glasses: newGlasses }),
      });
    } catch (e) {
      console.error("Failed to save hydration", e);
    }
  };

  const glassesDrank = glasses.filter(Boolean).length;

  const resetGlasses = () => {
    setGlasses(new Array(8).fill(false));
    // TODO: Sync reset with Firestore if persisted
  };

  const { data: session } = useSession();

  useEffect(() => {
    // If signed in, fetch persisted hydration
    const fetchHydration = async () => {
      try {
        const res = await fetch("/api/hydration");
        if (!res.ok) return;
        const data = await res.json();
        const g = data?.hydration?.glasses;
        if (Array.isArray(g) && g.length === 8) setGlasses(g);
      } catch (e) {
        // ignore
      }
    };

    if (session) fetchHydration();
  }, [session]);

  return (
    <Card className="border-primary/20 bg-card/50 backdrop-blur-sm">
      <CardHeader className="bg-primary/5 pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Droplets className="h-4 w-4 text-blue-500" />
          Hydration Tracker
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="flex flex-wrap gap-4 justify-center">
          {glasses.map((isFilled, i) => (
            <button
              key={i}
              onClick={() => toggleGlass(i)}
              className={cn(
                "h-10 w-8 border-2 rounded-b-lg rounded-t-sm relative overflow-hidden transition-all duration-500",
                isFilled 
                  ? "border-blue-500 bg-blue-500/20 shadow-[0_0_10px_rgba(59,130,246,0.3)]" 
                  : "border-muted-foreground/30 bg-transparent hover:border-blue-400"
              )}
            >
              {isFilled && (
                <div className="absolute bottom-0 left-0 right-0 h-[70%] bg-blue-500/40 animate-pulse" />
              )}
            </button>
          ))}
        </div>
        <div className="mt-4 text-center">
          <span className="text-2xl font-bold text-blue-500">{glassesDrank}</span>
          <span className="text-sm text-muted-foreground"> / 8 glasses</span>
        </div>
        <div className="mt-3 flex justify-center">
          <Button
            size="sm"
            variant="outline"
            onClick={async () => {
              resetGlasses();
              if (session) await saveHydration(new Array(8).fill(false));
            }}
          >
            <RotateCcw className="h-4 w-4 mr-2" /> Reset
          </Button>
        </div>
        <p className="text-[10px] text-center text-muted-foreground mt-2 uppercase tracking-widest font-bold">
          Stay sharp, stay hydrated
        </p>
      </CardContent>
    </Card>
  );
}
