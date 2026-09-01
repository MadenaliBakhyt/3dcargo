import { describe, expect, it } from "vitest";

import { TRANSPORT_PRESETS, transportFloorAreaM2, transportVolumeM3 } from "@/lib/transportPresets";

describe("transportPresets", () => {
  it("exposes all truck/container/trailer templates with unique ids", () => {
    expect(TRANSPORT_PRESETS.length).toBeGreaterThanOrEqual(10);
    const ids = TRANSPORT_PRESETS.map((t) => t.id);
    expect(new Set(ids).size).toBe(TRANSPORT_PRESETS.length);
  });

  it("includes the trawl, tent, and car-carrier presets", () => {
    const ids = TRANSPORT_PRESETS.map((t) => t.id);
    expect(ids).toEqual(
      expect.arrayContaining(["flatbed-trawl", "tent-105", "tent-120", "car-carrier"])
    );
  });

  it("computes the euro truck volume as ~88.3 m3", () => {
    const euroTruck = TRANSPORT_PRESETS.find((t) => t.id === "euro-truck-86")!;
    expect(transportVolumeM3(euroTruck)).toBeCloseTo(88.298, 2);
  });

  it("computes floor area in m2", () => {
    const euroTruck = TRANSPORT_PRESETS.find((t) => t.id === "euro-truck-86")!;
    expect(transportFloorAreaM2(euroTruck)).toBeCloseTo(33.32, 1);
  });
});
