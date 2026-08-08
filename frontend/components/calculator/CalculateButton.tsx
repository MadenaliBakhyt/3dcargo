"use client";

import { Loader2, PlayCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ApiError, calculateLoading } from "@/lib/api";
import { useCargoStore } from "@/stores/useCargoStore";

export function CalculateButton() {
  const transport = useCargoStore((s) => s.transport);
  const cargoTypes = useCargoStore((s) => s.cargoTypes);
  const settings = useCargoStore((s) => s.settings);
  const isCalculating = useCargoStore((s) => s.isCalculating);
  const calculationError = useCargoStore((s) => s.calculationError);
  const startCalculating = useCargoStore((s) => s.startCalculating);
  const setResult = useCargoStore((s) => s.setResult);
  const setCalculationError = useCargoStore((s) => s.setCalculationError);

  const disabled = !transport || cargoTypes.length === 0 || isCalculating;

  const handleCalculate = async () => {
    if (!transport || cargoTypes.length === 0) return;
    startCalculating();
    try {
      const result = await calculateLoading({ transport, cargoTypes, settings });
      setResult(result);
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "Не удалось выполнить расчёт. Проверьте соединение с сервером.";
      setCalculationError(message);
    }
  };

  return (
    <div className="flex flex-col gap-2">
      <Button size="lg" className="w-full" disabled={disabled} onClick={handleCalculate}>
        {isCalculating ? <Loader2 className="animate-spin" /> : <PlayCircle />}
        {isCalculating ? "Рассчитываем..." : "Рассчитать размещение"}
      </Button>
      {calculationError && <p className="text-xs text-destructive">{calculationError}</p>}
    </div>
  );
}
