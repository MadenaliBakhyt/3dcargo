import { create } from "zustand";
import { persist } from "zustand/middleware";

import { generateId } from "@/lib/utils";
import type { CalculationResponse, CalculationSettings, CargoType, Transport } from "@/types";

const DEFAULT_SETTINGS: CalculationSettings = {
  maxTrucks: 50,
  supportRatioThreshold: 0.75,
};

export interface CargoStoreState {
  projectName: string;
  transport: Transport | null;
  cargoTypes: CargoType[];
  settings: CalculationSettings;
  result: CalculationResponse | null;
  isCalculating: boolean;
  calculationError: string | null;
  selectedTruckId: string | null;
  selectedInstanceId: string | null;

  setProjectName: (name: string) => void;
  setTransport: (transport: Transport) => void;
  addCargoType: (cargo: Omit<CargoType, "id">) => void;
  updateCargoType: (id: string, patch: Partial<CargoType>) => void;
  removeCargoType: (id: string) => void;
  duplicateCargoType: (id: string) => void;
  setCargoTypes: (cargoTypes: CargoType[]) => void;
  setSettings: (settings: Partial<CalculationSettings>) => void;

  startCalculating: () => void;
  setResult: (result: CalculationResponse) => void;
  setCalculationError: (error: string | null) => void;

  setSelectedTruckId: (id: string | null) => void;
  setSelectedInstanceId: (id: string | null) => void;

  resetProject: () => void;
  loadProject: (data: {
    projectName?: string;
    transport: Transport | null;
    cargoTypes: CargoType[];
    settings?: CalculationSettings;
    result?: CalculationResponse | null;
  }) => void;
}

export const useCargoStore = create<CargoStoreState>()(
  persist(
    (set) => ({
      projectName: "Новый расчёт",
      transport: null,
      cargoTypes: [],
      settings: DEFAULT_SETTINGS,
      result: null,
      isCalculating: false,
      calculationError: null,
      selectedTruckId: null,
      selectedInstanceId: null,

      setProjectName: (name) => set({ projectName: name }),

      setTransport: (transport) => set({ transport, result: null }),

      addCargoType: (cargo) =>
        set((state) => ({
          cargoTypes: [...state.cargoTypes, { ...cargo, id: generateId("cargo") }],
          result: null,
        })),

      updateCargoType: (id, patch) =>
        set((state) => ({
          cargoTypes: state.cargoTypes.map((c) => (c.id === id ? { ...c, ...patch } : c)),
          result: null,
        })),

      removeCargoType: (id) =>
        set((state) => ({
          cargoTypes: state.cargoTypes.filter((c) => c.id !== id),
          result: null,
        })),

      duplicateCargoType: (id) =>
        set((state) => {
          const original = state.cargoTypes.find((c) => c.id === id);
          if (!original) return state;
          const copy: CargoType = { ...original, id: generateId("cargo"), name: `${original.name} (копия)` };
          const index = state.cargoTypes.findIndex((c) => c.id === id);
          const cargoTypes = [...state.cargoTypes];
          cargoTypes.splice(index + 1, 0, copy);
          return { cargoTypes, result: null };
        }),

      setCargoTypes: (cargoTypes) => set({ cargoTypes, result: null }),

      setSettings: (settings) =>
        set((state) => ({ settings: { ...state.settings, ...settings }, result: null })),

      startCalculating: () => set({ isCalculating: true, calculationError: null }),

      setResult: (result) =>
        set({
          result,
          isCalculating: false,
          calculationError: null,
          selectedTruckId: result.trucks[0]?.id ?? null,
          selectedInstanceId: null,
        }),

      setCalculationError: (error) => set({ calculationError: error, isCalculating: false }),

      setSelectedTruckId: (id) => set({ selectedTruckId: id, selectedInstanceId: null }),
      setSelectedInstanceId: (id) => set({ selectedInstanceId: id }),

      resetProject: () =>
        set({
          projectName: "Новый расчёт",
          transport: null,
          cargoTypes: [],
          settings: DEFAULT_SETTINGS,
          result: null,
          isCalculating: false,
          calculationError: null,
          selectedTruckId: null,
          selectedInstanceId: null,
        }),

      loadProject: (data) =>
        set({
          projectName: data.projectName ?? "Загруженный проект",
          transport: data.transport,
          cargoTypes: data.cargoTypes,
          settings: data.settings ?? DEFAULT_SETTINGS,
          result: data.result ?? null,
          selectedTruckId: data.result?.trucks[0]?.id ?? null,
          selectedInstanceId: null,
        }),
    }),
    {
      name: "cargo-loading-planner-project",
      version: 1,
    }
  )
);
