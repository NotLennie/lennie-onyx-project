import type { PageServerLoad } from './$types';

type AppointmentRow = {
  id: string;
  date: string;
  status: 'new' | 'confirmed' | 'cancelled' | 'completed';
  createdAt: string;
  services: { serviceName: string; startTime: string; endTime: string; employeeName: string }[];
};

export const load: PageServerLoad = async ({ fetch, platform }) => {
  const API_BASE = platform?.env?.PUBLIC_API_URL ?? 'http://localhost:8787';
  try {
    const res = await fetch(`${API_BASE}/api/client/appointments`);
    if (!res.ok) return { upcoming: [] as AppointmentRow[], recentActivity: [] as AppointmentRow[] };
    const data = await res.json() as { appointments: AppointmentRow[] };
    const today = new Date().toISOString().slice(0, 10);
    const upcoming = data.appointments
      .filter((a) => (a.status === 'confirmed' || a.status === 'new') && a.date >= today)
      .slice(0, 1);
    const recentActivity = data.appointments
      .filter((a) => a.status === 'cancelled' || a.status === 'completed')
      .sort((a, b) => b.date.localeCompare(a.date))
      .slice(0, 5);
    return { upcoming, recentActivity };
  } catch {
    return { upcoming: [] as AppointmentRow[], recentActivity: [] as AppointmentRow[] };
  }
};
