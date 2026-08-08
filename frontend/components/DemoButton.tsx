"use client";

import { Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ApiError, calculateLoading } from "@/lib/api";
import { generateId } from "@/lib/utils";
import { TRANSPORT_PRESETS } from "@/lib/transportPresets";
import { useCargoStore } from "@/stores/useCargoStore";
import type { CargoType } from "@/types";

const DEMO_TRANSPORT = TRANSPORT_PRESETS[0]!;

const DEMO_CARGO: CargoType = {
  id: generateId("cargo"),
  name: "Паллета A",
  length: 120,
  width: 80,
  height: 160,
  weight: 450,
  quantity: 15,
  color: "#f97316",
  packageType: "pallet",
  allowRotation: true,
  allowVerticalRotation: false,
  stackable: true,
  maxStackHeight: null,
  maxStackTiers: null,
  fragile: false,
  maxTopLoad: null,
  priority: "medium",
  description: "",
};

export function DemoButton() {
  const setTransport = useCargoStore((s) => s.setTransport);
  const setCargoTypes = useCargoStore((s) => s.setCargoTypes);
  const settings = useCargoStore((s) => s.settings);
  const startCalculating = useCargoStore((s) => s.startCalculating);
  const setResult = useCargoStore((s) => s.setResult);
  const setCalculationError = useCargoStore((s) => s.setCalculationError);
  const isCalculating = useCargoStore((s) => s.isCalculating);

  const runDemo = async () => {
    setTransport(DEMO_TRANSPORT);
    setCargoTypes([DEMO_CARGO]);
    startCalculating();
    try {
      const result = await calculateLoading({ transport: DEMO_TRANSPORT, cargoTypes: [DEMO_CARGO], settings });
      setResult(result);
    } catch (err) {
      const message = err instanceof ApiError ? err.message : "Не удалось выполнить расчёт демо-проекта.";
      setCalculationError(message);
    }
  };

  return (
    <Button variant="secondary" size="sm" onClick={runDemo} disabled={isCalculating}>
      <Sparkles /> Попробовать демо
    </Button>
  );
}
