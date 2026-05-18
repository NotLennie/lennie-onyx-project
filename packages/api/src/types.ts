import type { DrizzleDB } from './db/client';
import type { UserRole } from './auth/service';

export type Env = {
  Bindings: {
    DATABASE_URL: string;
    USER_SESSIONS: DurableObjectNamespace;
  };
  Variables: {
    db: DrizzleDB;
    userId: string;
    userRole: UserRole;
  };
};
