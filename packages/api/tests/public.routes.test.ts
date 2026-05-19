import { describe, it, expect, vi } from 'vitest';

vi.mock('../src/db/client', () => ({
  createDbClient: vi.fn().mockReturnValue({
    select: vi.fn().mockReturnValue({
      from: vi.fn().mockReturnValue({
        leftJoin: vi.fn().mockReturnValue({
          groupBy: vi.fn().mockReturnValue({
            orderBy: vi.fn().mockResolvedValue([]),
          }),
        }),
      }),
    }),
  }),
}));

import app from '../src/index';

describe('GET /api/public/services', () => {
  it('returns 200 with a services array', async () => {
    const req = new Request('http://localhost/api/public/services');
    const env = { DATABASE_URL: 'mock', USER_SESSIONS: {} };
    const res = await app.fetch(req, env as any, {} as any);
    expect(res.status).toBe(200);
    const body = await res.json() as { services: unknown[] };
    expect(Array.isArray(body.services)).toBe(true);
  });
});
