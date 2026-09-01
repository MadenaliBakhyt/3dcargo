"use client";

import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCargoStore } from "@/stores/useCargoStore";
import type { LoadingDirection } from "@/types";

export function LoadingDirectionSelector() {
  const loadingDirection = useCargoStore((s) => s.settings.loadingDirection);
  const setSettings = useCargoStore((s) => s.setSettings);

  return (
    <div className="grid gap-1.5">
      <Label htmlFor="loading-direction" className="text-xs text-muted-foreground">
        Направление погрузки
      </Label>
      <Select
        value={loadingDirection}
        onValueChange={(v) => setSettings({ loadingDirection: v as LoadingDirection })}
      >
        <SelectTrigger id="loading-direction" className="h-8 text-xs">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="front">Спереди (по умолчанию)</SelectItem>
          <SelectItem value="back">Сзади</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
