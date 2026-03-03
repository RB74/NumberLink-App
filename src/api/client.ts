// FILE: src/api/client.ts
// Base URL comes from .env (API_URL), exposed via app.config.js extra.

import Constants from 'expo-constants';

const envApiUrl = Constants.expoConfig?.extra?.API_URL as string | undefined;
export const API_BASE_URL = (envApiUrl ?? 'http://localhost:4010').replace(/\/$/, '');

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_BASE_URL}${path}`;
  const res = await fetch(url, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...options.headers },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error((data as { error?: { message?: string } }).error?.message ?? `HTTP ${res.status}`);
  }
  return data as T;
}

export async function apiGet<T>(path: string): Promise<T> {
  return request<T>(path, { method: 'GET' });
}

export async function apiPost<T>(path: string, body: unknown): Promise<T> {
  return request<T>(path, { method: 'POST', body: JSON.stringify(body) });
}
