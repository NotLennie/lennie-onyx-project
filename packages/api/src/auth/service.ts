import { eq } from 'drizzle-orm';
import { generateSessionToken, hashToken, hashPassword, verifyPassword } from './crypto';
import { clients, employees } from '../db/schema';
import type { DrizzleDB } from '../db/client';

export type UserRole = 'client' | 'employee' | 'admin';

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
};

export class AuthService {
  constructor(
    private db: DrizzleDB,
    private sessions: DurableObjectNamespace
  ) {}

  async signupClient(input: { name: string; email: string; password: string }): Promise<{ user: AuthUser; token: string }> {
    const email = input.email.toLowerCase();

    const [existingClient, existingEmployee] = await Promise.all([
      this.db.select({ id: clients.id }).from(clients).where(eq(clients.email, email)).limit(1),
      this.db.select({ id: employees.id }).from(employees).where(eq(employees.email, email)).limit(1),
    ]);

    if (existingClient.length > 0 || existingEmployee.length > 0) {
      throw new Error('EMAIL_EXISTS');
    }

    const passwordHash = await hashPassword(input.password);
    const [client] = await this.db.insert(clients)
      .values({ name: input.name, email, passwordHash })
      .returning({ id: clients.id, email: clients.email, name: clients.name });

    const token = await this.createSession(client.id, 'client');
    return { user: { id: client.id, email: client.email, name: client.name, role: 'client' }, token };
  }

  async login(input: { email: string; password: string }): Promise<{ user: AuthUser; token: string }> {
    const email = input.email.toLowerCase();

    const clientRows = await this.db.select().from(clients).where(eq(clients.email, email)).limit(1);
    if (clientRows.length > 0) {
      const c = clientRows[0];
      if (!await verifyPassword(input.password, c.passwordHash)) throw new Error('INVALID_CREDENTIALS');
      const token = await this.createSession(c.id, 'client');
      return { user: { id: c.id, email: c.email, name: c.name, role: 'client' }, token };
    }

    const employeeRows = await this.db.select().from(employees).where(eq(employees.email, email)).limit(1);
    if (employeeRows.length > 0) {
      const e = employeeRows[0];
      if (!await verifyPassword(input.password, e.passwordHash)) throw new Error('INVALID_CREDENTIALS');
      const role: UserRole = e.isAdmin ? 'admin' : 'employee';
      const token = await this.createSession(e.id, role);
      return { user: { id: e.id, email: e.email, name: e.name, role }, token };
    }

    throw new Error('INVALID_CREDENTIALS');
  }

  async validateSession(token: string): Promise<{ userId: string; role: UserRole }> {
    const dotIndex = token.indexOf('.');
    if (dotIndex === -1) throw new Error('INVALID_TOKEN');

    const userId = token.slice(0, dotIndex);
    const randomToken = token.slice(dotIndex + 1);
    const tokenHash = await hashToken(randomToken);

    const doId = this.sessions.idFromName(userId);
    const stub = this.sessions.get(doId);
    const response = await stub.fetch('https://sessions/validate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tokenHash }),
    });

    if (!response.ok) throw new Error('INVALID_SESSION');
    const result = await response.json<{ valid: boolean; sessionId: string; role: string }>();
    if (!result.valid) throw new Error('INVALID_SESSION');

    return { userId, role: result.role as UserRole };
  }

  async logout(token: string): Promise<void> {
    try {
      const dotIndex = token.indexOf('.');
      if (dotIndex === -1) return;
      const userId = token.slice(0, dotIndex);
      const randomToken = token.slice(dotIndex + 1);
      const tokenHash = await hashToken(randomToken);

      const doId = this.sessions.idFromName(userId);
      const stub = this.sessions.get(doId);

      const validateResponse = await stub.fetch('https://sessions/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tokenHash }),
      });
      const { sessionId } = await validateResponse.json<{ valid: boolean; sessionId: string }>();

      await stub.fetch('https://sessions/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId }),
      });
    } catch {
      // Silently ignore — logout should never throw
    }
  }

  private async createSession(userId: string, role: UserRole): Promise<string> {
    const randomToken = generateSessionToken();
    const tokenHash = await hashToken(randomToken);
    const sessionId = crypto.randomUUID();

    const doId = this.sessions.idFromName(userId);
    const stub = this.sessions.get(doId);
    await stub.fetch('https://sessions/create', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: sessionId, tokenHash, role }),
    });

    return `${userId}.${randomToken}`;
  }
}
