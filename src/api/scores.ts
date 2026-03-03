// FILE: src/api/scores.ts

import { apiGet, apiPost } from './client';
import type {
  CreateScoreRequest,
  CreateScoreResponse,
  ScoreboardResponse,
} from '../types';

export async function fetchScores(params?: {
  levelId?: string;
  limit?: number;
  order?: 'asc' | 'desc';
}): Promise<ScoreboardResponse> {
  const q = new URLSearchParams();
  if (params?.levelId) q.set('levelId', params.levelId);
  if (params?.limit != null) q.set('limit', String(params.limit));
  if (params?.order) q.set('order', params.order);
  const query = q.toString();
  return apiGet<ScoreboardResponse>(`/scores${query ? `?${query}` : ''}`);
}

/**
 * Submit a score to the scoreboard: POST /scores
 * Payload is normalized to match API: levelId (string), durationMs (integer), optional moves (integer), optional playerName.
 */
export async function submitScore(
  payload: CreateScoreRequest
): Promise<CreateScoreResponse> {
  const levelId = String(payload.levelId ?? '').trim();
  if (!levelId) {
    return Promise.reject(new Error('levelId is required'));
  }
  const durationMs = Math.max(0, Math.floor(Number(payload.durationMs) ?? 0));
  const body: Record<string, string | number> = {
    levelId,
    durationMs,
  };
  if (payload.moves != null) {
    body.moves = Math.max(0, Math.floor(Number(payload.moves) ?? 0));
  }
  if (payload.playerName != null && String(payload.playerName).trim() !== '') {
    body.playerName = String(payload.playerName).trim().slice(0, 32);
  }
  return apiPost<CreateScoreResponse>('/scores', body);
}
