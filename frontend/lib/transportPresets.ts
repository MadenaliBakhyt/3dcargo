import type { Transport } from "@/types";

// Mirrors backend/app/schemas/transport.py TRANSPORT_PRESETS exactly.
export const TRANSPORT_PRESETS: Transport[] = [
  { id: "euro-truck-86", name: "Еврофура 86 м³", length: 1360, width: 245, height: 265, maxWeight: 22000 },
  { id: "euro-truck-mega-100", name: "Еврофура MEGA 100 м³", length: 1360, width: 245, height: 300, maxWeight: 22000 },
  { id: "euro-truck-36", name: "Еврофура 36 м³", length: 700, width: 220, height: 240, maxWeight: 10000 },
  { id: "container-20", name: "Контейнер 20'", length: 589, width: 235, height: 239, maxWeight: 24800 },
  { id: "container-40", name: "Контейнер 40'", length: 1203, width: 235, height: 239, maxWeight: 28470 },
  { id: "container-40-hc", name: "Контейнер 40' HC", length: 1203, width: 235, height: 270, maxWeight: 28490 },
];

export function transportVolumeM3(t: Transport): number {
  return (t.length * t.width * t.height) / 1_000_000;
}

export function transportFloorAreaM2(t: Transport): number {
  return (t.length * t.width) / 10_000;
}
