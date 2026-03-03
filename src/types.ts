// FILE: src/types.ts

export interface Cell {
  x: number;
  y: number;
}

export interface Pair {
  id: string;
  color: string;
  start: Cell;
  end: Cell;
}

export type Difficulty = 'easy' | 'medium' | 'hard';

export interface Level {
  size: 5;
  difficulty: Difficulty;
  pairs: Pair[];
}

export interface Solution {
  paths: Record<string, Cell[]>;
}

// API types
export interface LevelMeta {
  levelId: string;
  createdAt: string;
}

export interface LevelListItem {
  levelId: string;
  size: 5;
  difficulty: Difficulty;
  pairCount: number;
  createdAt: string;
}

export interface LevelListResponse {
  levels: LevelListItem[];
}

export interface GetLevelResponse {
  meta: LevelMeta;
  level: Level;
  solution?: Solution;
}

export interface CreateLevelRequest {
  level: Level;
  notes?: string;
}

export interface CreateLevelResponse {
  meta: LevelMeta;
}

export interface ScoreEntry {
  scoreId: string;
  levelId: string;
  durationMs: number;
  moves?: number;
  playerName?: string;
  createdAt: string;
}

export interface CreateScoreRequest {
  levelId: string;
  durationMs: number;
  moves?: number;
  playerName?: string;
}

export interface CreateScoreResponse {
  score: ScoreEntry;
}

export interface ScoreboardResponse {
  scores: ScoreEntry[];
}

export interface ErrorResponse {
  error: { code: string; message: string };
}
