"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { useCargoStore } from "@/stores/useCargoStore";

const PAGE_SIZE = 200;

export function PlacementTable() {
  const result = useCargoStore((s) => s.result);
  const selectedInstanceId = useCargoStore((s) => s.selectedInstanceId);
  const setSelectedInstanceId = useCargoStore((s) => s.setSelectedInstanceId);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  if (!result || result.placements.length === 0) return null;

  const sorted = [...result.placements].sort((a, b) => a.loadingOrder - b.loadingOrder);
  const visible = sorted.slice(0, visibleCount);

  return (
    <div className="flex flex-col gap-2">
      <div className="max-h-96 overflow-y-auto rounded-md border border-border">
        <Table>
          <TableHeader className="sticky top-0 bg-card">
            <TableRow>
              <TableHead>№</TableHead>
              <TableHead>Груз</TableHead>
              <TableHead>Машина</TableHead>
              <TableHead>X</TableHead>
              <TableHead>Y</TableHead>
              <TableHead>Z</TableHead>
              <TableHead>Длина</TableHead>
              <TableHead>Ширина</TableHead>
              <TableHead>Высота</TableHead>
              <TableHead>Вес</TableHead>
              <TableHead>Поворот</TableHead>
              <TableHead>Ярус</TableHead>
              <TableHead>Порядок</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {visible.map((p) => (
              <TableRow
                key={p.instanceId}
                onClick={() => setSelectedInstanceId(p.instanceId)}
                className={cn("cursor-pointer", p.instanceId === selectedInstanceId && "bg-primary/5")}
              >
                <TableCell>{p.loadingOrder}</TableCell>
                <TableCell>
                  <span className="mr-1.5 inline-block h-2.5 w-2.5 rounded-sm align-middle" style={{ backgroundColor: p.color }} />
                  {p.cargoName}
                  <span className="ml-1 text-muted-foreground">({p.instanceId})</span>
                </TableCell>
                <TableCell>{p.truckId}</TableCell>
                <TableCell>{p.x.toFixed(0)}</TableCell>
                <TableCell>{p.y.toFixed(0)}</TableCell>
                <TableCell>{p.z.toFixed(0)}</TableCell>
                <TableCell>{p.length}</TableCell>
                <TableCell>{p.width}</TableCell>
                <TableCell>{p.height}</TableCell>
                <TableCell>{p.weight}</TableCell>
                <TableCell>{p.orientationCode}</TableCell>
                <TableCell>{p.layer}</TableCell>
                <TableCell>{p.loadingOrder}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      {visibleCount < sorted.length && (
        <Button variant="outline" size="sm" onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}>
          Показать ещё ({sorted.length - visibleCount})
        </Button>
      )}
    </div>
  );
}
