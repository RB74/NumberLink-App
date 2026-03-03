// FILE: src/game/solver.ts
// Pure backtracking solver. Independent from React.
// Returns a full solution covering the entire grid or null.

import type { Cell, Level, Solution } from '../types';
import { idx, neighbors4, cellsEqual } from './levelUtils';

function manhattan(a: Cell, b: Cell): number {
  return Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
}

function copyGrid(grid: (string | null)[]): (string | null)[] {
  return [...grid];
}

function tracePath(
  level: Level,
  grid: (string | null)[],
  pairId: string,
  start: Cell,
  end: Cell
): Cell[] {
  const path: Cell[] = [];
  let current = start;
  const visited = new Set<string>();
  while (true) {
    const key = `${current.x},${current.y}`;
    if (visited.has(key)) return [];
    visited.add(key);
    path.push(current);
    if (cellsEqual(current, end)) return path;
    const next = neighbors4(current).find((n) => {
      const k = `${n.x},${n.y}`;
      return grid[idx(n.x, n.y)] === pairId && !visited.has(k);
    });
    if (!next) return [];
    current = next;
  }
}

function buildSolution(level: Level, grid: (string | null)[]): Solution {
  const paths: Record<string, Cell[]> = {};
  for (const p of level.pairs) {
    paths[p.id] = tracePath(level, grid, p.id, p.start, p.end);
  }
  return { paths };
}

function isGridFull(grid: (string | null)[], size: number): boolean {
  for (let i = 0; i < size * size; i++) {
    if (grid[i] === null) return false;
  }
  return true;
}

/** Try all paths for current pair, then recurse for rest. */
function solve(
  level: Level,
  pairOrder: string[],
  pairIndex: number,
  grid: (string | null)[]
): Solution | null {
  const size = level.size;

  if (pairIndex >= pairOrder.length) {
    if (isGridFull(grid, size)) return buildSolution(level, grid);
    return null;
  }

  const pairId = pairOrder[pairIndex];
  const currentPair = level.pairs.find((p) => p.id === pairId);
  if (!currentPair) return null;

  const visited = new Set<number>();
  visited.add(idx(currentPair.start.x, currentPair.start.y));

  function dfs(cell: Cell, path: Cell[]): Solution | null {
    if (cellsEqual(cell, currentPair!.end)) {
      const newGrid = copyGrid(grid);
      for (const c of path) newGrid[idx(c.x, c.y)] = pairId;
      return solve(level, pairOrder, pairIndex + 1, newGrid);
    }
    for (const n of neighbors4(cell)) {
      const ni = idx(n.x, n.y);
      if (visited.has(ni)) continue;
      const owner = grid[ni];
      if (owner !== null && owner !== pairId) continue;
      if (owner === pairId && !cellsEqual(n, currentPair!.end)) continue;
      visited.add(ni);
      const sol = dfs(n, [...path, n]);
      visited.delete(ni);
      if (sol) return sol;
    }
    return null;
  }

  return dfs(currentPair.start, [currentPair.start]);
}

export function solveLevel(level: Level): Solution | null {
  const size = level.size;
  const grid: (string | null)[] = new Array(size * size).fill(null);
  for (const p of level.pairs) {
    grid[idx(p.start.x, p.start.y)] = p.id;
    grid[idx(p.end.x, p.end.y)] = p.id;
  }

  const ordered = [...level.pairs]
    .sort((a, b) => manhattan(a.start, a.end) - manhattan(b.start, b.end))
    .map((p) => p.id);

  let result = solve(level, ordered, 0, copyGrid(grid));
  if (result) return result;

  for (let i = 0; i < ordered.length; i++) {
    const perm = [...ordered];
    [perm[0], perm[i]] = [perm[i], perm[0]];
    result = solve(level, perm, 0, copyGrid(grid));
    if (result) return result;
  }
  return null;
}

