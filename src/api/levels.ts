// FILE: src/api/levels.ts

import { apiGet, apiPost } from './client';
import type {
  GetLevelResponse,
  LevelListResponse,
  CreateLevelRequest,
  CreateLevelResponse,
} from '../types';

export async function fetchLevels(params?: {
  difficulty?: string;
  limit?: number;
}): Promise<LevelListResponse> {
  const q = new URLSearchParams();
  if (params?.difficulty) q.set('difficulty', params.difficulty);
  if (params?.limit != null) q.set('limit', String(params.limit));
  const query = q.toString();
  return apiGet<LevelListResponse>(`/levels${query ? `?${query}` : ''}`);
}

/** Fetches a single level by ID: GET /levels/{levelId} */
export async function fetchLevel(levelId: string): Promise<GetLevelResponse> {
  const path = `/levels/${encodeURIComponent(levelId)}`;
  return apiGet<GetLevelResponse>(path);
}

/** Create/upload a level (e.g. after generation): POST /levels. Returns meta with levelId. */
export async function createLevel(payload: CreateLevelRequest): Promise<CreateLevelResponse> {
  return apiPost<CreateLevelResponse>('/levels', payload);
}
