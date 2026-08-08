"use client";

import { Plus } from "lucide-react";

import { CargoFormDialog } from "@/components/cargo/CargoFormDialog";
import { CsvImportDialog } from "@/components/cargo/CsvImportDialog";
import { Button } from "@/components/ui/button";
import { useCargoStore } from "@/stores/useCargoStore";
import type { CargoFormValues } from "@/lib/validation";

export function CargoPanel() {
  const addCargoType = useCargoStore((s) => s.addCargoType);

  return (
    <div className="flex items-center gap-2">
      <CargoFormDialog
        mode="create"
        onSubmit={(values: CargoFormValues) => addCargoType(values)}
        trigger={
          <Button size="sm" className="flex-1">
            <Plus /> Добавить груз
          </Button>
        }
      />
      <CsvImportDialog />
    </div>
  );
}
