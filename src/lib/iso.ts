/**
 * Isometric projection for the village board.
 *
 * We use a classic 2:1 "video-game isometric" projection rather than a true
 * 30° dimetric one: a tile is twice as wide as it is tall, which keeps all the
 * maths integral and lets tiles be plain absolutely-positioned divs (no CSS 3D
 * transforms, no compositing surprises on mobile Safari).
 *
 *      (0,0) ─────► x
 *        │  ◇ ◇ ◇
 *        │ ◇ ◇ ◇
 *        ▼
 *        y
 */

export const TILE_W = 116;
export const TILE_H = 58;
/**
 * 7x7 board: a 5x5 buildable interior (1..5) wrapped in a decorative
 * perimeter ring (0 and 6) of trees and rocks.
 */
export const GRID = 7;

export interface Point {
  x: number;
  y: number;
}

/** Grid coordinate → pixel position of the tile's top-left bounding corner. */
export function isoToScreen(gx: number, gy: number): Point {
  return {
    x: (gx - gy) * (TILE_W / 2),
    y: (gx + gy) * (TILE_H / 2),
  };
}

/** Grid coordinate → pixel position of the tile's centre. */
export function isoCenter(gx: number, gy: number): Point {
  const p = isoToScreen(gx, gy);
  return { x: p.x, y: p.y + TILE_H / 2 };
}

/** Painter's-algorithm depth: further from camera renders first. */
export function depth(gx: number, gy: number): number {
  return (gx + gy) * 10 + gx;
}

/** Total pixel footprint of a GRID x GRID board. */
export function boardSize(grid = GRID) {
  return {
    width: grid * TILE_W,
    height: grid * TILE_H + TILE_H,
  };
}

/**
 * The board is centred by offsetting so tile (0,0) sits at the top-middle.
 * Returns the translation to apply to the tile container.
 */
export function boardOffset(grid = GRID) {
  return { x: (grid * TILE_W) / 2, y: 0 };
}

/** Diamond clip-path for a single tile face. */
export const TILE_CLIP = "polygon(50% 0%, 100% 50%, 50% 100%, 0% 50%)";

/**
 * Cobblestone path: a cross through the centre so the Town Hall sits on the
 * crossroads and every pillar building is a short walk off it.
 */
export function isPathTile(gx: number, gy: number): boolean {
  const mid = Math.floor(GRID / 2);
  if (isPerimeter(gx, gy)) return false;
  return gx === mid || gy === mid;
}

/** Checkerboard parity — alternates the two grass tones. */
export function isLightTile(gx: number, gy: number): boolean {
  return (gx + gy) % 2 === 0;
}

/** Perimeter cells get decorative trees/rocks instead of buildable ground. */
export function isPerimeter(gx: number, gy: number, grid = GRID): boolean {
  return gx === 0 || gy === 0 || gx === grid - 1 || gy === grid - 1;
}
