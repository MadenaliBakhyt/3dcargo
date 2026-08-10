import type { PackageType } from "@/types";

export interface CargoTemplate {
  id: string;
  name: string;
  length: number;
  width: number;
  height: number;
  packageType: PackageType;
}

export const CARGO_TEMPLATES: CargoTemplate[] = [
  { id: "euro-pallet", name: "EURO PALLET", length: 120, width: 80, height: 15, packageType: "pallet" },
  { id: "us-pallet", name: "US PALLET", length: 120, width: 120, height: 15, packageType: "pallet" },
  { id: "fin-pallet", name: "FIN PALLET", length: 120, width: 100, height: 15, packageType: "pallet" },
  { id: "box", name: "BOX", length: 100, width: 60, height: 80, packageType: "box" },
  { id: "barrel", name: "BARREL", length: 60, width: 60, height: 90, packageType: "barrel" },
];

export const PACKAGE_TYPE_LABELS: Record<PackageType, string> = {
  box: "Коробка",
  pallet: "Паллета",
  crate: "Ящик",
  barrel: "Бочка",
  sack: "Мешок",
  palletized: "Паллетированный груз",
  non_standard: "Нестандартный",
  other: "Другое",
};

export const CARGO_COLOR_PALETTE = [
  "#ef4444", "#3b82f6", "#22c55e", "#a855f7", "#78716c",
  "#06b6d4", "#eab308", "#ec4899", "#14b8a6", "#6366f1",
];
