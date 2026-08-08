import { beforeEach, describe, expect, it } from "vitest";

import { useCargoStore } from "@/stores/useCargoStore";
import { TRANSPORT_PRESETS } from "@/lib/transportPresets";
import type { CargoType } from "@/types";

const newCargo: Omit<CargoType, "id"> = {
  name: "Pallet A",
  length: 120,
  width: 80,
  height: 160,
  weight: 450,
  quantity: 15,
  color: "#f97316",
  packageType: "pallet",
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

describe("useCargoStore", () => {
  beforeEach(() => {
    useCargoStore.getState().resetProject();
  });

  it("sets the transport and clears any previous result", () => {
    useCargoStore.getState().setTransport(TRANSPORT_PRESETS[0]!);
    expect(useCargoStore.getState().transport?.id).toBe(TRANSPORT_PRESETS[0]!.id);
  });

  it("adds a cargo type with a generated id", () => {
    useCargoStore.getState().addCargoType(newCargo);
    const { cargoTypes } = useCargoStore.getState();
    expect(cargoTypes).toHaveLength(1);
    expect(cargoTypes[0]!.id).toBeTruthy();
    expect(cargoTypes[0]!.name).toBe("Pallet A");
  });

  it("updates a cargo type by id", () => {
    useCargoStore.getState().addCargoType(newCargo);
    const id = useCargoStore.getState().cargoTypes[0]!.id;
    useCargoStore.getState().updateCargoType(id, { quantity: 20 });
    expect(useCargoStore.getState().cargoTypes[0]!.quantity).toBe(20);
  });

  it("removes a cargo type by id", () => {
    useCargoStore.getState().addCargoType(newCargo);
    const id = useCargoStore.getState().cargoTypes[0]!.id;
    useCargoStore.getState().removeCargoType(id);
    expect(useCargoStore.getState().cargoTypes).toHaveLength(0);
  });

  it("duplicates a cargo type with a new id and adjusted name", () => {
    useCargoStore.getState().addCargoType(newCargo);
    const id = useCargoStore.getState().cargoTypes[0]!.id;
    useCargoStore.getState().duplicateCargoType(id);
    const { cargoTypes } = useCargoStore.getState();
    expect(cargoTypes).toHaveLength(2);
    expect(cargoTypes[1]!.id).not.toBe(id);
    expect(cargoTypes[1]!.name).toContain("копия");
  });

  it("resets the whole project", () => {
    useCargoStore.getState().setTransport(TRANSPORT_PRESETS[0]!);
    useCargoStore.getState().addCargoType(newCargo);
    useCargoStore.getState().resetProject();
    const state = useCargoStore.getState();
    expect(state.transport).toBeNull();
    expect(state.cargoTypes).toHaveLength(0);
    expect(state.result).toBeNull();
  });
});
