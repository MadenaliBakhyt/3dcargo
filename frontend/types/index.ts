// Types mirroring the backend Pydantic schemas (camelCase over the wire).
// Backend units: length/width/height in cm, weight in kg, volume in m3.

export type PackageType =
  | "box"
  | "pallet"
  | "crate"
  | "barrel"
  | "sack"
  | "palletized"
  | "non_standard"
  | "other";

export type Priority = "high" | "medium" | "low";

export interface Transport {
  id: string;
  name: string;
  length: number;
  width: number;
  height: number;
  maxWeight: number;
}

export interface CargoType {
  id: string;
  name: string;
  length: number;
  width: number;
  height: number;
  weight: number;
  quantity: number;
  color: string;
  packageType: PackageType;
  allowRotation: boolean;
  allowVerticalRotation: boolean;
  stackable: boolean;
  maxStackHeight: number | null;
  maxStackTiers: number | null;
  fragile: boolean;
  maxTopLoad: number | null;
  priority: Priority;
  description: string;
}

export type LoadingSide = "left" | "right";

export interface CalculationSettings {
  maxTrucks: number;
  supportRatioThreshold: number;
  loadingSide: LoadingSide;
  preferStacking: boolean;
}

export interface CalculationRequest {
  transport: Transport;
  cargoTypes: CargoType[];
  settings: CalculationSettings;
}

export interface Rotation {
  x: number;
  y: number;
  z: number;
}

export interface Placement {
  instanceId: string;
  cargoId: string;
  cargoName: string;
  truckId: string;
  x: number;
  y: number;
  z: number;
  length: number;
  width: number;
  height: number;
  rotation: Rotation;
  orientationCode: string;
  weight: number;
  color: string;
  packageType: PackageType;
  fragile: boolean;
  priority: Priority;
  layer: number;
  loadingOrder: number;
  supportedBy: string[];
}

export interface UnplacedItem {
  instanceId: string;
  cargoTypeId: string;
  name: string;
  reason: string;
}

export interface CenterOfGravity {
  x: number;
  y: number;
  z: number;
  offsetWarning: boolean;
}

export interface TruckSummary {
  id: string;
  name: string;
  length: number;
  width: number;
  height: number;
  maxWeight: number;
}

export interface TruckStatistics {
  truckId: string;
  placedCount: number;
  totalWeight: number;
  totalVolumeM3: number;
  volumeUtilization: number;
  weightUtilization: number;
  floorUtilization: number;
  freeVolumeM3: number;
  centerOfGravity: CenterOfGravity;
}

export interface OverallStatistics {
  truckCount: number;
  totalCargoItems: number;
  placedItems: number;
  unplacedItems: number;
  totalWeight: number;
  totalVolumeM3: number;
  volumeUtilization: number;
  weightUtilization: number;
}

export interface CalculationResponse {
  success: boolean;
  trucks: TruckSummary[];
  placements: Placement[];
  statistics: OverallStatistics;
  truckStatistics: TruckStatistics[];
  unplaced: UnplacedItem[];
  warnings: string[];
}

export interface Project {
  version: 1;
  name: string;
  createdAt: string;
  transport: Transport | null;
  cargoTypes: CargoType[];
  settings: CalculationSettings;
  result: CalculationResponse | null;
}
