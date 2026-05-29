import type {
  LoginInput, SignupInput,
  Service, CreateServiceInput,
  Employee, CreateEmployeeInput, UpdateEmployeeInput,
  PtoRequest, CreatePtoRequestInput,
  Appointment, Client, UpdateClientInput, CreateAppointmentInput,
} from '@project/shared';

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

export type ClientRow = { id: string; name: string; email: string; phone: string | null; address: string | null; profilePictureUrl: string | null; createdAt: string };

export type AppointmentRow = {
  appointmentId: string;
  date: string;
  status: 'new' | 'confirmed' | 'cancelled' | 'completed';
  clientName: string;
  serviceId: string;
  serviceName: string;
  price: string;
  startTime: string;
  endTime: string;
};

export type AdminAppointmentRow = {
  id: string;
  date: string;
  status: 'new' | 'confirmed' | 'cancelled' | 'completed';
  clientName: string;
  createdAt: string;
  services: { id: string; serviceName: string; employeeName: string; startTime: string; endTime: string }[];
};

export type AvailableEmployee = { id: string; name: string };

export const api = {
  auth: {
    signup: (input: SignupInput) =>
      request<{ user: SessionUser }>('/api/auth/signup', { method: 'POST', body: JSON.stringify(input) }),
    login: (input: LoginInput) =>
      request<{ user: SessionUser }>('/api/auth/login', { method: 'POST', body: JSON.stringify(input) }),
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
      uploadPicture: async (file: File): Promise<{ url: string }> => {
        const form = new FormData();
        form.append('file', file);
        // POST to the SvelteKit proxy route (same-origin, relative URL) so the
        // client bundle does not need PUBLIC_API_URL.  That value is a Cloudflare
        // runtime binding — it is never injected into import.meta.env at Vite
        // build time, so BASE would fall back to http://localhost:8787 in
        // production and every cross-origin fetch would fail with "Failed to fetch".
        const res = await fetch('/portal/profile/picture', {
          method: 'POST',
          credentials: 'include',
          body: form,
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({ error: res.statusText })) as { error: string };
          throw new Error(err.error ?? res.statusText);
        }
        return res.json() as Promise<{ url: string }>;
      },
    },
  },
  employee: {
    appointments: {
      list: (date?: string) =>
        request<{ appointments: AppointmentRow[] }>(`/api/employee/appointments${date ? `?date=${date}` : ''}`),
      updateStatus: (id: string, status: 'new' | 'confirmed' | 'cancelled' | 'completed') =>
        request<{ ok: boolean }>(`/api/employee/appointments/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
    },
    pto: {
      list: () =>
        request<{ pto: PtoRequest[] }>('/api/employee/pto'),
      create: (input: CreatePtoRequestInput) =>
        request<{ pto: PtoRequest }>('/api/employee/pto', { method: 'POST', body: JSON.stringify(input) }),
      delete: (id: string) =>
        request<{ ok: boolean }>(`/api/employee/pto/${id}`, { method: 'DELETE' }),
      updateStatus: (id: string, status: 'approved' | 'declined') =>
        request<{ ok: boolean }>(`/api/employee/pto/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
    },
    profile: {
      get: () =>
        request<{ user: Employee }>('/api/employee/profile'),
      update: (input: UpdateEmployeeInput) =>
        request<{ user: Employee }>('/api/employee/profile', { method: 'PUT', body: JSON.stringify(input) }),
      uploadPicture: async (file: File): Promise<{ url: string }> => {
        const form = new FormData();
        form.append('file', file);
        // Same-origin proxy route — see client.profile.uploadPicture for rationale.
        const res = await fetch('/employee/profile/picture', {
          method: 'POST',
          credentials: 'include',
          body: form,
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({ error: res.statusText })) as { error: string };
          throw new Error(err.error ?? res.statusText);
        }
        return res.json() as Promise<{ url: string }>;
      },
    },
    clients: {
      list: () =>
        request<{ clients: ClientRow[] }>('/api/employee/clients'),
    },
    services: {
      list: () =>
        request<{ services: Service[] }>('/api/employee/services'),
    },
    employees: {
      list: () =>
        request<{ employees: Employee[] }>('/api/employee/employees'),
    },
    roles: {
      list: () =>
        request<{ roles: { id: string; name: string }[] }>('/api/employee/roles'),
    },
  },
  admin: {
    clients: {
      list: () =>
        request<{ clients: ClientRow[] }>('/api/admin/clients'),
    },
    appointments: {
      list: (date?: string) =>
        request<{ appointments: AdminAppointmentRow[] }>(`/api/admin/appointments${date ? `?date=${date}` : ''}`),
      updateStatus: (id: string, status: 'new' | 'confirmed' | 'cancelled' | 'completed') =>
        request<{ ok: boolean }>(`/api/admin/appointments/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
    },
    services: {
      list: () =>
        request<{ services: Service[] }>('/api/admin/services'),
      create: (input: CreateServiceInput) =>
        request<{ service: Service }>('/api/admin/services', { method: 'POST', body: JSON.stringify(input) }),
      update: (id: string, input: Partial<CreateServiceInput> & { isActive?: boolean }) =>
        request<{ service: Service }>(`/api/admin/services/${id}`, { method: 'PUT', body: JSON.stringify(input) }),
    },
    employees: {
      list: () =>
        request<{ employees: Employee[] }>('/api/admin/employees'),
      create: (input: CreateEmployeeInput) =>
        request<{ employee: Pick<Employee, 'id' | 'name' | 'email' | 'isAdmin'> }>('/api/admin/employees', { method: 'POST', body: JSON.stringify(input) }),
      update: (id: string, input: { name?: string; email?: string; isAdmin?: boolean; isActive?: boolean; roleIds?: string[] }) =>
        request<{ ok: boolean }>(`/api/admin/employees/${id}`, { method: 'PATCH', body: JSON.stringify(input) }),
    },
    roles: {
      list: () =>
        request<{ roles: { id: string; name: string }[] }>('/api/admin/roles'),
    },
    pto: {
      list: () =>
        request<{ pto: PtoRequest[] }>('/api/admin/pto'),
      updateStatus: (id: string, status: 'approved' | 'declined') =>
        request<{ ok: boolean }>(`/api/admin/pto/${id}`, { method: 'PATCH', body: JSON.stringify({ status }) }),
    },
  },
  public: {
    services: () =>
      request<{ services: Service[] }>('/api/public/services'),
  },
};
