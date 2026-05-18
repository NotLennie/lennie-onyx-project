import type { LoginInput, SignupInput } from '@project/shared';

const BASE = import.meta.env.PUBLIC_API_URL ?? 'http://localhost:8787';

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...init?.headers },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText })) as { error: string };
    throw new Error(err.error ?? res.statusText);
  }
  return res.json() as Promise<T>;
}

export type SessionUser = {
  id: string;
  name: string;
  email: string;
  profilePictureUrl: string | null;
  role: 'client' | 'employee' | 'admin';
};

export const api = {
  auth: {
    signup: (input: SignupInput) =>
      request<{ user: SessionUser }>('/api/auth/signup', {
        method: 'POST',
        body: JSON.stringify(input),
      }),
    login: (input: LoginInput) =>
      request<{ user: SessionUser }>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify(input),
      }),
    logout: () =>
      request<{ ok: boolean }>('/api/auth/logout', { method: 'POST' }),
    me: () =>
      request<{ user: SessionUser }>('/api/auth/me'),
  },
};
