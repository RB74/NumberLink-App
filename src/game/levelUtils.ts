// FILE: src/game/levelUtils.ts

import type { Cell, Level } from '../types';

const SIZE = 5;

export function idx(x: number, y: number): number {
  return y * SIZE + x;
}

export function fromIdx(i: number): Cell {
  return { x: i % SIZE, y: Math.floor(i / SIZE) };
}

export function inBounds(x: number, y: number): boolean {
  return x >= 0 && x < SIZE && y >= 0 && y < SIZE;
}

const DX = [0, 1, 0, -1];
const DY = [-1, 0, 1, 0];

export function neighbors4(cell: Cell): Cell[] {
  const out: Cell[] = [];
  for (let d = 0; d < 4; d++) {
    const nx = cell.x + DX[d];
    const ny = cell.y + DY[d];
    if (inBounds(nx, ny)) out.push({ x: nx, y: ny });
  }
  return out;
}

export function cellsEqual(a: Cell, b: Cell): boolean {
  return a.x === b.x && a.y === b.y;
}

export function gridSize(level: Level): number {
  return level.size * level.size;
}

export function getLevelSize(): number {
  return SIZE;
}
