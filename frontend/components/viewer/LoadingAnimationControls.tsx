"use client";

import { Pause, Play, RotateCcw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface LoadingAnimationControlsProps {
  isPlaying: boolean;
  onPlay: () => void;
  onPause: () => void;
  onReset: () => void;
  speed: number;
  onSpeedChange: (speed: number) => void;
  visibleCount: number;
  totalCount: number;
}

const SPEEDS = [0.5, 1, 2];

export function LoadingAnimationControls({
  isPlaying,
  onPlay,
  onPause,
  onReset,
  speed,
  onSpeedChange,
  visibleCount,
  totalCount,
}: LoadingAnimationControlsProps) {
  return (
    <div className="flex items-center gap-2 border-t border-border bg-card/80 px-2 py-1.5 text-xs backdrop-blur">
      <Button variant="ghost" size="sm" onClick={isPlaying ? onPause : onPlay}>
        {isPlaying ? <Pause /> : <Play />}
        {isPlaying ? "Пауза" : "Порядок загрузки"}
      </Button>
      <Button variant="ghost" size="sm" onClick={onReset}>
        <RotateCcw />
      </Button>
      <div className="flex items-center gap-1">
        {SPEEDS.map((s) => (
          <button
            key={s}
            onClick={() => onSpeedChange(s)}
            className={cn(
              "rounded px-1.5 py-0.5 text-muted-foreground hover:bg-secondary",
              speed === s && "bg-secondary text-foreground"
            )}
          >
            {s}x
          </button>
        ))}
      </div>
      <span className="ml-auto text-muted-foreground">
        {visibleCount} / {totalCount}
      </span>
    </div>
  );
}
