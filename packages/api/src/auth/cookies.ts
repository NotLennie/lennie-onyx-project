const COOKIE_NAME = 'session';
const COOKIE_OPTIONS = 'HttpOnly; Path=/; SameSite=Lax; Secure; Max-Age=604800'; // 7 days

export function setSessionCookie(token: string): string {
  return `${COOKIE_NAME}=${token}; ${COOKIE_OPTIONS}`;
}

export function clearSessionCookie(): string {
  return `${COOKIE_NAME}=; HttpOnly; Path=/; SameSite=Lax; Secure; Max-Age=0`;
}

export function getSessionCookie(cookieHeader: string | null): string | null {
  if (!cookieHeader) return null;
  const match = cookieHeader.match(new RegExp(`(?:^|;\\s*)${COOKIE_NAME}=([^;]+)`));
  return match?.[1] ?? null;
}
