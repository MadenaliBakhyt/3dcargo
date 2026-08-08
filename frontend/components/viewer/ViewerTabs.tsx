"use client";

import { useMemo, useState } from "react";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { Projection2D } from "@/components/viewer/Projection2D";
import { Viewer } from "@/components/viewer/Viewer";
import { useCargoStore } from "@/stores/useCargoStore";

type ViewTab = "3d" | "top" | "front" | "side";

export function ViewerTabs() {
  const transport = useCargoStore((s) => s.transport);
  const result = useCargoStore((s) => s.result);
  const selectedTruckId = useCargoStore((s) => s.selectedTruckId);
  const [activeTab, setActiveTab] = useState<ViewTab>("3d");

  const placements = useMemo(
    () => result?.placements.filter((p) => p.truckId === selectedTruckId) ?? [],
    [result, selectedTruckId]
  );

  return (
    <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as ViewTab)} className="flex h-full flex-col">
      <div className="border-b border-border px-2 pt-2">
        <TabsList>
          <TabsTrigger value="3d">3D</TabsTrigger>
          <TabsTrigger value="top">Сверху</TabsTrigger>
          <TabsTrigger value="front">Спереди</TabsTrigger>
          <TabsTrigger value="side">Сбоку</TabsTrigger>
        </TabsList>
      </div>

      {/* The 3D canvas stays mounted across tab switches -- unmounting and
          remounting @react-three/fiber's Canvas inside Radix's Tabs (which
          unmounts hidden content) breaks its event-listener setup. Visibility
          is toggled with CSS instead. */}
      <div className={cn("min-h-0 flex-1", activeTab !== "3d" && "hidden")}>
        <Viewer />
      </div>

      {(["top", "front", "side"] as const).map((axis) => (
        <div key={axis} className={cn("min-h-0 flex-1 overflow-hidden p-4", activeTab !== axis && "hidden")}>
          {transport ? (
            <Projection2D
              axis={axis}
              truckLength={transport.length}
              truckWidth={transport.width}
              truckHeight={transport.height}
              placements={placements}
            />
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
              Выберите транспорт для начала.
            </div>
          )}
        </div>
      ))}
    </Tabs>
  );
}
