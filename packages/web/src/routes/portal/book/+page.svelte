<script lang="ts">
  import type { PageData } from './$types';
  import type { Service } from '@project/shared';
  import { api, type AvailableEmployee } from '$lib/api';
  import { goto } from '$app/navigation';

  let { data } = $props<{ data: PageData }>();

  let step = $state(1);
  let selectedService = $state<Service | null>(null);
  let selectedDate = $state('');
  let selectedTime = $state('');
  let availableEmployees = $state<AvailableEmployee[]>([]);
  let selectedEmployee = $state<AvailableEmployee | null>(null);
  let loadingEmployees = $state(false);
  let submitting = $state(false);
  let error = $state('');

  // Generate valid dates (Thu–Sun) for next 4 weeks
  const validDates = $derived.by(() => {
    const dates: string[] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    for (let i = 1; i <= 28; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      const day = d.getDay();
      if ([0, 4, 5, 6].includes(day)) {
        dates.push(d.toISOString().slice(0, 10));
      }
    }
    return dates;
  });

  // Generate time slots within operating hours for selected service
  const timeSlots = $derived.by(() => {
    if (!selectedService) return [];
    const slots: string[] = [];
    const duration = selectedService.durationMinutes;
    const startMin = 7 * 60;
    const endMin = 19 * 60;
    for (let m = startMin; m + duration <= endMin; m += 30) {
      const h = Math.floor(m / 60).toString().padStart(2, '0');
      const min = (m % 60).toString().padStart(2, '0');
      slots.push(`${h}:${min}`);
    }
    return slots;
  });

  async function loadAvailability() {
    if (!selectedService || !selectedDate || !selectedTime) return;
    loadingEmployees = true;
    error = '';
    try {
      const res = await api.client.availability({
        date: selectedDate,
        serviceId: selectedService.id,
        startTime: selectedTime,
      });
      availableEmployees = res.employees;
      if (res.employees.length === 0) {
        error = 'No staff available for this time slot. Please choose another.';
      }
    } catch (e) {
      error = e instanceof Error ? e.message : 'Failed to check availability';
      availableEmployees = [];
    } finally {
      loadingEmployees = false;
    }
  }

  async function submit() {
    if (!selectedService || !selectedDate || !selectedTime || !selectedEmployee) return;
    submitting = true;
    error = '';
    try {
      await api.client.appointments.create({
        date: selectedDate,
        services: [{
          serviceId: selectedService.id,
          employeeId: selectedEmployee.id,
          startTime: selectedTime,
        }],
      });
      goto('/portal/appointments');
    } catch (e) {
      error = e instanceof Error ? e.message : 'Booking failed';
      submitting = false;
    }
  }

  function formatDate(d: string) {
    return new Date(d + 'T00:00:00').toLocaleDateString('en-US', {
      weekday: 'short', month: 'short', day: 'numeric',
    });
  }

  function selectService(svc: Service) {
    selectedService = svc;
    selectedDate = '';
    selectedTime = '';
    availableEmployees = [];
    selectedEmployee = null;
    step = 2;
  }

  function selectDate(d: string) {
    selectedDate = d;
    selectedTime = '';
    availableEmployees = [];
    selectedEmployee = null;
  }

  async function selectTime(t: string) {
    selectedTime = t;
    selectedEmployee = null;
    step = 3;
    await loadAvailability();
  }

  function selectEmployee(emp: AvailableEmployee) {
    selectedEmployee = emp;
    step = 4;
  }
</script>

