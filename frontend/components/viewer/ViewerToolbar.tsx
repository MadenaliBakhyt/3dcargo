"use client";

import { Eye, EyeOff, Grid3x3, Maximize, RotateCcw } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { ContainerMode } from "@/components/viewer/TruckContainer";
import type { CameraView } from "@/components/viewer/CameraController";
import { cn } from "@/lib/utils";

interface ViewerToolbarProps {
  onSetView: (view: CameraView) => void;
  containerMode: ContainerMode;
  onContainerModeChange: (mode: ContainerMode) => void;
  showGrid: boolean;
  onToggleGrid: () => void;
  showCog: boolean;
  onToggleCog: () => void;
}

const VIEW_BUTTONS: { view: CameraView; label: string }[] = [
  { view: "reset", label: "Сброс" },
  { view: "top", label: "Сверху" },
  { view: "front", label: "Спереди" },
  { view: "side", label: "Сбоку" },
  { view: "fit", label: "Показать всё" },
];

export function ViewerToolbar({
  onSetView,
  containerMode,
  onContainerModeChange,
  showGrid,
  onToggleGrid,
  showCog,
  onToggleCog,
}: ViewerToolbarProps) {
  return (
    <div className="flex flex-wrap items-center gap-1.5 border-b border-border bg-card/80 px-2 py-1.5 backdrop-blur">
      {VIEW_BUTTONS.map((b) => (
        <Button key={b.view} variant="ghost" size="sm" onClick={() => onSetView(b.view)}>
          {b.view === "reset" && <RotateCcw />}
          {b.view === "fit" && <Maximize />}
          {b.label}
        </Button>
      ))}

      <div className="mx-1 h-5 w-px bg-border" />

      {(["walls", "transparent", "hidden"] as ContainerMode[]).map((mode) => (
        <Button
          key={mode}
          variant="ghost"
          size="sm"
          className={cn(containerMode === mode && "bg-secondary")}
          onClick={() => onContainerModeChange(mode)}
        >
          {mode === "walls" ? "Стены" : mode === "transparent" ? "Прозрачный" : "Скрыть кузов"}
        </Button>
      ))}

      <div className="mx-1 h-5 w-px bg-border" />

      <Button variant="ghost" size="sm" className={cn(showGrid && "bg-secondary")} onClick={onToggleGrid}>
        <Grid3x3 /> Сетка
      </Button>
      <Button variant="ghost" size="sm" className={cn(showCog && "bg-secondary")} onClick={onToggleCog}>
        {showCog ? <Eye /> : <EyeOff />} Центр тяжести
      </Button>
    </div>
  );
}
