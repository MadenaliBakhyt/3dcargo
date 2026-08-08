import { Edges } from "@react-three/drei";

export type ContainerMode = "walls" | "transparent" | "hidden";

interface TruckContainerProps {
  length: number;
  width: number;
  height: number;
  mode: ContainerMode;
}

export function TruckContainer({ length, width, height, mode }: TruckContainerProps) {
  const center: [number, number, number] = [length / 2, height / 2, width / 2];

  return (
    <group>
      {/* Floor */}
      <mesh position={[length / 2, 0, width / 2]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <planeGeometry args={[length, width]} />
        <meshStandardMaterial color="#d4d4d8" side={2} />
      </mesh>

      {mode !== "hidden" && (
        <mesh position={center}>
          <boxGeometry args={[length, height, width]} />
          <meshStandardMaterial
            color="#94a3b8"
            transparent
            opacity={mode === "walls" ? 0.06 : 0.03}
            depthWrite={false}
            side={2}
          />
          <Edges color="#64748b" />
        </mesh>
      )}
    </group>
  );
}
