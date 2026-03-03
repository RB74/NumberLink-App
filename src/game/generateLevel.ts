// FILE: src/game/generateLevel.ts
// Procedural level generation. Produces solvable 5x5 Numberlink levels.

import type { Cell, Level, Pair, Difficulty } from '../types';
import { idx, neighbors4 } from './levelUtils';
import { solveLevel } from './solver';

const SIZE = 5;
const TOTAL_CELLS = SIZE * SIZE;

const PAIR_COLORS = [
  '#e74c3c',
  '#3498db',
  '#2ecc71',
  '#9b59b6',
  '#f39c12',
  '#1abc9c',
  '#e67e22',
  '#34495e',
];

function shuffle<T>(arr: T[], rng: () => number): T[] {
  const out = [...arr];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/** Split total cells into n path lengths (each >= 2). */
function partitionCells(total: number, n: number, rng: () => number): number[] {
  const minPerPath = 2;
  const remaining = total - n * minPerPath;
  const buckets = new Array(n).fill(minPerPath);
  for (let i = 0; i < remaining; i++) {
    buckets[i % n]++;
  }
  return shuffle(buckets, rng);
}

function allCells(): Cell[] {
  const out: Cell[] = [];
  for (let y = 0; y < SIZE; y++) for (let x = 0; x < SIZE; x++) out.push({ x, y });
  return out;
}

/** Grow a path of length L from start, using only empty cells. Returns path (including start) or null. */
function growPath(
  grid: (string | null)[],
  start: Cell,
  length: number,
  pairId: string,
  rng: () => number
): Cell[] | null {
  if (length <= 0) return [];
  const path: Cell[] = [start];
  const used = new Set<number>();
  used.add(idx(start.x, start.y));

  while (path.length < length) {
    const last = path[path.length - 1];
    const neighbors = neighbors4(last).filter((c) => {
      const i = idx(c.x, c.y);
      return grid[i] === null && !used.has(i);
    });
    if (neighbors.length === 0) return null;
    const next = neighbors[Math.floor(rng() * neighbors.length)];
    path.push(next);
    used.add(idx(next.x, next.y));
  }
  return path;
}

export interface GenerateLevelParams {
  size: 5;
  difficulty: Difficulty;
  /** Optional seed for reproducible levels (e.g. number or string). */
  seed?: number | string;
}

const DEFAULT_SEED = () => Math.random();

function seedRng(seed: number | string): () => number {
  if (typeof seed === 'number') {
    let s = seed;
    return () => {
      s = (s * 1103515245 + 12345) & 0x7fffffff;
      return s / 0x7fffffff;
    };
  }
  let h = 0;
  for (let i = 0; i < seed.length; i++) {
    h = (h << 5) - h + seed.charCodeAt(i);
    h = h & 0x7fffffff;
  }
  return seedRng(h);
}

/**
 * Generate a solvable Numberlink level.
 * Strategy: build a valid solution first (disjoint paths covering the grid), then derive pairs from path endpoints.
 */
export function generateLevel(params: GenerateLevelParams): Level {
  const { difficulty, seed } = params;
  const rng = seed != null ? seedRng(seed) : DEFAULT_SEED;

  const numPairs =
    difficulty === 'easy' ? 2 + Math.floor(rng() * 2) : difficulty === 'medium' ? 4 : 5;
  const lengths = partitionCells(TOTAL_CELLS, numPairs, rng);

  const maxAttempts = 50;
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const grid: (string | null)[] = new Array(TOTAL_CELLS).fill(null);
    const paths: Cell[][] = [];
    const cells = shuffle(allCells(), rng);
    let cellIndex = 0;

    for (let p = 0; p < numPairs; p++) {
      const pairId = String.fromCharCode(65 + p);
      const L = lengths[p];
      let start: Cell | null = null;
      for (; cellIndex < cells.length; cellIndex++) {
        const c = cells[cellIndex];
        if (grid[idx(c.x, c.y)] !== null) continue;
        start = c;
        break;
      }
      if (!start) break;
      const path = growPath(grid, start, L, pairId, rng);
      if (!path || path.length !== L) break;
      for (const cell of path) {
        grid[idx(cell.x, cell.y)] = pairId;
      }
      paths.push(path);
    }

    if (paths.length !== numPairs) continue;

    const pairs: Pair[] = paths.map((path, i) => {
      const id = String.fromCharCode(65 + i);
      return {
        id,
        color: PAIR_COLORS[i % PAIR_COLORS.length],
        start: path[0],
        end: path[path.length - 1],
      };
    });

    const level: Level = {
      size: 5,
      difficulty,
      pairs,
    };

    if (solveLevel(level)) return level;
  }

  throw new Error('generateLevel: failed to produce solvable level after retries');
}
