// Backend coordinate system: X = truck length, Y = truck width, Z = truck height (up), origin at the
// front-bottom-left corner. three.js uses Y-up, so we map backend (x, y, z) -> three (x, z, y).

export function toThreePosition(
  x: number,
  y: number,
  z: number,
  length: number,
  width: number,
  height: number
): [number, number, number] {
  return [x + length / 2, z + height / 2, y + width / 2];
}

export function toThreeSize(length: number, width: number, height: number): [number, number, number] {
  return [length, height, width];
}
