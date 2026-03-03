// FILE: src/game/rules.ts

import type { Cell, Level } from '../types';
import { idx, inBounds, neighbors4, cellsEqual } from './levelUtils';

export function isEndpoint(level: Level, cell: Cell): boolean {
  for (const p of level.pairs) {
    if (cellsEqual(p.start, cell) || cellsEqual(p.end, cell)) return true;
  }
  return false;
}

export function getPairAt(level: Level, cell: Cell): { id: string; color: string } | null {
  for (const p of level.pairs) {
    if (cellsEqual(p.start, cell) || cellsEqual(p.end, cell)) return { id: p.id, color: p.color };
  }
  return null;
}

export function canExtendPath(
  level: Level,
  cellOwners: (string | null)[],
  pairId: string,
  fromCell: Cell,
  toCell: Cell
): boolean {
  if (!inBounds(toCell.x, toCell.y)) return false;
  const fromNeighbors = neighbors4(fromCell);
  const isAdjacent = fromNeighbors.some((n) => cellsEqual(n, toCell));
  if (!isAdjacent) return false;

  const toIdx = idx(toCell.x, toCell.y);
  const owner = cellOwners[toIdx];
  if (owner === null) return true;
  const pair = level.pairs.find((p) => p.id === pairId);
  if (!pair) return false;
  if (owner === pairId) {
    return cellsEqual(toCell, pair.start) || cellsEqual(toCell, pair.end);
  }
  return false;
}

export function isPathComplete(level: Level, path: Cell[], pairId: string): boolean {
  const pair = level.pairs.find((p) => p.id === pairId);
  if (!pair || path.length < 2) return false;
  const first = path[0];
  const last = path[path.length - 1];
  const hasStart = cellsEqual(first, pair.start) || cellsEqual(last, pair.start);
  const hasEnd = cellsEqual(first, pair.end) || cellsEqual(last, pair.end);
  return hasStart && hasEnd;
}

export function checkWin(
  level: Level,
  cellOwners: (string | null)[],
  paths: Record<string, Cell[]>
): boolean {
  const total = level.size * level.size;
  for (let i = 0; i < total; i++) {
    if (cellOwners[i] === null) return false;
  }
  for (const p of level.pairs) {
    const path = paths[p.id];
    if (!path || !isPathComplete(level, path, p.id)) return false;
  }
  return true;
}
