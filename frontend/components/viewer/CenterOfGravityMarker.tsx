import { Line } from "@react-three/drei";

import type { CenterOfGravity } from "@/types";

export function CenterOfGravityMarker({ cog, floorY = 0 }: { cog: CenterOfGravity; floorY?: number }) {
  // backend (x, y, z) -> three (x, z, y)
  const position: [number, number, number] = [cog.x, cog.z, cog.y];
  const color = cog.offsetWarning ? "#ef4444" : "#22c55e";

  return (
    <group>
      <mesh position={position}>
        <sphereGeometry args={[6, 16, 16]} />
        <meshStandardMaterial color={color} />
      </mesh>
      <Line points={[position, [position[0], floorY, position[2]]]} color={color} lineWidth={2} dashed={false} />
    </group>
  );
}
