import { transportFloorAreaM2, transportVolumeM3 } from "@/lib/transportPresets";
import { formatCm, formatKg, formatM3 } from "@/lib/utils";
import type { Transport } from "@/types";

export function TransportInfoPanel({ transport }: { transport: Transport }) {
  return (
    <div className="rounded-md border border-border bg-secondary/40 p-3 text-sm">
      <div className="font-medium">{transport.name}</div>
      <dl className="mt-2 grid grid-cols-2 gap-y-1 text-xs text-muted-foreground">
        <dt>Размеры</dt>
        <dd className="text-right text-foreground">
          {formatCm(transport.length)} × {formatCm(transport.width)} × {formatCm(transport.height)}
        </dd>
        <dt>Объём</dt>
        <dd className="text-right text-foreground">{formatM3(transportVolumeM3(transport))}</dd>
        <dt>Максимальный вес</dt>
        <dd className="text-right text-foreground">{formatKg(transport.maxWeight)}</dd>
        <dt>Площадь пола</dt>
        <dd className="text-right text-foreground">
          {formatCm(transport.length)} × {formatCm(transport.width)} ({transportFloorAreaM2(transport).toFixed(1)} м²)
        </dd>
      </dl>
    </div>
  );
}
