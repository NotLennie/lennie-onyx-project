import type { PageServerLoad } from './$types';

type AppointmentRow = {
  id: string;
  date: string;
  status: 'confirmed' | 'cancelled' | 'completed';
  createdAt: string;
  services: {
    id: string;
    serviceName: string;
    startTime: string;
    endTime: string;
    employeeName: string;
    price: string;
  }[];
};

export const load: PageServerLoad = async ({ fetch, platform }) => {
  const API_BASE = platform?.env?.PUBLIC_API_URL ?? 'http://localhost:8787';
  try {
    const res = await fetch(`${API_BASE}/api/client/appointments`);
    if (!res.ok) return { appointments: [] as AppointmentRow[] };
    const data = await res.json() as { appointments: AppointmentRow[] };
    return { appointments: data.appointments };
  } catch {
    return { appointments: [] as AppointmentRow[] };
  }
};
