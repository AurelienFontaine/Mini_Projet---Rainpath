import type { CaseEntity } from '../types';

function resolveBaseUrl(): string {
  const envUrl = import.meta.env.VITE_API_URL as string | undefined;
  if (envUrl && envUrl.trim().length > 0) return envUrl;
  // Heuristic: if the frontend is served via proxy (e.g., 3001), prefer same host on 3001
  if (typeof window !== 'undefined') {
    const { protocol, hostname, port } = window.location;
    if (port === '3001') return `${protocol}//${hostname}:3001`;
    return `${protocol}//${hostname}:3000`;
  }
  return 'http://localhost:3000';
}

const baseUrl = resolveBaseUrl();

async function handleResponse<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`HTTP ${res.status}: ${text || res.statusText}`);
  }
  return (await res.json()) as T;
}

function withTimeout(signal: AbortSignal | undefined, ms: number): AbortSignal | undefined {
  if (typeof AbortController === 'undefined') return signal;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  if (signal) {
    signal.addEventListener('abort', () => controller.abort(), { once: true });
  }
  // Note: caller cannot clear; keep timeouts short
  return controller.signal;
}

export async function getCases(): Promise<CaseEntity[]> {
  const res = await fetch(`${baseUrl}/cases`, { signal: withTimeout(undefined, 1500) });
  return handleResponse<CaseEntity[]>(res);
}

export async function getCaseById(id: string): Promise<CaseEntity> {
  const res = await fetch(`${baseUrl}/cases/${encodeURIComponent(id)}`, { signal: withTimeout(undefined, 1500) });
  return handleResponse<CaseEntity>(res);
}

export async function createCase(payload: CaseEntity | Omit<CaseEntity, 'id'>): Promise<CaseEntity> {
  const res = await fetch(`${baseUrl}/cases`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
    signal: withTimeout(undefined, 3000),
  });
  return handleResponse<CaseEntity>(res);
}

export async function deleteCase(id: string): Promise<void> {
  const res = await fetch(`${baseUrl}/cases/${encodeURIComponent(id)}`, {
    method: 'DELETE',
    signal: withTimeout(undefined, 2000),
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`HTTP ${res.status}: ${text || res.statusText}`);
  }
}


