"use client";

import { useMemo, useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";

import type { CameraControllerHandle } from "@/components/viewer/CameraController";
import { LoadingAnimationControls } from "@/components/viewer/LoadingAnimationControls";
import { Scene3D } from "@/components/viewer/Scene3D";
import { SelectedItemPanel } from "@/components/viewer/SelectedItemPanel";
import type { ContainerMode } from "@/components/viewer/TruckContainer";
import { ViewerToolbar } from "@/components/viewer/ViewerToolbar";
import { useLoadingAnimation } from "@/hooks/useLoadingAnimation";
import { useCargoStore } from "@/stores/useCargoStore";

export function Viewer() {
  const transport = useCargoStore((s) => s.transport);
  const result = useCargoStore((s) => s.result);
  const selectedTruckId = useCargoStore((s) => s.selectedTruckId);

  const [containerMode, setContainerMode] = useState<ContainerMode>("walls");
  const [showGrid, setShowGrid] = useState(true);
  const [showCog, setShowCog] = useState(false);
  const cameraRef = useRef<CameraControllerHandle>(null);

  const placements = useMemo(() => {
    if (!result || !selectedTruckId) return [];
    return result.placements
      .filter((p) => p.truckId === selectedTruckId)
      .sort((a, b) => a.loadingOrder - b.loadingOrder);
  }, [result, selectedTruckId]);

  const truckStats = result?.truckStatistics.find((t) => t.truckId === selectedTruckId) ?? null;
  const animation = useLoadingAnimation(placements.length);

  if (!transport) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
        Выберите транспорт для начала.
      </div>
    );
  }

  const dims = { length: transport.length, width: transport.width, height: transport.height };

  return (
    <div className="relative flex h-full flex-col">
      <ViewerToolbar
        onSetView={(view) => cameraRef.current?.setView(view)}
        containerMode={containerMode}
        onContainerModeChange={setContainerMode}
        showGrid={showGrid}
        onToggleGrid={() => setShowGrid((v) => !v)}
        showCog={showCog}
        onToggleCog={() => setShowCog((v) => !v)}
      />

      <div className="relative flex-1">
        <Canvas shadows={false} camera={{ fov: 45, near: 1, far: 20000 }}>
          <color attach="background" args={["#f4f4f5"]} />
          <Scene3D
            ref={cameraRef}
            length={dims.length}
            width={dims.width}
            height={dims.height}
            placements={placements}
            visibleCount={animation.visibleCount}
            containerMode={containerMode}
            showGrid={showGrid}
            showCog={showCog}
            cog={truckStats?.centerOfGravity ?? null}
          />
        </Canvas>

        {!result && (
          <div className="pointer-events-none absolute inset-x-0 bottom-4 flex justify-center">
            <span className="rounded-full border border-border bg-card/90 px-3 py-1 text-xs text-muted-foreground shadow-sm">
              После расчёта здесь появится схема загрузки
            </span>
          </div>
        )}

        <SelectedItemPanel />
      </div>

      {result && placements.length > 0 && (
        <LoadingAnimationControls
          isPlaying={animation.isPlaying}
          onPlay={animation.play}
          onPause={animation.pause}
          onReset={animation.reset}
          speed={animation.speed}
          onSpeedChange={animation.setSpeed}
          visibleCount={animation.visibleCount}
          totalCount={placements.length}
        />
      )}
    </div>
  );
}

