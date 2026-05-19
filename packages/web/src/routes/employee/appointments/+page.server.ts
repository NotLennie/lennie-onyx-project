import type { PageServerLoad } from './$types';

type AppointmentRow = {
  appointmentId: string;
  date: string;
  status: 'confirmed' | 'cancelled' | 'completed';
  clientName: string;
  serviceName: string;
  startTime: string;
  endTime: string;
};

export const load: PageServerLoad = async ({ fetch, platform, url }) => {
  const API_BASE = platform?.env?.API_URL ?? 'http://localhost:8787';
  const date = url.searchParams.get('date') ?? new Date().toISOString().slice(0, 10);
  try {
    const res = await fetch(`${API_BASE}/api/employee/appointments?date=${date}`);
    if (!res.ok) return { appointments: [] as AppointmentRow[], date };
    const data = await res.json() as { appointments: AppointmentRow[] };
    return { appointments: data.appointments, date };
  } catch {
    return { appointments: [] as AppointmentRow[], date };
  }
};
