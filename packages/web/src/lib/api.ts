import type {
  LoginInput, SignupInput, Service, CreateServiceInput,
  Employee, CreateEmployeeInput, UpdateEmployeeInput,
  PtoRequest, CreatePtoRequestInput,
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

export type ClientRow = { id: string; name: string; email: string; profilePictureUrl: string | null; createdAt: string };

export type AppointmentRow = {
  appointmentId: string;
  date: string;
  status: 'confirmed' | 'cancelled' | 'completed';
  clientName: string;
  serviceId: string;
  serviceName: string;
  startTime: string;
  endTime: string;
};

export type AdminAppointmentRow = {
  id: string;
  date: string;
  status: 'confirmed' | 'cancelled' | 'completed';
  clientName: string;
  createdAt: string;
  services: { id: string; serviceName: string; employeeName: string; startTime: string; endTime: string }[];
};

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
  employee: {
    appointments: {
      list: (date?: string) =>
        request<{ appointments: AppointmentRow[] }>(`/api/employee/appointments${date ? `?date=${date}` : ''}`),
      complete: (id: string) =>
        request<{ ok: boolean }>(`/api/employee/appointments/${id}/complete`, { method: 'PATCH' }),
    },
    pto: {
      list: () =>
        request<{ pto: PtoRequest[] }>('/api/employee/pto'),
      create: (input: CreatePtoRequestInput) =>
        request<{ pto: PtoRequest }>('/api/employee/pto', { method: 'POST', body: JSON.stringify(input) }),
      delete: (id: string) =>
        request<{ ok: boolean }>(`/api/employee/pto/${id}`, { method: 'DELETE' }),
    },
    profile: {
      get: () =>
        request<{ user: Employee }>('/api/employee/profile'),
      update: (input: UpdateEmployeeInput) =>
        request<{ user: Employee }>('/api/employee/profile', { method: 'PUT', body: JSON.stringify(input) }),
      uploadPicture: (file: File) => {
        const form = new FormData();
        form.append('file', file);
        return requestForm<{ url: string }>('/api/employee/profile/picture', form);
      },
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
      updateStatus: (id: string, status: 'confirmed' | 'cancelled' | 'completed') =>
        request<{ ok: boolean }>(`/api/admin/appointments/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
    },
    services: {
      list: () =>
        request<{ services: Service[] }>('/api/admin/services'),
      create: (input: CreateServiceInput) =>
        request<{ service: Service }>('/api/admin/services', { method: 'POST', body: JSON.stringify(input) }),
      update: (id: string, input: Partial<CreateServiceInput>) =>
        request<{ service: Service }>(`/api/admin/services/${id}`, { method: 'PUT', body: JSON.stringify(input) }),
      delete: (id: string) =>
        request<{ ok: boolean }>(`/api/admin/services/${id}`, { method: 'DELETE' }),
    },
    employees: {
      list: () =>
        request<{ employees: Employee[] }>('/api/admin/employees'),
      create: (input: CreateEmployeeInput) =>
        request<{ employee: Pick<Employee, 'id' | 'name' | 'email' | 'isAdmin'> }>('/api/admin/employees', { method: 'POST', body: JSON.stringify(input) }),
      delete: (id: string) =>
        request<{ ok: boolean }>(`/api/admin/employees/${id}`, { method: 'DELETE' }),
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
