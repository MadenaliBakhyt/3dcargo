import { downloadText } from "@/lib/export/downloadFile";
import type { CalculationResponse } from "@/types";

const HEADER = [
  "cargo_id",
  "cargo_name",
  "truck_id",
  "x",
  "y",
  "z",
  "length",
  "width",
  "height",
  "weight",
  "rotation",
  "layer",
  "loading_order",
];

export function exportPlacementsCsv(result: CalculationResponse, filename = "placements.csv"): void {
  const rows = result.placements
    .slice()
    .sort((a, b) => a.loadingOrder - b.loadingOrder)
    .map((p) =>
      [
        p.cargoId,
        p.cargoName,
        p.truckId,
        p.x,
        p.y,
        p.z,
        p.length,
        p.width,
        p.height,
        p.weight,
        p.orientationCode,
        p.layer,
        p.loadingOrder,
      ]
        .map((v) => (typeof v === "string" && v.includes(",") ? `"${v}"` : v))
        .join(",")
    );

  const csv = [HEADER.join(","), ...rows].join("\n");
  downloadText(csv, filename, "text/csv;charset=utf-8");
}
