"use client";

import { forwardRef } from "react";
import { Grid } from "@react-three/drei";

import { CameraController, type CameraControllerHandle } from "@/components/viewer/CameraController";
import { CargoInstances } from "@/components/viewer/CargoInstances";
import { CenterOfGravityMarker } from "@/components/viewer/CenterOfGravityMarker";
import { TruckContainer, type ContainerMode } from "@/components/viewer/TruckContainer";
import type { CenterOfGravity, Placement } from "@/types";

interface Scene3DProps {
  length: number;
  width: number;
  height: number;
  placements: Placement[];
  visibleCount?: number;
  containerMode: ContainerMode;
  showGrid: boolean;
  showCog: boolean;
  cog: CenterOfGravity | null;
}

export const Scene3D = forwardRef<CameraControllerHandle, Scene3DProps>(
  ({ length, width, height, placements, visibleCount, containerMode, showGrid, showCog, cog }, ref) => {
    const maxDim = Math.max(length, width, height);

    return (
      <>
        <ambientLight intensity={0.7} />
        <directionalLight position={[length, height * 2, width]} intensity={0.9} castShadow={false} />
        <directionalLight position={[-length * 0.5, height, -width]} intensity={0.3} />

        <TruckContainer length={length} width={width} height={height} mode={containerMode} />
        <CargoInstances placements={placements} visibleCount={visibleCount} />
        {showCog && cog && <CenterOfGravityMarker cog={cog} />}

        {showGrid && (
          <Grid
            position={[length / 2, 0.01, width / 2]}
            args={[length * 1.4, width * 1.4]}
            cellSize={25}
            sectionSize={100}
            cellColor="#cbd5e1"
            sectionColor="#94a3b8"
            fadeDistance={maxDim * 4}
            infiniteGrid={false}
          />
        )}

        <axesHelper args={[Math.max(length, width, height) * 0.15]} />

        <CameraController ref={ref} truckLength={length} truckWidth={width} truckHeight={height} />
      </>
    );
  }
);
Scene3D.displayName = "Scene3D";
