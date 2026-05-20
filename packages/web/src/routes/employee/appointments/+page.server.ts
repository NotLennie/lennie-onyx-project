import type { PageServerLoad } from './$types';

type AppointmentRow = {
  appointmentId: string;
  date: string;
  status: 'new' | 'confirmed' | 'cancelled' | 'completed';
  clientName: string;
  serviceName: string;
  price: string;
  startTime: string;
  endTime: string;
};

export const load: PageServerLoad = async ({ fetch, platform }) => {
  const API_BASE = platform?.env?.PUBLIC_API_URL ?? 'http://localhost:8787';
  try {
    const res = await fetch(`${API_BASE}/api/employee/appointments`);
    if (!res.ok) return { appointments: [] as AppointmentRow[] };
    const data = await res.json() as { appointments: AppointmentRow[] };
    return { appointments: data.appointments };
  } catch {
    return { appointments: [] as AppointmentRow[] };
  }
};
