"use client";

import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import { OrbitControls } from "@react-three/drei";
import { useThree } from "@react-three/fiber";
import type { OrbitControls as OrbitControlsImpl } from "three-stdlib";

export type CameraView = "reset" | "top" | "front" | "side" | "fit";

export interface CameraControllerHandle {
  setView: (view: CameraView) => void;
}

interface CameraControllerProps {
  truckLength: number;
  truckWidth: number;
  truckHeight: number;
}

export const CameraController = forwardRef<CameraControllerHandle, CameraControllerProps>(
  ({ truckLength, truckWidth, truckHeight }, ref) => {
    const controlsRef = useRef<OrbitControlsImpl>(null);
    const { camera } = useThree();

    const center: [number, number, number] = [truckLength / 2, truckHeight / 2, truckWidth / 2];
    const maxDim = Math.max(truckLength, truckWidth, truckHeight);

    const applyView = (view: CameraView) => {
      const controls = controlsRef.current;
      if (!controls) return;
      controls.target.set(...center);

      switch (view) {
        case "top":
          camera.position.set(center[0], truckLength * 1.2, center[2]);
          break;
        case "front":
          camera.position.set(center[0], center[1], truckWidth * 2.5 + truckLength * 0.3);
          break;
        case "side":
          camera.position.set(truckLength * 1.6 + center[0], center[1], center[2]);
          break;
        case "reset":
        case "fit":
        default:
          camera.position.set(
            center[0] - maxDim * 0.7,
            center[1] + maxDim * 0.7,
            center[2] + maxDim * 1.1
          );
          break;
      }
      camera.up.set(0, 1, 0);
      camera.lookAt(...center);
      controls.update();
    };

    useImperativeHandle(ref, () => ({ setView: applyView }));

    // eslint-disable-next-line react-hooks/exhaustive-deps
    useEffect(() => applyView("reset"), [truckLength, truckWidth, truckHeight]);

    return (
      <OrbitControls
        ref={controlsRef}
        target={center}
        makeDefault
        enableDamping
        dampingFactor={0.1}
        minDistance={20}
        maxDistance={maxDim * 5}
      />
    );
  }
);
CameraController.displayName = "CameraController";
