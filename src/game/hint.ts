// FILE: src/game/hint.ts
// Hint: one valid next move. Uses solver; if current state cannot lead to solution, returns null.
// Behavior: extends a path by one cell toward the full solution, or starts from an endpoint.
// We use the solver's solution as reference; hint = next cell to add for the first incomplete path.

import type { Cell, Level } from '../types';
import { cellsEqual } from './levelUtils';
import { solveLevel } from './solver';

export interface HintResult {
  pairId: string;
  nextCell: Cell;
}

/** Returns one valid next move or null if unsolvable / invalid state. */
export function deriveHint(
  level: Level,
  paths: Record<string, Cell[]>
): HintResult | null {
  const solution = solveLevel(level);
  if (!solution) return null;

  for (const p of level.pairs) {
    const current = paths[p.id] ?? [];
    const target = solution.paths[p.id];
    if (!target || target.length === 0) continue;

    if (current.length === 0 && target.length >= 2) {
      return { pairId: p.id, nextCell: target[1] };
    }

    if (current.length >= target.length) continue;

    const nextCell = target[current.length];
    const lastCurrent = current[current.length - 1];
    const dist = Math.abs(nextCell.x - lastCurrent.x) + Math.abs(nextCell.y - lastCurrent.y);
    if (dist === 1) {
      return { pairId: p.id, nextCell };
    }

    const isPrefix = current.every((c, i) => cellsEqual(c, target[i]));
    if (!isPrefix) return null;
  }

  for (const p of level.pairs) {
    const current = paths[p.id] ?? [];
    const target = solution.paths[p.id];
    if (!target || current.length >= target.length) continue;
    const nextCell = target[current.length];
    return { pairId: p.id, nextCell };
  }

  return null;
}
