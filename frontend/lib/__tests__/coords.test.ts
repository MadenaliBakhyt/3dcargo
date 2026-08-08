import { describe, expect, it } from "vitest";

import { toThreePosition, toThreeSize } from "@/lib/coords";

describe("coords mapping", () => {
  it("maps backend (x, y, z) to three.js (x, z, y) centered on the box", () => {
    const pos = toThreePosition(100, 50, 20, 40, 30, 10);
    expect(pos).toEqual([100 + 20, 20 + 5, 50 + 15]);
  });

  it("maps backend (length, width, height) to three.js (x, y, z) size", () => {
    const size = toThreeSize(120, 80, 160);
    expect(size).toEqual([120, 160, 80]);
  });

  it("centers correctly for an item placed at the origin", () => {
    const pos = toThreePosition(0, 0, 0, 100, 80, 60);
    expect(pos).toEqual([50, 30, 40]);
  });
});
