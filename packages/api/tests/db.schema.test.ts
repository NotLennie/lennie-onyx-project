import { describe, it, expect } from 'vitest';
import { clients, employees, roles, services, appointments, appointmentServices, ptoRequests } from '../src/db/schema';

describe('db schema', () => {
  it('exports all required tables', () => {
    expect(clients).toBeDefined();
    expect(employees).toBeDefined();
    expect(roles).toBeDefined();
    expect(services).toBeDefined();
    expect(appointments).toBeDefined();
    expect(appointmentServices).toBeDefined();
    expect(ptoRequests).toBeDefined();
  });
});
