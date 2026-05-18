import type { LoginInput, SignupInput, Appointment, Client, Service, UpdateClientInput, CreateAppointmentInput } from '@project/shared';

const BASE = import.meta.env.PUBLIC_API_URL ?? 'http://localhost:8787';

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    ...init,
    credentials: 'include',
    headers: { 'Content-Type': 'application/json', ...init?.headers },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText })) as { error: string };
    throw new Error(err.error ?? res.statusText);
  }
  return res.json() as Promise<T>;
}

async function requestForm<T>(path: string, body: FormData): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    method: 'POST',
    credentials: 'include',
    body,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: res.statusText })) as { error: string };
    throw new Error(err.error ?? res.statusText);
  }
  return res.json() as Promise<T>;
}

export type SessionUser = {
  id: string;
  name: string;
  email: string;
  profilePictureUrl: string | null;
  role: 'client' | 'employee' | 'admin';
};

export type AvailableEmployee = { id: string; name: string };

export const api = {
  auth: {
    signup: (input: SignupInput) =>
      request<{ user: SessionUser }>('/api/auth/signup', {
        method: 'POST',
        body: JSON.stringify(input),
      }),
    login: (input: LoginInput) =>
      request<{ user: SessionUser }>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify(input),
      }),
    logout: () =>
      request<{ ok: boolean }>('/api/auth/logout', { method: 'POST' }),
    me: () =>
      request<{ user: SessionUser }>('/api/auth/me'),
  },
  client: {
    appointments: {
      list: () =>
        request<{ appointments: Appointment[] }>('/api/client/appointments'),
      create: (input: CreateAppointmentInput) =>
        request<{ appointment: Pick<Appointment, 'id' | 'date' | 'status'> }>('/api/client/appointments', {
          method: 'POST',
          body: JSON.stringify(input),
        }),
      cancel: (id: string) =>
        request<{ ok: boolean }>(`/api/client/appointments/${id}/cancel`, { method: 'PATCH' }),
    },
    availability: (params: { date: string; serviceId: string; startTime: string }) =>
      request<{ employees: AvailableEmployee[] }>(
        `/api/client/availability?date=${params.date}&serviceId=${params.serviceId}&startTime=${encodeURIComponent(params.startTime)}`
      ),
    profile: {
      get: () =>
        request<{ user: Client }>('/api/client/profile'),
      update: (input: UpdateClientInput) =>
        request<{ user: Client }>('/api/client/profile', {
          method: 'PUT',
          body: JSON.stringify(input),
        }),
      uploadPicture: (file: File) => {
        const form = new FormData();
        form.append('file', file);
        return requestForm<{ url: string }>('/api/client/profile/picture', form);
      },
    },
  },
  public: {
    services: () =>
      request<{ services: Service[] }>('/api/public/services'),
  },
};
