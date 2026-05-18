type SessionEntry = { tokenHash: string; role: string; createdAt: number };

export class UserSessions {
  private sessions = new Map<string, SessionEntry>();

  constructor(private state: DurableObjectState) {
    this.state.blockConcurrencyWhile(async () => {
      const stored = await this.state.storage.get<[string, SessionEntry][]>('sessions');
      if (stored) this.sessions = new Map(stored);
    });
  }

  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);
    const body = await request.json<any>();

    switch (url.pathname) {
      case '/create': {
        this.sessions.set(body.id, {
          tokenHash: body.tokenHash,
          role: body.role,
          createdAt: Date.now(),
        });
        await this.persist();
        return Response.json({ ok: true });
      }
      case '/validate': {
        for (const [sessionId, session] of this.sessions) {
          if (session.tokenHash === body.tokenHash) {
            return Response.json({ valid: true, sessionId, role: session.role });
          }
        }
        return Response.json({ valid: false }, { status: 401 });
      }
      case '/delete': {
        this.sessions.delete(body.sessionId);
        await this.persist();
        return Response.json({ ok: true });
      }
      default:
        return new Response('Not Found', { status: 404 });
    }
  }

  private async persist() {
    await this.state.storage.put('sessions', [...this.sessions.entries()]);
  }
}
