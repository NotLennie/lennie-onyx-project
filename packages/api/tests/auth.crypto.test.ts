import { describe, it, expect } from 'vitest';
import { hashPassword, verifyPassword, generateSessionToken, hashToken } from '../src/auth/crypto';

describe('crypto', () => {
  it('hashes and verifies a password', async () => {
    const hash = await hashPassword('secret123');
    expect(await verifyPassword('secret123', hash)).toBe(true);
    expect(await verifyPassword('wrong', hash)).toBe(false);
  });

  it('generates a 32-char session token', () => {
    const token = generateSessionToken();
    expect(token).toHaveLength(32);
  });

  it('hashes a token to a 64-char hex string', async () => {
    const hash = await hashToken('sometoken');
    expect(hash).toHaveLength(64);
    expect(hash).toMatch(/^[0-9a-f]+$/);
  });

  it('produces consistent hashes for the same token', async () => {
    const hash1 = await hashToken('abc');
    const hash2 = await hashToken('abc');
    expect(hash1).toBe(hash2);
  });
});
