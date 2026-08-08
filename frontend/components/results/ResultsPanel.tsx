"use client";

import { AlertTriangle, CheckCircle2, TruckIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { cn, formatKg, formatM3, formatPercent } from "@/lib/utils";
import { useCargoStore } from "@/stores/useCargoStore";

export function ResultsPanel() {
  const result = useCargoStore((s) => s.result);
  const selectedTruckId = useCargoStore((s) => s.selectedTruckId);
  const setSelectedTruckId = useCargoStore((s) => s.setSelectedTruckId);

  if (!result) {
    return (
      <p className="rounded-md border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
        После расчёта здесь появится схема загрузки.
      </p>
    );
  }

  const { statistics, truckStatistics, unplaced, warnings } = result;

  return (
    <div className="flex flex-col gap-4">
      {result.success ? (
        <div className="flex items-start gap-2 rounded-md border border-success/30 bg-success/10 p-3 text-sm text-success">
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
          <div>
            <div className="font-medium">Весь груз успешно размещён</div>
            <div className="text-xs opacity-80">Все грузовые места размещены на сцене погрузки.</div>
          </div>
        </div>
      ) : (
        <div className="flex items-start gap-2 rounded-md border border-warning/30 bg-warning/10 p-3 text-sm text-warning-foreground">
          <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
          <div>
            <div className="font-medium">Не весь груз удалось разместить</div>
            <div className="text-xs opacity-80">
              Размещено {statistics.placedItems} из {statistics.totalCargoItems}, не размещено {statistics.unplacedItems}.
            </div>
          </div>
        </div>
      )}

      <dl className="grid grid-cols-2 gap-y-1.5 text-xs">
        <dt className="text-muted-foreground">Машин</dt>
        <dd className="text-right font-medium">{statistics.truckCount}</dd>
        <dt className="text-muted-foreground">Размещено</dt>
        <dd className="text-right font-medium">
          {statistics.placedItems} / {statistics.totalCargoItems}
        </dd>
        <dt className="text-muted-foreground">Общий вес</dt>
        <dd className="text-right font-medium">{formatKg(statistics.totalWeight)}</dd>
        <dt className="text-muted-foreground">Использованный объём</dt>
        <dd className="text-right font-medium">{formatM3(statistics.totalVolumeM3)}</dd>
        <dt className="text-muted-foreground">Загрузка по объёму</dt>
        <dd className="text-right font-medium">{formatPercent(statistics.volumeUtilization)}</dd>
        <dt className="text-muted-foreground">Загрузка по весу</dt>
        <dd className="text-right font-medium">{formatPercent(statistics.weightUtilization)}</dd>
      </dl>

      <div>
        <div className="mb-1.5 text-xs font-medium text-muted-foreground">Транспортные средства</div>
        <div className="flex flex-col gap-1.5">
          {truckStatistics.map((ts, idx) => {
            const truck = result.trucks.find((t) => t.id === ts.truckId);
            const selected = ts.truckId === selectedTruckId;
            return (
              <button
                key={ts.truckId}
                onClick={() => setSelectedTruckId(ts.truckId)}
                className={cn(
                  "rounded-md border p-2 text-left text-xs transition-colors",
                  selected ? "border-primary bg-primary/5" : "border-border hover:bg-secondary/50"
                )}
              >
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 font-medium">
                    <TruckIcon className="h-3.5 w-3.5" /> {truck?.name ?? `Машина ${idx + 1}`}
                  </span>
                  <span className="text-muted-foreground">{ts.placedCount} мест</span>
                </div>
                <div className="mt-1 grid grid-cols-3 gap-1 text-muted-foreground">
                  <span>Объём {formatPercent(ts.volumeUtilization)}</span>
                  <span>Вес {formatPercent(ts.weightUtilization)}</span>
                  <span>Пол {formatPercent(ts.floorUtilization)}</span>
                </div>
                {ts.centerOfGravity.offsetWarning && (
                  <div className="mt-1 flex items-center gap-1 text-warning">
                    <AlertTriangle className="h-3 w-3" /> смещён центр тяжести
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {unplaced.length > 0 && (
        <div>
          <div className="mb-1.5 text-xs font-medium text-muted-foreground">Не размещено ({unplaced.length})</div>
          <div className="flex flex-col gap-1">
            {unplaced.slice(0, 20).map((u) => (
              <div key={u.instanceId} className="rounded-md border border-destructive/20 bg-destructive/5 p-2 text-xs">
                <div className="font-medium">{u.name}</div>
                <div className="text-muted-foreground">{u.reason}</div>
              </div>
            ))}
            {unplaced.length > 20 && (
              <div className="text-xs text-muted-foreground">и ещё {unplaced.length - 20}...</div>
            )}
          </div>
        </div>
      )}

      {warnings.length > 0 && (
        <div className="flex flex-col gap-1">
          {warnings.map((w, i) => (
            <div key={i} className="flex items-start gap-1.5 text-[11px] text-muted-foreground">
              <Badge variant="warning" className="mt-0.5 shrink-0">
                !
              </Badge>
              <span>{w}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
