"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { generateId } from "@/lib/utils";
import { transportFormSchema, type TransportFormValues } from "@/lib/validation";
import type { Transport } from "@/types";
import { Plus } from "lucide-react";

interface CustomTransportDialogProps {
  onCreate: (transport: Transport) => void;
}

export function CustomTransportDialog({ onCreate }: CustomTransportDialogProps) {
  const [open, setOpen] = useState(false);
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<TransportFormValues>({
    resolver: zodResolver(transportFormSchema),
    defaultValues: { name: "", length: undefined, width: undefined, height: undefined, maxWeight: undefined },
  });

  const onSubmit = (values: TransportFormValues) => {
    onCreate({
      id: generateId("transport"),
      name: values.name,
      length: values.length,
      width: values.width,
      height: values.height,
      maxWeight: values.maxWeight,
    });
    reset();
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="w-full">
          <Plus /> Создать свой транспорт
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Свой транспорт</DialogTitle>
          <DialogDescription>Размеры в сантиметрах, грузоподъёмность в килограммах.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="grid gap-3">
          <div className="grid gap-1.5">
            <Label htmlFor="t-name">Название</Label>
            <Input id="t-name" placeholder="Например, Тентованный 13.6" {...register("name")} />
            {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="grid gap-1.5">
              <Label htmlFor="t-length">Длина, см</Label>
              <Input id="t-length" type="number" step="any" {...register("length")} />
              {errors.length && <p className="text-xs text-destructive">{errors.length.message}</p>}
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="t-width">Ширина, см</Label>
              <Input id="t-width" type="number" step="any" {...register("width")} />
              {errors.width && <p className="text-xs text-destructive">{errors.width.message}</p>}
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="t-height">Высота, см</Label>
              <Input id="t-height" type="number" step="any" {...register("height")} />
              {errors.height && <p className="text-xs text-destructive">{errors.height.message}</p>}
            </div>
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="t-weight">Максимальный вес, кг</Label>
            <Input id="t-weight" type="number" step="any" {...register("maxWeight")} />
            {errors.maxWeight && <p className="text-xs text-destructive">{errors.maxWeight.message}</p>}
          </div>
          <DialogFooter>
            <Button type="submit">Создать транспорт</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
