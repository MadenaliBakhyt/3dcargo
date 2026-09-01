"use client";

import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCargoStore } from "@/stores/useCargoStore";
import type { LoadingSide } from "@/types";

export function LoadingSideSelector() {
  const loadingSide = useCargoStore((s) => s.settings.loadingSide);
  const setSettings = useCargoStore((s) => s.setSettings);

  return (
    <div className="grid gap-1.5">
      <Label htmlFor="loading-side" className="text-xs text-muted-foreground">
        Сторона погрузки
      </Label>
      <Select value={loadingSide} onValueChange={(v) => setSettings({ loadingSide: v as LoadingSide })}>
        <SelectTrigger id="loading-side" className="h-8 text-xs">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="left">Слева (по умолчанию)</SelectItem>
          <SelectItem value="right">Справа</SelectItem>
        </SelectContent>
      </Select>
    </div>
  );
}
