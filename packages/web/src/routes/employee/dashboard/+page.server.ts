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

export const load: PageServerLoad = async ({ fetch, platform }) => {
  const API_BASE = platform?.env?.PUBLIC_API_URL ?? 'http://localhost:8787';
  const today = new Date().toISOString().slice(0, 10);
  try {
    const res = await fetch(`${API_BASE}/api/employee/appointments?date=${today}`);
    if (!res.ok) return { appointments: [] as AppointmentRow[], today };
    const data = await res.json() as { appointments: AppointmentRow[] };
    return { appointments: data.appointments, today };
  } catch {
    return { appointments: [] as AppointmentRow[], today };
  }
};
