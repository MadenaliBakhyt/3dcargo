"use client";

import { useRef, useState } from "react";
import { Upload } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CARGO_COLOR_PALETTE } from "@/lib/cargoTemplates";
import { parseCargoCsv, type CsvCargoRow } from "@/lib/csv";
import { useCargoStore } from "@/stores/useCargoStore";

export function CsvImportDialog() {
  const [open, setOpen] = useState(false);
  const [rows, setRows] = useState<CsvCargoRow[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const addCargoType = useCargoStore((s) => s.addCargoType);

  const handleFile = async (file: File) => {
    const text = await file.text();
    const result = parseCargoCsv(text);
    setRows(result.rows);
    setErrors(result.errors);
  };

  const handleImport = () => {
    rows.forEach((row, idx) => {
      addCargoType({
        name: row.name,
        length: row.length,
        width: row.width,
        height: row.height,
        weight: row.weight,
        quantity: row.quantity,
        color: CARGO_COLOR_PALETTE[idx % CARGO_COLOR_PALETTE.length]!,
        packageType: "box",
        allowRotation: true,
        allowVerticalRotation: false,
        stackable: true,
        maxStackHeight: null,
        maxStackTiers: null,
        fragile: false,
        maxTopLoad: null,
        priority: "medium",
        description: "",
      });
    });
    setOpen(false);
    setRows([]);
    setErrors([]);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Upload /> Импорт CSV
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Импорт груза из CSV</DialogTitle>
          <DialogDescription>Формат: name,length,width,height,weight,quantity</DialogDescription>
        </DialogHeader>

        <input
          ref={fileInputRef}
          type="file"
          accept=".csv,text/csv"
          className="text-sm"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) void handleFile(file);
          }}
        />

        {errors.length > 0 && (
          <div className="rounded-md border border-destructive/30 bg-destructive/10 p-2 text-xs text-destructive">
            {errors.map((e, i) => (
              <div key={i}>{e}</div>
            ))}
          </div>
        )}

        {rows.length > 0 && (
          <div className="max-h-64 overflow-y-auto rounded-md border border-border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Название</TableHead>
                  <TableHead>Размер</TableHead>
                  <TableHead>Вес</TableHead>
                  <TableHead>Кол-во</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((r, i) => (
                  <TableRow key={i}>
                    <TableCell>{r.name}</TableCell>
                    <TableCell>
                      {r.length}×{r.width}×{r.height}
                    </TableCell>
                    <TableCell>{r.weight} кг</TableCell>
                    <TableCell>{r.quantity}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        <DialogFooter>
          <Button onClick={handleImport} disabled={rows.length === 0}>
            Импортировать ({rows.length})
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
