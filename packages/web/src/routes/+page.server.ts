import type { PageServerLoad } from './$types';
import { api } from '$lib/api';

export const load: PageServerLoad = async () => {
  try {
    const { services } = await api.public.services();
    return { services };
  } catch {
    return { services: [] };
  }
};
