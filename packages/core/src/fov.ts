import { blocksSight, HEIGHT, index, within, WIDTH, type Tile } from './world.js';

/** Deterministic Bresenham line of sight, including the blocking cell. */
export function hasLineOfSight(tiles: readonly Tile[], x0: number, y0: number, x1: number, y1: number): boolean {
  let x = x0, y = y0;
  const dx = Math.abs(x1 - x0), dy = Math.abs(y1 - y0);
  const sx = x0 < x1 ? 1 : -1, sy = y0 < y1 ? 1 : -1;
  let err = dx - dy;
  while (x !== x1 || y !== y1) {
    const e2 = 2 * err;
    if (e2 > -dy) { err -= dy; x += sx; }
    if (e2 < dx) { err += dx; y += sy; }
    if (!within(x, y)) return false;
    if (x === x1 && y === y1) return true;
    if (blocksSight(tiles[index(x, y)])) return false;
  }
  return true;
}
export function computeVisibility(tiles: readonly Tile[], px: number, py: number, radius = 10): number[] {
  const visibility = new Array<number>(WIDTH * HEIGHT).fill(0);
  const r2 = radius * radius;
  for (let y = Math.max(0, py - radius); y <= Math.min(HEIGHT - 1, py + radius); y++) {
    for (let x = Math.max(0, px - radius); x <= Math.min(WIDTH - 1, px + radius); x++) {
      if ((x - px) ** 2 + (y - py) ** 2 <= r2 && hasLineOfSight(tiles, px, py, x, y)) visibility[index(x, y)] = 1;
    }
  }
  return visibility;
}
