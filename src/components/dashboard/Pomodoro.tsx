"use client";

import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Play, Pause, RotateCcw, Timer, Trophy } from "lucide-react";

export function Pomodoro() {
  const [mode, setMode] = useState<"timer" | "stopwatch">("timer");
  const [duration, setDuration] = useState(25);
  const [customDuration, setCustomDuration] = useState("");
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [sessionsCompleted, setSessionsCompleted] = useState(0);
  const [recap, setRecap] = useState<string | null>(null);
  const [totalTime, setTotalTime] = useState(25 * 60);

  const handleSessionComplete = async () => {
    setSessionsCompleted((prev) => prev + 1);
    try {
      const res = await fetch("/api/pomodoro", { method: "POST" });
      const data = await res.json();
      if (data.recap) {
        setRecap(data.recap);
      }
    } catch (error) {
      console.error("Failed to sync pomodoro", error);
    }
  };

  useEffect(() => {
    if (!isActive) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (mode === "timer") {
          if (prev <= 1) {
            clearInterval(interval);
            setIsActive(false);
            handleSessionComplete();
            return 0;
          }
          return prev - 1;
        } else {
          // Stopwatch mode - count up
          if (prev >= totalTime) {
            clearInterval(interval);
            setIsActive(false);
            handleSessionComplete();
            return totalTime;
          }
          return prev + 1;
        }
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isActive, mode, totalTime]);

  const changeDuration = (mins: number) => {
    setDuration(mins);
    setCustomDuration("");
    setIsActive(false);
    const seconds = mins * 60;
    setTotalTime(seconds);
    // If currently in timer mode, reset visible time to the new total
    setTimeLeft((prev) => (mode === "timer" ? seconds : prev));
  };

  const applyCustomDuration = () => {
    const mins = parseInt(customDuration, 10);
    if (mins > 0) {
      changeDuration(mins);
      const seconds = mins * 60;
      setTotalTime(seconds);
      if (mode === "timer") setTimeLeft(seconds);
      else setTimeLeft(0);
    }
  };

  const toggleTimer = () => setIsActive(!isActive);
  const resetTimer = () => {
    setIsActive(false);
    if (mode === "timer") {
      setTimeLeft(totalTime);
    } else {
      setTimeLeft(0);
    }
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    if (hours > 0) {
      return `${hours}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
    }
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const progress = mode === "timer" 
    ? ((totalTime - timeLeft) / totalTime) * 100
    : (timeLeft / totalTime) * 100;

  return (
    <Card className="overflow-hidden border-primary/20 bg-card/50 backdrop-blur-sm">
      <CardHeader className="bg-primary/5 pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Timer className="h-4 w-4 text-primary" />
          {mode === "timer" ? "Timer" : "Stopwatch"}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6 flex flex-col items-center gap-4">
        {recap ? (
          <div className="flex flex-col items-center gap-3 animate-in fade-in zoom-in duration-500">
            <Trophy className="h-10 w-10 text-yellow-500 animate-bounce" />
            <p className="text-sm text-center font-medium italic">&quot;{recap}&quot;</p>
            <Button size="sm" variant="outline" onClick={() => setRecap(null)}>
              Back to Timer
            </Button>
          </div>
        ) : (
          <>
            {/* Mode Toggle */}
            <div className="flex gap-2 w-full">
              <Button
                size="sm"
                variant={mode === "timer" ? "default" : "outline"}
                className="flex-1"
                onClick={() => {
                  setMode("timer");
                  setIsActive(false);
                  const mins = customDuration ? parseInt(customDuration, 10) : duration;
                  const seconds = mins * 60;
                  setTimeLeft(seconds);
                  setTotalTime(seconds);
                }}
              >
                Timer
              </Button>
              <Button
                size="sm"
                variant={mode === "stopwatch" ? "default" : "outline"}
                className="flex-1"
                onClick={() => {
                  setMode("stopwatch");
                  setIsActive(false);
                  setTimeLeft(0);
                }}
              >
                Stopwatch
              </Button>
            </div>

            {/* Duration Presets / Custom Input */}
            {mode === "timer" && (
              <div className="w-full flex gap-2 flex-wrap justify-center">
                <Button
                  size="sm"
                  variant={duration === 25 && !customDuration ? "default" : "outline"}
                  onClick={() => changeDuration(25)}
                >
                  25min
                </Button>
                <Button
                  size="sm"
                  variant={duration === 50 && !customDuration ? "default" : "outline"}
                  onClick={() => changeDuration(50)}
                >
                  50min
                </Button>
                <div className="flex gap-1 w-full">
                  <Input
                    type="number"
                    placeholder="Custom (mins)"
                    value={customDuration}
                    onChange={(e) => setCustomDuration(e.target.value)}
                    className="h-8 text-xs"
                    min="1"
                  />
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={applyCustomDuration}
                    className="text-xs"
                  >
                    Set
                  </Button>
                </div>
              </div>
            )}

            {/* Display */}
            <div className="text-5xl font-bold font-mono tracking-tighter">
              {formatTime(timeLeft)}
            </div>

            <Progress value={progress} className="h-1.5 w-full" />

            {/* Controls */}
            <div className="flex gap-2 w-full">
              <Button
                className="flex-1"
                variant={isActive ? "outline" : "default"}
                onClick={toggleTimer}
              >
                {isActive ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                {isActive ? "Pause" : "Start"}
              </Button>
              <Button variant="ghost" size="icon" onClick={resetTimer}>
                <RotateCcw className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex gap-2 w-full">
              <Button size="sm" variant="secondary" onClick={() => { setIsActive(false); void handleSessionComplete(); }}>
                Complete Session
              </Button>
            </div>
          </>
        )}

        <div className="text-xs text-muted-foreground flex justify-between w-full mt-2">
          <span>{mode === "timer" ? "Target" : "Elapsed"}:</span>
          <span>Sessions: {sessionsCompleted}</span>
        </div>
      </CardContent>
    </Card>
  );
}
