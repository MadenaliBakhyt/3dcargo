"use client";

import { useState } from "react";
import { Html, Instance, Instances } from "@react-three/drei";
import type { ThreeEvent } from "@react-three/fiber";

import { toThreePosition, toThreeSize } from "@/lib/coords";
import { useCargoStore } from "@/stores/useCargoStore";
import type { Placement } from "@/types";

interface CargoInstancesProps {
  placements: Placement[];
  visibleCount?: number;
}

export function CargoInstances({ placements, visibleCount }: CargoInstancesProps) {
  const selectedInstanceId = useCargoStore((s) => s.selectedInstanceId);
  const setSelectedInstanceId = useCargoStore((s) => s.setSelectedInstanceId);
  const [hovered, setHovered] = useState<Placement | null>(null);

  const visible = visibleCount != null ? placements.slice(0, visibleCount) : placements;
  const selected = placements.find((p) => p.instanceId === selectedInstanceId);

  // drei's <Instances> allocates its InstancedMesh buffer once, sized by `limit`, and does not
  // grow it later -- reusing the same instance across renders while `placements` grows (e.g. once
  // a calculation result comes in after mounting empty) silently overflows the GPU buffer and
  // nothing renders. Keying on the full placement count forces a fresh, correctly-sized mesh
  // whenever the truck's item count changes; `range` alone still drives the loading animation.
  const instancesKey = `${placements[0]?.truckId ?? "empty"}-${placements.length}`;

  return (
    <group>
      <Instances key={instancesKey} limit={Math.max(placements.length, 1)} range={visible.length}>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial roughness={0.7} metalness={0.05} />
        {visible.map((p) => {
          const isSelected = p.instanceId === selectedInstanceId;
          return (
            <Instance
              key={p.instanceId}
              position={toThreePosition(p.x, p.y, p.z, p.length, p.width, p.height)}
              scale={toThreeSize(p.length * 0.985, p.width * 0.985, p.height * 0.985)}
              color={p.color}
              onClick={(e: ThreeEvent<MouseEvent>) => {
                e.stopPropagation();
                setSelectedInstanceId(isSelected ? null : p.instanceId);
              }}
              onPointerOver={(e: ThreeEvent<PointerEvent>) => {
                e.stopPropagation();
                setHovered(p);
              }}
              onPointerOut={() => setHovered((h) => (h?.instanceId === p.instanceId ? null : h))}
            />
          );
        })}
      </Instances>

      {selected && (
        <mesh
          position={toThreePosition(selected.x, selected.y, selected.z, selected.length, selected.width, selected.height)}
        >
          <boxGeometry args={toThreeSize(selected.length * 1.01, selected.width * 1.01, selected.height * 1.01)} />
          <meshBasicMaterial color="#ef4444" wireframe />
        </mesh>
      )}

      {hovered && (
        <Html
          position={toThreePosition(hovered.x, hovered.y, hovered.z, hovered.length, hovered.width, hovered.height)}
          center
          distanceFactor={undefined}
          style={{ pointerEvents: "none" }}
        >
          <div className="pointer-events-none -translate-y-6 whitespace-nowrap rounded-md border border-border bg-popover px-2 py-1 text-xs text-popover-foreground shadow-md">
            <div className="font-medium">{hovered.cargoName}</div>
            <div className="text-muted-foreground">
              {hovered.length} × {hovered.width} × {hovered.height} см · {hovered.weight} кг
            </div>
          </div>
        </Html>
      )}
    </group>
  );
}
