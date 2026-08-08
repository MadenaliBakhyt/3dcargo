"use client";

import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { CARGO_COLOR_PALETTE, CARGO_TEMPLATES, PACKAGE_TYPE_LABELS } from "@/lib/cargoTemplates";
import { cn } from "@/lib/utils";
import { cargoFormSchema, type CargoFormValues } from "@/lib/validation";
import type { CargoType } from "@/types";

const DEFAULT_VALUES: CargoFormValues = {
  name: "",
  length: 120,
  width: 80,
  height: 100,
  weight: 100,
  quantity: 1,
  color: CARGO_COLOR_PALETTE[0]!,
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
};

interface CargoFormDialogProps {
  mode: "create" | "edit";
  initialValues?: CargoType;
  trigger: React.ReactNode;
  onSubmit: (values: CargoFormValues) => void;
}

export function CargoFormDialog({ mode, initialValues, trigger, onSubmit }: CargoFormDialogProps) {
  const [open, setOpen] = useState(false);
  const [advancedOpen, setAdvancedOpen] = useState(false);

  const {
    register,
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<CargoFormValues>({
    resolver: zodResolver(cargoFormSchema),
    defaultValues: initialValues ?? DEFAULT_VALUES,
  });

  useEffect(() => {
    if (open) {
      reset(initialValues ?? DEFAULT_VALUES);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const stackable = watch("stackable");
  const color = watch("color");

  const applyTemplate = (templateId: string) => {
    const template = CARGO_TEMPLATES.find((t) => t.id === templateId);
    if (!template) return;
    setValue("length", template.length);
    setValue("width", template.width);
    setValue("height", template.height);
    setValue("packageType", template.packageType);
    if (!watch("name")) setValue("name", template.name);
  };

  const submit = (values: CargoFormValues) => {
    onSubmit(values);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>{mode === "create" ? "Добавить груз" : "Редактировать груз"}</DialogTitle>
          <DialogDescription>Размеры в сантиметрах, вес в килограммах.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(submit)} className="grid gap-4">
          {mode === "create" && (
            <div className="grid gap-1.5">
              <Label>Шаблон груза</Label>
              <Select onValueChange={applyTemplate}>
                <SelectTrigger>
                  <SelectValue placeholder="Выбрать из шаблона (необязательно)" />
                </SelectTrigger>
                <SelectContent>
                  {CARGO_TEMPLATES.map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.name} — {t.length}×{t.width}×{t.height} см
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="grid gap-1.5">
            <Label htmlFor="c-name">Название</Label>
            <Input id="c-name" placeholder="Например, Паллета A" {...register("name")} />
            {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
          </div>

          <div className="grid grid-cols-4 gap-3">
            <div className="grid gap-1.5">
              <Label htmlFor="c-length">Длина, см</Label>
              <Input id="c-length" type="number" step="any" {...register("length")} />
              {errors.length && <p className="text-xs text-destructive">{errors.length.message}</p>}
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="c-width">Ширина, см</Label>
              <Input id="c-width" type="number" step="any" {...register("width")} />
              {errors.width && <p className="text-xs text-destructive">{errors.width.message}</p>}
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="c-height">Высота, см</Label>
              <Input id="c-height" type="number" step="any" {...register("height")} />
              {errors.height && <p className="text-xs text-destructive">{errors.height.message}</p>}
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="c-weight">Вес, кг</Label>
              <Input id="c-weight" type="number" step="any" {...register("weight")} />
              {errors.weight && <p className="text-xs text-destructive">{errors.weight.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="grid gap-1.5">
              <Label htmlFor="c-qty">Количество</Label>
              <Input id="c-qty" type="number" step="1" {...register("quantity")} />
              {errors.quantity && <p className="text-xs text-destructive">{errors.quantity.message}</p>}
            </div>
            <div className="grid gap-1.5">
              <Label>Тип упаковки</Label>
              <Controller
                control={control}
                name="packageType"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(PACKAGE_TYPE_LABELS).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
            <div className="grid gap-1.5">
              <Label>Приоритет</Label>
              <Controller
                control={control}
                name="priority"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="high">Высокий</SelectItem>
                      <SelectItem value="medium">Средний</SelectItem>
                      <SelectItem value="low">Низкий</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          </div>

          <div className="grid gap-1.5">
            <Label>Цвет</Label>
            <div className="flex flex-wrap items-center gap-2">
              {CARGO_COLOR_PALETTE.map((c) => (
                <button
                  key={c}
                  type="button"
                  aria-label={`Цвет ${c}`}
                  onClick={() => setValue("color", c)}
                  className={cn(
                    "h-6 w-6 rounded-full border-2 transition-transform",
                    color === c ? "scale-110 border-foreground" : "border-transparent"
                  )}
                  style={{ backgroundColor: c }}
                />
              ))}
              <input
                type="color"
                aria-label="Свой цвет"
                value={color}
                onChange={(e) => setValue("color", e.target.value)}
                className="h-6 w-8 cursor-pointer rounded border border-input bg-transparent"
              />
            </div>
          </div>

          <div className="grid gap-3 rounded-md border border-border p-3">
            <div className="flex items-center justify-between">
              <Label htmlFor="c-rotation">Разрешить вращение (горизонтальное)</Label>
              <Controller
                control={control}
                name="allowRotation"
                render={({ field }) => (
                  <Switch id="c-rotation" checked={field.value} onCheckedChange={field.onChange} />
                )}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="c-stackable">Можно ставить друг на друга</Label>
              <Controller
                control={control}
                name="stackable"
                render={({ field }) => (
                  <Switch id="c-stackable" checked={field.value} onCheckedChange={field.onChange} />
                )}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="c-fragile">Хрупкий груз</Label>
              <Controller
                control={control}
                name="fragile"
                render={({ field }) => <Switch id="c-fragile" checked={field.value} onCheckedChange={field.onChange} />}
              />
            </div>
          </div>

          <button
            type="button"
            onClick={() => setAdvancedOpen((v) => !v)}
            className="text-left text-xs font-medium text-primary hover:underline"
          >
            {advancedOpen ? "Скрыть дополнительные настройки" : "Дополнительные настройки"}
          </button>

          {advancedOpen && (
            <div className="grid gap-3 rounded-md border border-border p-3">
              <div className="flex items-center justify-between">
                <Label htmlFor="c-vertical">Разрешить вертикальный поворот</Label>
                <Controller
                  control={control}
                  name="allowVerticalRotation"
                  render={({ field }) => (
                    <Switch id="c-vertical" checked={field.value} onCheckedChange={field.onChange} />
                  )}
                />
              </div>

              {stackable && (
                <div className="grid grid-cols-2 gap-3">
                  <div className="grid gap-1.5">
                    <Label htmlFor="c-max-stack-height">Макс. высота штабеля, см</Label>
                    <Input
                      id="c-max-stack-height"
                      type="number"
                      step="any"
                      placeholder="Без ограничения"
                      {...register("maxStackHeight", { setValueAs: (v) => (v === "" ? null : Number(v)) })}
                    />
                  </div>
                  <div className="grid gap-1.5">
                    <Label htmlFor="c-max-tiers">Макс. количество ярусов</Label>
                    <Input
                      id="c-max-tiers"
                      type="number"
                      step="1"
                      placeholder="Без ограничения"
                      {...register("maxStackTiers", { setValueAs: (v) => (v === "" ? null : Number(v)) })}
                    />
                  </div>
                </div>
              )}

              <div className="grid gap-1.5">
                <Label htmlFor="c-top-load">Максимальная нагрузка сверху, кг</Label>
                <Input
                  id="c-top-load"
                  type="number"
                  step="any"
                  placeholder="Без ограничения (0 — нельзя ставить сверху)"
                  {...register("maxTopLoad", { setValueAs: (v) => (v === "" ? null : Number(v)) })}
                />
              </div>

              <div className="grid gap-1.5">
                <Label htmlFor="c-description">Описание</Label>
                <Textarea id="c-description" {...register("description")} />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button type="submit">{mode === "create" ? "Добавить груз" : "Сохранить изменения"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
