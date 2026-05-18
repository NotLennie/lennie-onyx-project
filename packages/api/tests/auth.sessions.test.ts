import { describe, it, expect } from 'vitest';
import { UserSessions } from '../src/auth/sessions';

function makeState() {
  const store = new Map<string, unknown>();
  return {
    storage: {
      get: async (key: string) => store.get(key),
      put: async (key: string, value: unknown) => { store.set(key, value); },
    },
    blockConcurrencyWhile: async (fn: () => Promise<void>) => { await fn(); },
  } as unknown as DurableObjectState;
}

describe('UserSessions', () => {
  it('creates, validates, and deletes a session', async () => {
    const sessions = new UserSessions(makeState());

    const createResp = await sessions.fetch(
      new Request('https://sessions/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: 'sess-1', tokenHash: 'hash-abc', role: 'client' }),
      })
    );
    expect(createResp.ok).toBe(true);

    const validateResp = await sessions.fetch(
      new Request('https://sessions/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tokenHash: 'hash-abc' }),
      })
    );
    const validated = await validateResp.json() as { valid: boolean; sessionId: string; role: string };
    expect(validated.valid).toBe(true);
    expect(validated.sessionId).toBe('sess-1');
    expect(validated.role).toBe('client');

    const deleteResp = await sessions.fetch(
      new Request('https://sessions/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId: 'sess-1' }),
      })
    );
    expect(deleteResp.ok).toBe(true);

    const afterDelete = await sessions.fetch(
      new Request('https://sessions/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tokenHash: 'hash-abc' }),
      })
    );
    const afterResult = await afterDelete.json() as { valid: boolean };
    expect(afterResult.valid).toBe(false);
  });
});
