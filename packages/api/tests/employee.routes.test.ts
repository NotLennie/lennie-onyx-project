import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockDb = vi.hoisted(() => ({
  select: vi.fn(),
  insert: vi.fn(),
  update: vi.fn(),
  delete: vi.fn(),
}));

vi.mock('../src/db/client', () => ({
  createDbClient: vi.fn().mockReturnValue(mockDb),
}));

vi.mock('../src/auth/middleware', () => ({
  requireAuth: vi.fn().mockImplementation(async (c: any, next: any) => {
    c.set('userId', 'emp-123');
    c.set('userRole', 'employee');
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

  const chain = {
    from: vi.fn().mockReturnThis(),
    where: vi.fn().mockReturnThis(),
    orderBy: vi.fn().mockResolvedValue([]),
    limit: vi.fn().mockResolvedValue([]),
    innerJoin: vi.fn().mockReturnThis(),
    leftJoin: vi.fn().mockReturnThis(),
    groupBy: vi.fn().mockReturnThis(),
  };

  mockDb.select.mockReturnValue(chain);
  mockDb.insert.mockReturnValue({
    values: vi.fn().mockReturnValue({
      returning: vi.fn().mockResolvedValue([{ id: 'pto-1', date: '2025-01-05', type: 'personal', status: 'pending', note: null, employeeId: 'emp-123', createdAt: new Date().toISOString() }]),
    }),
  });
  mockDb.update.mockReturnValue({
    set: vi.fn().mockReturnValue({ where: vi.fn().mockResolvedValue([]) }),
  });
  mockDb.delete.mockReturnValue({
    where: vi.fn().mockResolvedValue([]),
  });
});

describe('GET /api/employee/appointments', () => {
  it('returns 200 with appointments array', async () => {
    const req = new Request('http://localhost/api/employee/appointments');
    const res = await app.fetch(req, makeEnv() as any, {} as any);
    expect(res.status).toBe(200);
    const body = await res.json() as { appointments: unknown[] };
    expect(Array.isArray(body.appointments)).toBe(true);
  });
});

describe('GET /api/employee/pto', () => {
  it('returns 200 with pto array', async () => {
    const req = new Request('http://localhost/api/employee/pto');
    const res = await app.fetch(req, makeEnv() as any, {} as any);
    expect(res.status).toBe(200);
    const body = await res.json() as { pto: unknown[] };
    expect(Array.isArray(body.pto)).toBe(true);
  });
});

describe('GET /api/employee/profile', () => {
  it('returns 404 when employee not found', async () => {
    mockDb.select.mockReturnValue({
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue([]),
    });

    const req = new Request('http://localhost/api/employee/profile');
    const res = await app.fetch(req, makeEnv() as any, {} as any);
    expect(res.status).toBe(404);
  });

  it('returns 200 with employee data when found', async () => {
    const empData = { id: 'emp-123', name: 'Jane', email: 'jane@example.com', profilePictureUrl: null, isAdmin: false, createdAt: new Date().toISOString() };
    mockDb.select.mockReturnValue({
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue([empData]),
    });

    const req = new Request('http://localhost/api/employee/profile');
    const res = await app.fetch(req, makeEnv() as any, {} as any);
    expect(res.status).toBe(200);
    const body = await res.json() as { user: typeof empData };
    expect(body.user.email).toBe('jane@example.com');
  });
});

describe('DELETE /api/employee/pto/:id', () => {
  it('returns 404 when PTO not found', async () => {
    mockDb.select.mockReturnValue({
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue([]),
    });

    const req = new Request('http://localhost/api/employee/pto/nonexistent', { method: 'DELETE' });
    const res = await app.fetch(req, makeEnv() as any, {} as any);
    expect(res.status).toBe(404);
  });

  it('returns 422 when PTO is not pending', async () => {
    mockDb.select.mockReturnValue({
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue([{ id: 'pto-1', status: 'approved', employeeId: 'emp-123' }]),
    });

    const req = new Request('http://localhost/api/employee/pto/pto-1', { method: 'DELETE' });
    const res = await app.fetch(req, makeEnv() as any, {} as any);
    expect(res.status).toBe(422);
  });
});
