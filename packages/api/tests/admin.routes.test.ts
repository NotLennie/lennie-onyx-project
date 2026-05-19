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
    c.set('userId', 'admin-123');
    c.set('userRole', 'admin');
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
      returning: vi.fn().mockResolvedValue([{ id: 'new-id', name: 'Test', email: 'test@example.com', isAdmin: false }]),
    }),
  });
  mockDb.update.mockReturnValue({
    set: vi.fn().mockReturnValue({ where: vi.fn().mockResolvedValue([]) }),
  });
  mockDb.delete.mockReturnValue({
    where: vi.fn().mockResolvedValue([]),
  });
});

describe('GET /api/admin/clients', () => {
  it('returns 200 with clients array', async () => {
    const req = new Request('http://localhost/api/admin/clients');
    const res = await app.fetch(req, makeEnv() as any, {} as any);
    expect(res.status).toBe(200);
    const body = await res.json() as { clients: unknown[] };
    expect(Array.isArray(body.clients)).toBe(true);
  });
});

describe('GET /api/admin/appointments', () => {
  it('returns 200 with appointments array', async () => {
    const req = new Request('http://localhost/api/admin/appointments');
    const res = await app.fetch(req, makeEnv() as any, {} as any);
    expect(res.status).toBe(200);
    const body = await res.json() as { appointments: unknown[] };
    expect(Array.isArray(body.appointments)).toBe(true);
  });
});

describe('GET /api/admin/services', () => {
  it('returns 200 with services array', async () => {
    const req = new Request('http://localhost/api/admin/services');
    const res = await app.fetch(req, makeEnv() as any, {} as any);
    expect(res.status).toBe(200);
    const body = await res.json() as { services: unknown[] };
    expect(Array.isArray(body.services)).toBe(true);
  });
});

describe('GET /api/admin/employees', () => {
  it('returns 200 with employees array', async () => {
    const req = new Request('http://localhost/api/admin/employees');
    const res = await app.fetch(req, makeEnv() as any, {} as any);
    expect(res.status).toBe(200);
    const body = await res.json() as { employees: unknown[] };
    expect(Array.isArray(body.employees)).toBe(true);
  });
});

describe('GET /api/admin/pto', () => {
  it('returns 200 with pto array', async () => {
    const req = new Request('http://localhost/api/admin/pto');
    const res = await app.fetch(req, makeEnv() as any, {} as any);
    expect(res.status).toBe(200);
    const body = await res.json() as { pto: unknown[] };
    expect(Array.isArray(body.pto)).toBe(true);
  });
});

describe('DELETE /api/admin/services/:id', () => {
  it('returns 404 when service not found', async () => {
    mockDb.select.mockReturnValue({
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue([]),
    });

    const req = new Request('http://localhost/api/admin/services/nonexistent', { method: 'DELETE' });
    const res = await app.fetch(req, makeEnv() as any, {} as any);
    expect(res.status).toBe(404);
  });
});

describe('DELETE /api/admin/employees/:id', () => {
  it('returns 422 when admin tries to delete themselves', async () => {
    const req = new Request('http://localhost/api/admin/employees/admin-123', { method: 'DELETE' });
    const res = await app.fetch(req, makeEnv() as any, {} as any);
    expect(res.status).toBe(422);
  });

  it('returns 404 when employee not found', async () => {
    mockDb.select.mockReturnValue({
      from: vi.fn().mockReturnThis(),
      where: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue([]),
    });

    const req = new Request('http://localhost/api/admin/employees/other-emp', { method: 'DELETE' });
    const res = await app.fetch(req, makeEnv() as any, {} as any);
    expect(res.status).toBe(404);
  });
});
