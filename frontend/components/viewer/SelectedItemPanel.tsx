"use client";

import { X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useCargoStore } from "@/stores/useCargoStore";

export function SelectedItemPanel() {
  const result = useCargoStore((s) => s.result);
  const selectedInstanceId = useCargoStore((s) => s.selectedInstanceId);
  const setSelectedInstanceId = useCargoStore((s) => s.setSelectedInstanceId);

  if (!result || !selectedInstanceId) return null;
  const placement = result.placements.find((p) => p.instanceId === selectedInstanceId);
  if (!placement) return null;

  const truck = result.trucks.find((t) => t.id === placement.truckId);

  const rows: [string, string][] = [
    ["ID", placement.instanceId],
    ["Груз", placement.cargoName],
    ["Размер", `${placement.length} × ${placement.width} × ${placement.height} см`],
    ["Вес", `${placement.weight} кг`],
    ["Координаты", `X ${placement.x.toFixed(0)}, Y ${placement.y.toFixed(0)}, Z ${placement.z.toFixed(0)}`],
    ["Поворот", placement.orientationCode],
    ["Транспорт", truck?.name ?? placement.truckId],
    ["Ярус", String(placement.layer)],
    ["Порядок загрузки", String(placement.loadingOrder)],
  ];

  return (
    <div className="absolute right-3 top-14 z-10 w-64 rounded-lg border border-border bg-card/95 p-3 text-xs shadow-lg backdrop-blur">
      <div className="mb-2 flex items-center justify-between">
        <span className="flex items-center gap-1.5 font-medium">
          <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: placement.color }} />
          Груз #{placement.loadingOrder}
        </span>
        <Button variant="ghost" size="icon" className="h-5 w-5" onClick={() => setSelectedInstanceId(null)}>
          <X className="h-3.5 w-3.5" />
        </Button>
      </div>
      <dl className="grid grid-cols-2 gap-y-1">
        {rows.map(([label, value]) => (
          <div key={label} className="contents">
            <dt className="text-muted-foreground">{label}</dt>
            <dd className="text-right">{value}</dd>
          </div>
        ))}
      </dl>
      {placement.fragile && (
        <div className="mt-2 rounded bg-warning/15 px-2 py-1 text-warning-foreground">⚠ Хрупкий груз</div>
      )}
    </div>
  );
}
