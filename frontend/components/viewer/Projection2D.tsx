import type { Placement } from "@/types";

export type ProjectionAxis = "top" | "front" | "side";

interface Projection2DProps {
  axis: ProjectionAxis;
  truckLength: number;
  truckWidth: number;
  truckHeight: number;
  placements: Placement[];
}

const AXIS_CONFIG: Record<ProjectionAxis, { label: string; dims: (t: { l: number; w: number; h: number }) => [number, number] }> = {
  top: { label: "Вид сверху (X × Y)", dims: (t) => [t.l, t.w] },
  front: { label: "Вид спереди (X × Z)", dims: (t) => [t.l, t.h] },
  side: { label: "Вид сбоку (Y × Z)", dims: (t) => [t.w, t.h] },
};

function rectFor(axis: ProjectionAxis, p: Placement) {
  switch (axis) {
    case "top":
      return { a: p.x, b: p.y, w: p.length, h: p.width };
    case "front":
      return { a: p.x, b: p.z, w: p.length, h: p.height };
    case "side":
      return { a: p.y, b: p.z, w: p.width, h: p.height };
  }
}

export function Projection2D({ axis, truckLength, truckWidth, truckHeight, placements }: Projection2DProps) {
  const [dimA, dimB] = AXIS_CONFIG[axis].dims({ l: truckLength, w: truckWidth, h: truckHeight });
  const padding = Math.max(dimA, dimB) * 0.03;
  const viewW = dimA + padding * 2;
  const viewH = dimB + padding * 2;

  return (
    <svg viewBox={`${-padding} ${-padding} ${viewW} ${viewH}`} className="h-full w-full" preserveAspectRatio="xMidYMid meet">
      <g transform={`translate(0, ${dimB}) scale(1, -1)`}>
        <rect x={0} y={0} width={dimA} height={dimB} fill="none" stroke="#94a3b8" strokeWidth={dimA * 0.003} />
        {placements
          .slice()
          .sort((p1, p2) => p1.z - p2.z)
          .map((p) => {
            const r = rectFor(axis, p);
            return (
              <rect
                key={p.instanceId}
                x={r.a}
                y={r.b}
                width={r.w}
                height={r.h}
                fill={p.color}
                fillOpacity={0.75}
                stroke="#1f2937"
                strokeWidth={Math.max(dimA, dimB) * 0.0015}
              >
                <title>
                  {p.cargoName} ({r.w}×{r.h} см, {p.weight} кг)
                </title>
              </rect>
            );
          })}
      </g>
    </svg>
  );
}
