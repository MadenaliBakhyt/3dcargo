import { z } from "zod";

export const transportFormSchema = z.object({
  name: z.string().min(1, "Введите название транспорта."),
  length: z.coerce.number({ invalid_type_error: "Введите длину транспорта." }).positive("Длина должна быть больше 0."),
  width: z.coerce.number({ invalid_type_error: "Введите ширину транспорта." }).positive("Ширина должна быть больше 0."),
  height: z.coerce.number({ invalid_type_error: "Введите высоту транспорта." }).positive("Высота должна быть больше 0."),
  maxWeight: z.coerce
    .number({ invalid_type_error: "Введите грузоподъёмность." })
    .positive("Грузоподъёмность должна быть больше 0."),
});

export type TransportFormValues = z.infer<typeof transportFormSchema>;

export const cargoFormSchema = z.object({
  name: z.string().min(1, "Введите название груза."),
  length: z.coerce.number({ invalid_type_error: "Введите длину." }).positive("Длина должна быть больше 0."),
  width: z.coerce.number({ invalid_type_error: "Введите ширину." }).positive("Ширина должна быть больше 0."),
  height: z.coerce.number({ invalid_type_error: "Введите высоту." }).positive("Высота должна быть больше 0."),
  weight: z.coerce.number({ invalid_type_error: "Введите вес." }).min(0, "Вес не может быть отрицательным."),
  quantity: z.coerce
    .number({ invalid_type_error: "Введите количество." })
    .int("Количество должно быть целым числом.")
    .min(1, "Количество должно быть больше 0."),
  color: z.string().min(1),
  packageType: z.enum([
    "box",
    "pallet",
    "crate",
    "barrel",
    "sack",
    "palletized",
    "non_standard",
    "other",
  ]),
  allowRotation: z.boolean(),
  allowVerticalRotation: z.boolean(),
  stackable: z.boolean(),
  maxStackHeight: z.coerce.number().positive().nullable(),
  maxStackTiers: z.coerce.number().int().min(1).nullable(),
  fragile: z.boolean(),
  maxTopLoad: z.coerce.number().min(0).nullable(),
  priority: z.enum(["high", "medium", "low"]),
  description: z.string(),
});

export type CargoFormValues = z.infer<typeof cargoFormSchema>;
