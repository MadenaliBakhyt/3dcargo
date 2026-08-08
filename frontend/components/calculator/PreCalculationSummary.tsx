import { transportVolumeM3 } from "@/lib/transportPresets";
import { formatKg, formatM3, formatPercent } from "@/lib/utils";
import { useCargoStore } from "@/stores/useCargoStore";

export function PreCalculationSummary() {
  const transport = useCargoStore((s) => s.transport);
  const cargoTypes = useCargoStore((s) => s.cargoTypes);

  if (!transport || cargoTypes.length === 0) return null;

  const totalItems = cargoTypes.reduce((sum, c) => sum + c.quantity, 0);
  const totalVolumeM3 = cargoTypes.reduce((sum, c) => sum + (c.length * c.width * c.height * c.quantity) / 1_000_000, 0);
  const totalWeight = cargoTypes.reduce((sum, c) => sum + c.weight * c.quantity, 0);
  const truckVolumeM3 = transportVolumeM3(transport);
  const volumeLoad = truckVolumeM3 > 0 ? (totalVolumeM3 / truckVolumeM3) * 100 : 0;
  const weightLoad = transport.maxWeight > 0 ? (totalWeight / transport.maxWeight) * 100 : 0;

  return (
    <div className="rounded-md border border-border bg-secondary/40 p-3 text-xs">
      <div className="mb-2 text-sm font-medium">Предварительный расчёт</div>
      <dl className="grid grid-cols-2 gap-y-1 text-muted-foreground">
        <dt>Грузовых мест</dt>
        <dd className="text-right text-foreground">{totalItems}</dd>
        <dt>Общий объём</dt>
        <dd className="text-right text-foreground">{formatM3(totalVolumeM3)}</dd>
        <dt>Общий вес</dt>
        <dd className="text-right text-foreground">{formatKg(totalWeight)}</dd>
        <dt>Объём транспорта</dt>
        <dd className="text-right text-foreground">{formatM3(truckVolumeM3)}</dd>
        <dt>Загрузка по объёму</dt>
        <dd className="text-right text-foreground">{formatPercent(volumeLoad)}</dd>
        <dt>Загрузка по весу</dt>
        <dd className="text-right text-foreground">{formatPercent(weightLoad)}</dd>
      </dl>
      <p className="mt-2 text-[11px] italic text-muted-foreground">
        Это предварительная оценка без учёта геометрии. Фактический результат рассчитывается алгоритмом размещения.
      </p>
    </div>
  );
}
