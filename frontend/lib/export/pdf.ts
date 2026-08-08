import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

import { transportVolumeM3 } from "@/lib/transportPresets";
import type { CalculationResponse, CargoType, Transport } from "@/types";

function hexToRgb(hex: string): [number, number, number] {
  const clean = hex.replace("#", "");
  const bigint = parseInt(clean.length === 3 ? clean.split("").map((c) => c + c).join("") : clean, 16);
  return [(bigint >> 16) & 255, (bigint >> 8) & 255, bigint & 255];
}

function drawTopViewScheme(
  doc: jsPDF,
  startY: number,
  transport: Transport,
  placements: CalculationResponse["placements"]
): number {
  const marginX = 14;
  const maxWidth = 182;
  const maxHeight = 70;
  const scale = Math.min(maxWidth / transport.length, maxHeight / transport.width);
  const drawW = transport.length * scale;
  const drawH = transport.width * scale;

  doc.setDrawColor(150);
  doc.rect(marginX, startY, drawW, drawH);

  for (const p of placements) {
    const [r, g, b] = hexToRgb(p.color);
    doc.setFillColor(r, g, b);
    doc.setDrawColor(60);
    doc.rect(marginX + p.x * scale, startY + p.y * scale, p.length * scale, p.width * scale, "FD");
  }

  return startY + drawH + 8;
}

export interface PdfExportInput {
  projectName: string;
  transport: Transport;
  cargoTypes: CargoType[];
  result: CalculationResponse | null;
}

export function exportProjectPdf({ projectName, transport, cargoTypes, result }: PdfExportInput): void {
  const doc = new jsPDF({ unit: "mm", format: "a4" });

  doc.setFontSize(16);
  doc.text("Cargo Loading Planner", 14, 16);
  doc.setFontSize(11);
  doc.text(projectName, 14, 23);
  doc.setFontSize(9);
  doc.setTextColor(120);
  doc.text(`Дата: ${new Date().toLocaleDateString("ru-RU")}`, 14, 28);
  doc.setTextColor(0);

  doc.setFontSize(11);
  doc.text("Транспорт", 14, 37);
  autoTable(doc, {
    startY: 40,
    head: [["Название", "Длина, см", "Ширина, см", "Высота, см", "Объём, м³", "Макс. вес, кг"]],
    body: [
      [
        transport.name,
        String(transport.length),
        String(transport.width),
        String(transport.height),
        transportVolumeM3(transport).toFixed(2),
        String(transport.maxWeight),
      ],
    ],
    theme: "grid",
    styles: { fontSize: 8 },
  });

  const afterTransportY = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 8;

  doc.setFontSize(11);
  doc.text("Список грузов", 14, afterTransportY);
  autoTable(doc, {
    startY: afterTransportY + 3,
    head: [["Название", "Размер, см", "Вес, кг", "Кол-во", "Общий объём, м³", "Общий вес, кг"]],
    body: cargoTypes.map((c) => [
      c.name,
      `${c.length}×${c.width}×${c.height}`,
      String(c.weight),
      String(c.quantity),
      ((c.length * c.width * c.height * c.quantity) / 1_000_000).toFixed(2),
      String(c.weight * c.quantity),
    ]),
    theme: "grid",
    styles: { fontSize: 8 },
  });

  if (result) {
    let y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 8;

    doc.setFontSize(11);
    doc.text("Результат размещения", 14, y);
    autoTable(doc, {
      startY: y + 3,
      body: [
        ["Количество машин", String(result.statistics.truckCount)],
        ["Размещено / всего", `${result.statistics.placedItems} / ${result.statistics.totalCargoItems}`],
        ["Общий вес", `${result.statistics.totalWeight} кг`],
        ["Загрузка по объёму", `${result.statistics.volumeUtilization}%`],
        ["Загрузка по весу", `${result.statistics.weightUtilization}%`],
      ],
      theme: "plain",
      styles: { fontSize: 9 },
    });
    y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 6;

    for (const truck of result.trucks) {
      if (y > 230) {
        doc.addPage();
        y = 16;
      }
      doc.setFontSize(10);
      doc.text(`Схема загрузки: ${truck.name} (вид сверху)`, 14, y);
      y += 4;
      const truckPlacements = result.placements.filter((p) => p.truckId === truck.id);
      y = drawTopViewScheme(doc, y, transport, truckPlacements);
    }
  }

  doc.save(`${projectName || "cargo-loading-plan"}.pdf`);
}
