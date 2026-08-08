"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CargoTable } from "@/components/cargo/CargoTable";
import { PlacementTable } from "@/components/results/PlacementTable";
import { useCargoStore } from "@/stores/useCargoStore";

export function BottomPanel() {
  const result = useCargoStore((s) => s.result);

  return (
    <div className="h-72 shrink-0 overflow-hidden border-t border-border bg-card p-3">
      <Tabs defaultValue="cargo" className="flex h-full flex-col">
        <TabsList className="w-fit">
          <TabsTrigger value="cargo">Таблица грузов</TabsTrigger>
          <TabsTrigger value="placement" disabled={!result}>
            Порядок размещения
          </TabsTrigger>
        </TabsList>
        <TabsContent value="cargo" className="mt-2 flex-1 overflow-y-auto">
          <CargoTable />
        </TabsContent>
        <TabsContent value="placement" className="mt-2 flex-1 overflow-y-auto">
          <PlacementTable />
        </TabsContent>
      </Tabs>
    </div>
  );
}
