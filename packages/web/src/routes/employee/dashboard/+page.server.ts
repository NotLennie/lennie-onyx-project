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
  const today = new Date().toISOString().slice(0, 10);
  try {
    const [todayRes, allRes] = await Promise.all([
      fetch(`${API_BASE}/api/employee/appointments?date=${today}`),
      fetch(`${API_BASE}/api/employee/appointments`),
    ]);
    const todayAppts: AppointmentRow[] = todayRes.ok ? (await todayRes.json() as { appointments: AppointmentRow[] }).appointments : [];
    const allAppts: AppointmentRow[] = allRes.ok ? (await allRes.json() as { appointments: AppointmentRow[] }).appointments : [];
    return { todayAppointments: todayAppts, allAppointments: allAppts, today };
  } catch {
    return { todayAppointments: [] as AppointmentRow[], allAppointments: [] as AppointmentRow[], today };
  }
};
