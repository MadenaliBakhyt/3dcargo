import { describe, expect, it } from "vitest";

import { cargoFormSchema, transportFormSchema } from "@/lib/validation";

describe("transportFormSchema", () => {
  it("accepts a valid transport", () => {
    const result = transportFormSchema.safeParse({ name: "Truck", length: 100, width: 50, height: 40, maxWeight: 1000 });
    expect(result.success).toBe(true);
  });

  it("rejects a missing name with a Russian message", () => {
    const result = transportFormSchema.safeParse({ name: "", length: 100, width: 50, height: 40, maxWeight: 1000 });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]!.message).toMatch(/название/i);
    }
  });

  it("rejects non-positive length", () => {
    const result = transportFormSchema.safeParse({ name: "Truck", length: 0, width: 50, height: 40, maxWeight: 1000 });
    expect(result.success).toBe(false);
  });
});

describe("cargoFormSchema", () => {
  const base = {
    name: "Pallet",
    length: 120,
    width: 80,
    height: 100,
    weight: 50,
    quantity: 1,
    color: "#f97316",
    packageType: "pallet" as const,
    allowRotation: true,
    allowVerticalRotation: false,
    stackable: true,
    maxStackHeight: null,
    maxStackTiers: null,
    fragile: false,
    maxTopLoad: null,
    priority: "medium" as const,
    description: "",
  };

  it("accepts a valid cargo definition", () => {
    expect(cargoFormSchema.safeParse(base).success).toBe(true);
  });

  it("rejects quantity below 1", () => {
    const result = cargoFormSchema.safeParse({ ...base, quantity: 0 });
    expect(result.success).toBe(false);
  });

  it("rejects negative weight", () => {
    const result = cargoFormSchema.safeParse({ ...base, weight: -5 });
    expect(result.success).toBe(false);
  });

  it("allows null for optional stacking/top-load limits", () => {
    const result = cargoFormSchema.safeParse({ ...base, maxStackHeight: null, maxTopLoad: null });
    expect(result.success).toBe(true);
  });
});