<div class="max-w-2xl">
  <h1 class="text-3xl font-bold text-white mb-2">Book Appointment</h1>
  <p class="text-gray-400 mb-8">We're open Thursday through Tuesday, 7:00 AM – 7:00 PM.</p>

  {#if error}
    <div class="mb-4 p-3 rounded-lg text-sm" style="background-color: rgba(239,68,68,0.1); color: #ef4444; border: 1px solid rgba(239,68,68,0.3)">
      {error}
    </div>
  {/if}

  <!-- Step indicator -->
  <div class="flex items-center gap-2 mb-8">
    {#each [1,2,3,4] as s}
      <div
        class="h-1.5 flex-1 rounded-full transition-colors"
        style={step >= s ? 'background-color: var(--color-gold)' : 'background-color: var(--color-border)'}
      ></div>
    {/each}
  </div>

  <!-- Step 1: Select service -->
  {#if step >= 1}
    <section class="mb-6">
      <h2 class="text-lg font-semibold text-white mb-3">1. Choose a Service</h2>
      {#if data.services.length === 0}
        <p class="text-gray-400 text-sm">No services available.</p>
      {:else}
        <div class="grid gap-2">
          {#each data.services as svc}
            <button
              onclick={() => selectService(svc)}
              class="flex items-center justify-between p-4 rounded-xl text-left transition-all"
              style={selectedService?.id === svc.id
                ? 'background-color: rgba(201,168,76,0.15); border: 1px solid var(--color-gold)'
                : 'background-color: var(--color-surface); border: 1px solid var(--color-border)'}
            >
              <div>
                <div class="font-medium text-white">{svc.name}</div>
                {#if svc.description}
                  <div class="text-sm text-gray-400 mt-0.5">{svc.description}</div>
                {/if}
              </div>
              <div class="text-right flex-shrink-0 ml-4">
                <div class="font-semibold" style="color: var(--color-gold)">${svc.price}</div>
                <div class="text-xs text-gray-400">{svc.durationMinutes} min</div>
              </div>
            </button>
          {/each}
        </div>
      {/if}
    </section>
  {/if}

  <!-- Step 2: Select date and time -->
  {#if step >= 2 && selectedService}
    <section class="mb-6">
      <h2 class="text-lg font-semibold text-white mb-3">2. Choose Date &amp; Time</h2>

      <div class="mb-4">
        <p class="text-sm text-gray-400 mb-2">Available dates (Thu–Sun):</p>
        <div class="flex flex-wrap gap-2">
          {#each validDates as d}
            <button
              onclick={() => selectDate(d)}
              class="px-3 py-1.5 rounded-lg text-sm font-medium transition-all"
              style={selectedDate === d
                ? 'background-color: var(--color-gold); color: #1a1a1a'
                : 'background-color: var(--color-surface); color: white; border: 1px solid var(--color-border)'}
            >
              {formatDate(d)}
            </button>
          {/each}
        </div>
      </div>

      {#if selectedDate}
        <div>
          <p class="text-sm text-gray-400 mb-2">Available times:</p>
          <div class="flex flex-wrap gap-2">
            {#each timeSlots as t}
              <button
                onclick={() => selectTime(t)}
                class="px-3 py-1.5 rounded-lg text-sm font-medium transition-all"
                style={selectedTime === t
                  ? 'background-color: var(--color-gold); color: #1a1a1a'
                  : 'background-color: var(--color-surface); color: white; border: 1px solid var(--color-border)'}
              >
                {t}
              </button>
            {/each}
          </div>
        </div>
      {/if}
    </section>
  {/if}

  <!-- Step 3: Select employee -->
  {#if step >= 3 && selectedTime}
    <section class="mb-6">
      <h2 class="text-lg font-semibold text-white mb-3">3. Choose a Stylist</h2>
      {#if loadingEmployees}
        <p class="text-gray-400 text-sm">Checking availability…</p>
      {:else if availableEmployees.length === 0 && !error}
        <p class="text-gray-400 text-sm">No stylists available.</p>
      {:else}
        <div class="grid gap-2">
          {#each availableEmployees as emp}
            <button
              onclick={() => selectEmployee(emp)}
              class="flex items-center gap-3 p-4 rounded-xl text-left transition-all"
              style={selectedEmployee?.id === emp.id
                ? 'background-color: rgba(201,168,76,0.15); border: 1px solid var(--color-gold)'
                : 'background-color: var(--color-surface); border: 1px solid var(--color-border)'}
            >
              <div class="w-9 h-9 rounded-full flex items-center justify-center font-semibold text-sm flex-shrink-0"
                style="background-color: rgba(201,168,76,0.2); color: var(--color-gold)">
                {emp.name.charAt(0).toUpperCase()}
              </div>
              <span class="font-medium text-white">{emp.name}</span>
            </button>
          {/each}
        </div>
      {/if}
    </section>
  {/if}

  <!-- Step 4: Confirm -->
  {#if step >= 4 && selectedEmployee}
    <section>
      <h2 class="text-lg font-semibold text-white mb-3">4. Confirm Booking</h2>
      <div class="rounded-xl p-5 mb-4" style="background-color: var(--color-surface); border: 1px solid var(--color-border)">
        <div class="space-y-2 text-sm">
          <div class="flex justify-between">
            <span class="text-gray-400">Service</span>
            <span class="text-white font-medium">{selectedService?.name}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-400">Date</span>
            <span class="text-white">{formatDate(selectedDate)}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-400">Time</span>
            <span class="text-white">{selectedTime}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-400">Stylist</span>
            <span class="text-white">{selectedEmployee?.name}</span>
          </div>
          <div class="flex justify-between pt-2" style="border-top: 1px solid var(--color-border)">
            <span class="text-gray-400">Price</span>
            <span class="font-semibold" style="color: var(--color-gold)">${selectedService?.price}</span>
          </div>
        </div>
      </div>
      <button
        onclick={submit}
        disabled={submitting}
        class="w-full py-3 rounded-xl font-semibold text-sm transition-opacity disabled:opacity-50"
        style="background-color: var(--color-gold); color: #1a1a1a"
      >
        {submitting ? 'Booking…' : 'Confirm Booking'}
      </button>
    </section>
  {/if}
</div>
