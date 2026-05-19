import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockDb = vi.hoisted(() => ({
  select: vi.fn(),
  insert: vi.fn(),
  update: vi.fn(),
}));

vi.mock('../src/db/client', () => ({
  createDbClient: vi.fn().mockReturnValue(mockDb),
}));

vi.mock('../src/auth/middleware', () => ({
  requireAuth: vi.fn().mockImplementation(async (c: any, next: any) => {
    c.set('userId', 'user-123');
    c.set('userRole', 'client');
    await next();
  }),
}));

import app from '../src/index';

const makeEnv = () => ({
  DATABASE_URL: 'mock',
  USER_SESSIONS: {} as DurableObjectNamespace,
  PROFILE_PICTURES: {
    get: vi.fn().mockResolvedValue(null),
    put: vi.fn().mockResolvedValue(undefined),
  } as unknown as R2Bucket,
});

beforeEach(() => {
  vi.clearAllMocks();

  const selectChain = {
    from: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    orderBy: vi.fn().mockResolvedValue([]),
    limit: vi.fn().mockResolvedValue([]),
    innerJoin: vi.fn().mockReturnThis(),
    leftJoin: vi.fn().mockReturnThis(),
    groupBy: vi.fn().mockReturnThis(),
  };

  mockDb.select.mockReturnValue(selectChain);
  mockDb.insert.mockReturnValue({
    values: vi.fn().mockReturnValue({
      returning: vi.fn().mockResolvedValue([{ id: 'appt-1', date: '2025-01-02', status: 'confirmed' }]),
    }),
  });
  mockDb.update.mockReturnValue({
    set: vi.fn().mockReturnValue({
      where: vi.fn().mockResolvedValue([]),
    }),
  });
});

describe('GET /api/client/appointments', () => {
  it('returns 200 with appointments array', async () => {
    const req = new Request('http://localhost/api/client/appointments');
    const res = await app.fetch(req, makeEnv() as any, {} as any);
    expect(res.status).toBe(200);
    const body = await res.json() as { appointments: unknown[] };
    expect(Array.isArray(body.appointments)).toBe(true);
  });
});

describe('GET /api/client/availability', () => {
  it('returns 400 when query params are missing', async () => {
    const req = new Request('http://localhost/api/client/availability');
    const res = await app.fetch(req, makeEnv() as any, {} as any);
    expect(res.status).toBe(400);
    const body = await res.json() as { error: string };
    expect(body.error).toMatch(/required/i);
  });

  it('returns 404 when service not found', async () => {
    mockDb.select.mockReturnValue({
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue([]),
    });

    const req = new Request('http://localhost/api/client/availability?date=2025-01-02&serviceId=svc-1&startTime=10:00');
    const res = await app.fetch(req, makeEnv() as any, {} as any);
    expect(res.status).toBe(404);
  });
});

describe('GET /api/client/profile', () => {
  it('returns 404 when client not found', async () => {
    mockDb.select.mockReturnValue({
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue([]),
    });

    const req = new Request('http://localhost/api/client/profile');
    const res = await app.fetch(req, makeEnv() as any, {} as any);
    expect(res.status).toBe(404);
  });

  it('returns 200 with user data when client exists', async () => {
    const clientData = { id: 'user-123', name: 'Test User', email: 'test@example.com', profilePictureUrl: null, createdAt: new Date().toISOString() };
    mockDb.select.mockReturnValue({
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue([clientData]),
    });

    const req = new Request('http://localhost/api/client/profile');
    const res = await app.fetch(req, makeEnv() as any, {} as any);
    expect(res.status).toBe(200);
    const body = await res.json() as { user: typeof clientData };
    expect(body.user.email).toBe('test@example.com');
  });
});

describe('PATCH /api/client/appointments/:id/cancel', () => {
  it('returns 404 when appointment not found', async () => {
    mockDb.select.mockReturnValue({
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue([]),
    });

    const req = new Request('http://localhost/api/client/appointments/nonexistent/cancel', { method: 'PATCH' });
    const res = await app.fetch(req, makeEnv() as any, {} as any);
    expect(res.status).toBe(404);
  });

  it('returns 403 when appointment belongs to another client', async () => {
    mockDb.select.mockReturnValue({
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue([{ id: 'appt-1', clientId: 'other-user', status: 'confirmed' }]),
    });

    const req = new Request('http://localhost/api/client/appointments/appt-1/cancel', { method: 'PATCH' });
    const res = await app.fetch(req, makeEnv() as any, {} as any);
    expect(res.status).toBe(403);
  });
});
