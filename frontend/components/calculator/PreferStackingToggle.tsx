"use client";

import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useCargoStore } from "@/stores/useCargoStore";

export function PreferStackingToggle() {
  const preferStacking = useCargoStore((s) => s.settings.preferStacking);
  const setSettings = useCargoStore((s) => s.setSettings);

  return (
    <div className="flex items-center justify-between gap-2 rounded-md border border-border px-3 py-2">
      <div className="grid gap-0.5">
        <Label htmlFor="prefer-stacking" className="text-xs">
          Сначала штабелировать
        </Label>
        <span className="text-[11px] text-muted-foreground">
          Ставить груз друг на друга, даже если на полу есть место
        </span>
      </div>
      <Switch
        id="prefer-stacking"
        checked={preferStacking}
        onCheckedChange={(checked) => setSettings({ preferStacking: checked })}
      />
    </div>
  );
}
