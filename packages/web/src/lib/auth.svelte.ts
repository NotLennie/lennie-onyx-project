import type { SessionUser } from './api';

let user = $state<SessionUser | null>(null);

export const authStore = {
  get user() { return user; },
  set(u: SessionUser | null) { user = u; },
  clear() { user = null; },
};
