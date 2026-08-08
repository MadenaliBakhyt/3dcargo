"use client";

import { Copy, Pencil, Trash2 } from "lucide-react";

import { CargoFormDialog } from "@/components/cargo/CargoFormDialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { PACKAGE_TYPE_LABELS } from "@/lib/cargoTemplates";
import { formatKg, formatM3 } from "@/lib/utils";
import { useCargoStore } from "@/stores/useCargoStore";
import type { CargoFormValues } from "@/lib/validation";

const PRIORITY_LABELS: Record<string, string> = { high: "Высокий", medium: "Средний", low: "Низкий" };

export function CargoTable() {
  const cargoTypes = useCargoStore((s) => s.cargoTypes);
  const updateCargoType = useCargoStore((s) => s.updateCargoType);
  const removeCargoType = useCargoStore((s) => s.removeCargoType);
  const duplicateCargoType = useCargoStore((s) => s.duplicateCargoType);

  if (cargoTypes.length === 0) {
    return (
      <p className="rounded-md border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
        Добавьте груз для расчёта.
      </p>
    );
  }

  const handleEdit = (id: string) => (values: CargoFormValues) => updateCargoType(id, values);

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>№</TableHead>
          <TableHead>Название</TableHead>
          <TableHead>Размер, см</TableHead>
          <TableHead>Вес, кг</TableHead>
          <TableHead>Кол-во</TableHead>
          <TableHead>Общий объём</TableHead>
          <TableHead>Общий вес</TableHead>
          <TableHead>Поворот</TableHead>
          <TableHead>Штабель</TableHead>
          <TableHead>Хрупкий</TableHead>
          <TableHead className="text-right">Действия</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {cargoTypes.map((cargo, index) => {
          const totalVolumeM3 = (cargo.length * cargo.width * cargo.height * cargo.quantity) / 1_000_000;
          const totalWeight = cargo.weight * cargo.quantity;
          return (
            <TableRow key={cargo.id}>
              <TableCell className="text-muted-foreground">{index + 1}</TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 shrink-0 rounded-sm" style={{ backgroundColor: cargo.color }} />
                  <div>
                    <div className="font-medium">{cargo.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {PACKAGE_TYPE_LABELS[cargo.packageType]} · {PRIORITY_LABELS[cargo.priority]}
                    </div>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                {cargo.length} × {cargo.width} × {cargo.height}
              </TableCell>
              <TableCell>{formatKg(cargo.weight)}</TableCell>
              <TableCell>{cargo.quantity}</TableCell>
              <TableCell>{formatM3(totalVolumeM3)}</TableCell>
              <TableCell>{formatKg(totalWeight)}</TableCell>
              <TableCell>
                {cargo.allowRotation ? (
                  <Badge variant="secondary">{cargo.allowVerticalRotation ? "полный" : "гориз."}</Badge>
                ) : (
                  <Badge variant="outline">нет</Badge>
                )}
              </TableCell>
              <TableCell>
                {cargo.stackable ? <Badge variant="success">да</Badge> : <Badge variant="outline">нет</Badge>}
              </TableCell>
              <TableCell>{cargo.fragile ? <Badge variant="warning">хрупкий</Badge> : "—"}</TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-1">
                  <CargoFormDialog
                    mode="edit"
                    initialValues={cargo}
                    onSubmit={handleEdit(cargo.id)}
                    trigger={
                      <Button variant="ghost" size="icon" aria-label="Редактировать">
                        <Pencil className="h-4 w-4" />
                      </Button>
                    }
                  />
                  <Button variant="ghost" size="icon" aria-label="Дублировать" onClick={() => duplicateCargoType(cargo.id)}>
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" aria-label="Удалить" onClick={() => removeCargoType(cargo.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
