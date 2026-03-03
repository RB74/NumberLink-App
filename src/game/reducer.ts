// FILE: src/game/reducer.ts

import type { Cell, Level } from '../types';
import { idx } from './levelUtils';
import { checkWin } from './rules';

export interface BoardState {
  level: Level;
  cellOwners: (string | null)[];
  paths: Record<string, Cell[]>;
  activePairId: string | null;
  won: boolean;
  moves: number;
  startTimeMs: number;
}

export type BoardAction =
  | { type: 'SET_LEVEL'; level: Level; startTimeMs?: number }
  | { type: 'START_PATH'; pairId: string; cell: Cell }
  | { type: 'EXTEND_PATH'; pairId: string; cell: Cell }
  | { type: 'BACKTRACK_PATH'; pairId: string }
  | { type: 'END_PATH' }
  | { type: 'RESET' }
  | { type: 'APPLY_HINT'; pairId: string; cell: Cell };

function initialCellOwners(level: Level): (string | null)[] {
  const arr = new Array(level.size * level.size).fill(null) as (string | null)[];
  for (const p of level.pairs) {
    arr[idx(p.start.x, p.start.y)] = p.id;
    arr[idx(p.end.x, p.end.y)] = p.id;
  }
  return arr;
}

function initialPaths(level: Level): Record<string, Cell[]> {
  const paths: Record<string, Cell[]> = {};
  for (const p of level.pairs) {
    paths[p.id] = [];
  }
  return paths;
}

export function initialBoardState(level: Level, startTimeMs: number): BoardState {
  return {
    level,
    cellOwners: initialCellOwners(level),
    paths: initialPaths(level),
    activePairId: null,
    won: false,
    moves: 0,
    startTimeMs,
  };
}

function countFilled(paths: Record<string, Cell[]>, level: Level): number {
  let n = 0;
  for (const p of level.pairs) {
    const path = paths[p.id];
    if (path) n += path.length;
  }
  return n;
}

export function boardReducer(state: BoardState, action: BoardAction): BoardState {
  switch (action.type) {
    case 'SET_LEVEL': {
      const startMs = action.startTimeMs ?? state.startTimeMs;
      return initialBoardState(action.level, startMs);
    }

    case 'START_PATH': {
      const { pairId, cell } = action;
      const path = state.paths[pairId] ?? [];
      const pair = state.level.pairs.find((p) => p.id === pairId);
      if (!pair) return state;
      const cellIdx = idx(cell.x, cell.y);
      const owner = state.cellOwners[cellIdx];
      if (owner !== pairId) return state;
      let startPath: Cell[];
      if (path.length === 0) {
        startPath = [cell];
      } else {
        const at = path.findIndex((c) => c.x === cell.x && c.y === cell.y);
        if (at < 0) return state;
        startPath = path.slice(0, at + 1);
      }
      return {
        ...state,
        paths: { ...state.paths, [pairId]: startPath },
        activePairId: pairId,
      };
    }

    case 'EXTEND_PATH': {
      const { pairId, cell } = action;
      if (state.activePairId !== pairId) return state;
      const path = state.paths[pairId] ?? [];
      if (path.length === 0) return state;
      const last = path[path.length - 1];
      const lastIdx = idx(last.x, last.y);
      const cellIdx = idx(cell.x, cell.y);
      const pair = state.level.pairs.find((p) => p.id === pairId);
      if (!pair) return state;

      const dx = Math.abs(cell.x - last.x);
      const dy = Math.abs(cell.y - last.y);
      const isAdjacent = (dx === 1 && dy === 0) || (dx === 0 && dy === 1);
      if (!isAdjacent) return state;

      const owner = state.cellOwners[cellIdx];
      if (owner === pairId) {
        const prevIdx = path.length >= 2 ? idx(path[path.length - 2].x, path[path.length - 2].y) : -1;
        if (cellIdx === lastIdx) return state;
        if (cellIdx === prevIdx) {
          const newPath = path.slice(0, -1);
          const newOwners = [...state.cellOwners];
          newOwners[lastIdx] = null;
          const newPaths = { ...state.paths, [pairId]: newPath };
          return {
            ...state,
            paths: newPaths,
            cellOwners: newOwners,
            moves: state.moves + 1,
          };
        }
        const isEnd =
          (cell.x === pair.end.x && cell.y === pair.end.y) ||
          (cell.x === pair.start.x && cell.y === pair.start.y);
        if (!isEnd) return state;
      }

      if (owner !== null && owner !== pairId) return state;

      const newPath = [...path, cell];
      const newOwners = [...state.cellOwners];
      newOwners[cellIdx] = pairId;
      const newPaths = { ...state.paths, [pairId]: newPath };
      const won = checkWin(state.level, newOwners, newPaths);
      return {
        ...state,
        paths: newPaths,
        cellOwners: newOwners,
        moves: state.moves + 1,
        won,
      };
    }

    case 'BACKTRACK_PATH': {
      const { pairId } = action;
      const path = state.paths[pairId] ?? [];
      if (path.length <= 1) return state;
      const last = path[path.length - 1];
      const lastIdx = idx(last.x, last.y);
      const newPath = path.slice(0, -1);
      const newOwners = [...state.cellOwners];
      newOwners[lastIdx] = null;
      const newPaths = { ...state.paths, [pairId]: newPath };
      return {
        ...state,
        paths: newPaths,
        cellOwners: newOwners,
        moves: state.moves + 1,
      };
    }

    case 'END_PATH':
      return { ...state, activePairId: null };

    case 'RESET': {
      return initialBoardState(state.level, state.startTimeMs);
    }

    case 'APPLY_HINT': {
      const { pairId, cell } = action;
      const path = state.paths[pairId] ?? [];
      const cellIdx = idx(cell.x, cell.y);
      const pair = state.level.pairs.find((p) => p.id === pairId);
      if (!pair) return state;

      const distStart = Math.abs(cell.x - pair.start.x) + Math.abs(cell.y - pair.start.y);
      const distEnd = Math.abs(cell.x - pair.end.x) + Math.abs(cell.y - pair.end.y);
      const fromEndpoint = distStart === 1 ? pair.start : pair.end;
      const newPath = path.length === 0 ? [fromEndpoint, cell] : [...path, cell];
      const newOwners = [...state.cellOwners];
      newOwners[cellIdx] = pairId;
      const newPaths = { ...state.paths, [pairId]: newPath };
      const won = checkWin(state.level, newOwners, newPaths);
      return {
        ...state,
        paths: newPaths,
        cellOwners: newOwners,
        moves: state.moves + 1,
        won,
      };
    }

    default:
      return state;
  }
}
