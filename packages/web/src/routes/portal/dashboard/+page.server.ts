import type { PageServerLoad } from './$types';

type AppointmentRow = {
  id: string;
  date: string;
  status: 'confirmed' | 'cancelled' | 'completed';
  createdAt: string;
  services: { serviceName: string; startTime: string; endTime: string; employeeName: string }[];
};

export const load: PageServerLoad = async ({ fetch, platform }) => {
  const API_BASE = platform?.env?.PUBLIC_API_URL ?? 'http://localhost:8787';
  try {
    const res = await fetch(`${API_BASE}/api/client/appointments`);
    if (!res.ok) return { appointments: [] as AppointmentRow[] };
    const data = await res.json() as { appointments: AppointmentRow[] };
    const upcoming = data.appointments
      .filter((a) => a.status === 'confirmed' && a.date >= new Date().toISOString().slice(0, 10))
      .slice(0, 3);
    return { appointments: upcoming };
  } catch {
    return { appointments: [] as AppointmentRow[] };
  }
};
