import { describe, it, expect } from 'vitest';
import { AuthService } from '../src/auth/service';
import { hashPassword } from '../src/auth/crypto';

function makeDO() {
  const sessions = new Map<string, { tokenHash: string; role: string }>();
  return {
    idFromName: () => ({ toString: () => 'do-id' }),
    get: () => ({
      fetch: async (url: string, opts: any) => {
        const path = new URL(url).pathname;
        const body = JSON.parse(opts.body);
        if (path === '/create') {
          sessions.set(body.id, { tokenHash: body.tokenHash, role: body.role });
          return Response.json({ ok: true });
        }
        if (path === '/validate') {
          for (const [sessionId, s] of sessions) {
            if (s.tokenHash === body.tokenHash) {
              return Response.json({ valid: true, sessionId, role: s.role });
            }
          }
          return Response.json({ valid: false }, { status: 401 });
        }
        if (path === '/delete') {
          sessions.delete(body.sessionId);
          return Response.json({ ok: true });
        }
        return new Response('not found', { status: 404 });
      },
    }),
  } as unknown as DurableObjectNamespace;
}

describe('AuthService', () => {
  it('signs up a new client and returns a token', async () => {
    const db = {
      select: () => ({ from: () => ({ where: () => ({ limit: async () => [] }) }) }),
      insert: () => ({ values: () => ({ returning: async () => [{ id: 'c-1', email: 'a@b.com', name: 'Alice' }] }) }),
    } as any;
    const svc = new AuthService(db, makeDO());
    const result = await svc.signupClient({ name: 'Alice', email: 'a@b.com', password: 'pass1234' });
    expect(result.user.role).toBe('client');
    expect(result.token).toContain('.');
  });

  it('rejects signup with duplicate email', async () => {
    const db = {
      select: () => ({ from: () => ({ where: () => ({ limit: async () => [{ id: 'existing' }] }) }) }),
    } as any;
    const svc = new AuthService(db, makeDO());
    await expect(svc.signupClient({ name: 'A', email: 'a@b.com', password: 'pass1234' }))
      .rejects.toThrow('EMAIL_EXISTS');
  });

  it('logs in a client with correct credentials', async () => {
    const passwordHash = await hashPassword('pass1234');
    const db = {
      select: () => ({
        from: () => ({
          where: () => ({
            limit: async () => [{ id: 'c-1', email: 'a@b.com', name: 'Alice', passwordHash, isAdmin: false }],
          }),
        }),
      }),
    } as any;
    const svc = new AuthService(db, makeDO());
    const result = await svc.login({ email: 'a@b.com', password: 'pass1234' });
    expect(result.user.role).toBe('client');
  });

  it('rejects login with wrong password', async () => {
    const passwordHash = await hashPassword('correct');
    const db = {
      select: () => ({
        from: () => ({
          where: () => ({
            limit: async () => [{ id: 'c-1', email: 'a@b.com', name: 'Alice', passwordHash }],
          }),
        }),
      }),
    } as any;
    const svc = new AuthService(db, makeDO());
    await expect(svc.login({ email: 'a@b.com', password: 'wrong' }))
      .rejects.toThrow('INVALID_CREDENTIALS');
  });

  it('returns admin role for admin employees', async () => {
    const passwordHash = await hashPassword('pass1234');
    let callCount = 0;
    const db = {
      select: () => ({
        from: () => ({
          where: () => ({
            limit: async () => {
              callCount++;
              if (callCount === 1) return []; // no client found
              return [{ id: 'e-1', email: 'emp@b.com', name: 'Bob', passwordHash, isAdmin: true }];
            },
          }),
        }),
      }),
    } as any;
    const svc = new AuthService(db, makeDO());
    const result = await svc.login({ email: 'emp@b.com', password: 'pass1234' });
    expect(result.user.role).toBe('admin');
  });
});
