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

  // Calendar state
  const now = new Date();
  let calendarYear = $state(now.getFullYear());
  let calendarMonth = $state(now.getMonth()); // 0-indexed

  function toDateStr(d: Date): string {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }

  const todayStr = toDateStr(now);
  const cutoff = new Date(now);
  cutoff.setDate(cutoff.getDate() + 14);
  const cutoffStr = toDateStr(cutoff);

  // Each cell: { day, dateStr, state }
  type CellState = 'empty' | 'past' | 'today' | 'wednesday' | 'out-of-range' | 'available' | 'selected';
  type Cell = { day: number | null; dateStr: string | null; state: CellState };

  const calendarCells = $derived.by((): Cell[] => {
    const firstDay = new Date(calendarYear, calendarMonth, 1);
    const startDow = firstDay.getDay(); // 0=Sun
    const daysInMonth = new Date(calendarYear, calendarMonth + 1, 0).getDate();
    const cells: Cell[] = [];

    for (let i = 0; i < startDow; i++) {
      cells.push({ day: null, dateStr: null, state: 'empty' });
    }

    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(calendarYear, calendarMonth, d);
      const dateStr = `${calendarYear}-${String(calendarMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const dow = date.getDay();

      let state: CellState;
      if (dateStr < todayStr) {
        state = 'past';
      } else if (dateStr === todayStr) {
        state = 'today';
      } else if (dow === 3) {
        state = 'wednesday';
      } else if (dateStr > cutoffStr) {
        state = 'out-of-range';
      } else if (dateStr === selectedDate) {
        state = 'selected';
      } else {
        state = 'available';
      }

      cells.push({ day: d, dateStr, state });
    }

    return cells;
  });

  const canGoPrev = $derived(
    calendarYear > now.getFullYear() || calendarMonth > now.getMonth()
  );
  const canGoNext = $derived.by(() => {
    const totalMonths = now.getFullYear() * 12 + now.getMonth() + 2;
    const currentTotal = calendarYear * 12 + calendarMonth;
    return currentTotal < totalMonths;
  });

  function prevMonth() {
    if (!canGoPrev) return;
    if (calendarMonth === 0) { calendarMonth = 11; calendarYear--; }
    else calendarMonth--;
  }

  function nextMonth() {
    if (!canGoNext) return;
    if (calendarMonth === 11) { calendarMonth = 0; calendarYear++; }
    else calendarMonth++;
  }

  const monthName = $derived(
    new Date(calendarYear, calendarMonth, 1).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }).toUpperCase()
  );

  // Time slots for selected service
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

  const selectedDateLabel = $derived(
    selectedDate
      ? new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
      : ''
  );

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

  function selectService(svc: Service) {
    selectedService = svc;
    selectedDate = '';
    selectedTime = '';
    availableEmployees = [];
    selectedEmployee = null;
    step = 2;
  }

  function selectDate(dateStr: string) {
    selectedDate = dateStr;
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

  // Cell style helper
  function cellStyle(state: CellState): string {
    const base = 'text-align:center;font-size:9px;padding:6px 2px;';
    if (state === 'empty') return base;
    if (state === 'past') return base + 'color:rgba(255,255,255,0.15);';
    if (state === 'today') return base + 'color:rgba(255,255,255,0.3);border:1px solid #555;';
    if (state === 'wednesday') return base + 'color:rgba(255,255,255,0.1);';
    if (state === 'out-of-range') return base + 'color:rgba(255,255,255,0.15);';
    if (state === 'selected') return base + 'background:var(--color-gold);color:#000;font-weight:700;cursor:pointer;';
    return base + 'color:white;cursor:pointer;'; // available
  }
</script>

<style>
  .calendar-grid { display: grid; grid-template-columns: repeat(7, 1fr); gap: 2px; }
</style>

<div style="max-width:560px;">
  <!-- Header -->
  <div style="color:rgba(255,255,255,0.4);font-size:8px;letter-spacing:0.25em;text-transform:uppercase;margin-bottom:4px;">Client Portal</div>
  <div style="color:white;font-size:20px;font-family:serif;font-weight:300;letter-spacing:0.05em;margin-bottom:16px;">BOOK APPOINTMENT</div>

  <!-- Step indicator -->
  <div style="display:flex;gap:4px;margin-bottom:6px;">
    {#each [1,2,3,4] as s}
      <div style="height:2px;flex:1;{step >= s ? 'background:var(--color-gold);' : 'background:var(--color-border);'}"></div>
    {/each}
  </div>
  <div style="color:rgba(255,255,255,0.25);font-size:8px;letter-spacing:0.1em;margin-bottom:20px;">
    Step {step} of 4{selectedService ? ` — ${selectedService.name} · ${selectedService.durationMinutes} min · $${selectedService.price}` : ''}
  </div>

  {#if error}
    <div role="alert" style="margin-bottom:12px;padding:10px 14px;font-size:10px;color:#f87171;border:1px solid rgba(239,68,68,0.3);background:rgba(239,68,68,0.08);">
      {error}
    </div>
  {/if}

  <!-- Step 1: Choose a Service -->
  {#if step >= 1}
    <section style="margin-bottom:20px;">
      <div style="color:rgba(255,255,255,0.35);font-size:8px;letter-spacing:0.2em;text-transform:uppercase;margin-bottom:10px;">Choose a Service</div>
      {#each data.services as svc}
        <button
          onclick={() => selectService(svc)}
          style="width:100%;display:flex;justify-content:space-between;align-items:center;padding:12px;margin-bottom:4px;border:none;cursor:pointer;text-align:left;
            {selectedService?.id === svc.id
              ? 'background:rgba(201,168,76,0.08);border:1px solid var(--color-gold);'
              : 'background:var(--color-surface);border:1px solid var(--color-border);'}"
        >
          <div>
            <div style="color:white;font-size:11px;font-weight:500;margin-bottom:2px;">{svc.name}</div>
            {#if svc.description}
              <div style="color:rgba(255,255,255,0.4);font-size:9px;">{svc.description}</div>
            {/if}
          </div>
          <div style="text-align:right;flex-shrink:0;margin-left:16px;">
            <div style="color:var(--color-gold);font-size:11px;font-weight:600;">${svc.price}</div>
            <div style="color:rgba(255,255,255,0.3);font-size:9px;">{svc.durationMinutes} min</div>
          </div>
        </button>
      {/each}
    </section>
  {/if}

  <!-- Step 2: Calendar date picker + time slots -->
  {#if step >= 2 && selectedService}
    <section style="margin-bottom:20px;">
      <div style="color:rgba(255,255,255,0.35);font-size:8px;letter-spacing:0.2em;text-transform:uppercase;margin-bottom:10px;">Choose a Date</div>

      <!-- Calendar -->
      <div style="background:var(--color-surface);border:1px solid var(--color-border);padding:14px;margin-bottom:16px;max-width:290px;">
        <!-- Month nav -->
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
          <button
            onclick={prevMonth}
            disabled={!canGoPrev}
            style="background:none;border:none;cursor:{canGoPrev ? 'pointer' : 'default'};color:{canGoPrev ? 'rgba(255,255,255,0.6)' : 'rgba(255,255,255,0.15)'};font-size:14px;padding:0 4px;"
          >‹</button>
          <div style="color:white;font-size:10px;letter-spacing:0.15em;">{monthName}</div>
          <button
            onclick={nextMonth}
            disabled={!canGoNext}
            style="background:none;border:none;cursor:{canGoNext ? 'pointer' : 'default'};color:{canGoNext ? 'rgba(255,255,255,0.6)' : 'rgba(255,255,255,0.15)'};font-size:14px;padding:0 4px;"
          >›</button>
        </div>

        <!-- Day headers -->
        <div class="calendar-grid" style="margin-bottom:4px;">
          {#each ['Su','Mo','Tu','We','Th','Fr','Sa'] as dow, i}
            <div style="text-align:center;font-size:8px;letter-spacing:0.08em;padding:3px 0;
              {i === 3 ? 'color:rgba(255,255,255,0.2);text-decoration:line-through;' : 'color:var(--color-gold);'}">
              {dow}
            </div>
          {/each}
        </div>

        <!-- Day cells -->
        <div class="calendar-grid">
          {#each calendarCells as cell}
            {#if cell.state === 'available' || cell.state === 'selected'}
              <button
                onclick={() => cell.dateStr && selectDate(cell.dateStr)}
                style="background:none;border:none;{cellStyle(cell.state)}"
              >{cell.day}</button>
            {:else}
              <div style={cellStyle(cell.state)}>{cell.day ?? ''}</div>
            {/if}
          {/each}
        </div>

        <!-- Legend -->
        <div style="border-top:1px solid var(--color-border);margin-top:10px;padding-top:8px;display:flex;gap:14px;flex-wrap:wrap;">
          <div style="display:flex;align-items:center;gap:4px;">
            <div style="width:8px;height:8px;background:var(--color-gold);"></div>
            <div style="color:rgba(255,255,255,0.3);font-size:8px;">Selected</div>
          </div>
          <div style="display:flex;align-items:center;gap:4px;">
            <div style="width:8px;height:8px;border:1px solid #555;"></div>
            <div style="color:rgba(255,255,255,0.3);font-size:8px;">Today</div>
          </div>
          <div style="display:flex;align-items:center;gap:4px;">
            <div style="width:8px;height:8px;background:rgba(255,255,255,0.05);"></div>
            <div style="color:rgba(255,255,255,0.3);font-size:8px;">Unavailable</div>
          </div>
        </div>
      </div>

      <!-- Time slots — shown after date selected -->
      {#if selectedDate}
        <div style="color:rgba(255,255,255,0.35);font-size:8px;letter-spacing:0.2em;text-transform:uppercase;margin-bottom:8px;">
          Available Times — {selectedDateLabel}
        </div>
        <div style="display:flex;flex-wrap:wrap;gap:4px;">
          {#each timeSlots as t}
            <button
              onclick={() => selectTime(t)}
              style="padding:6px 12px;font-size:9px;border:none;cursor:pointer;
                {selectedTime === t
                  ? 'background:var(--color-gold);color:#000;font-weight:600;'
                  : 'background:var(--color-surface);border:1px solid var(--color-border);color:rgba(255,255,255,0.5);'}"
            >{t}</button>
          {/each}
        </div>
      {/if}
    </section>
  {/if}

  <!-- Step 3: Choose a Stylist -->
  {#if step >= 3 && selectedTime}
    <section style="margin-bottom:20px;">
      <div style="color:rgba(255,255,255,0.35);font-size:8px;letter-spacing:0.2em;text-transform:uppercase;margin-bottom:10px;">Choose a Stylist</div>
      {#if loadingEmployees}
        <div style="color:rgba(255,255,255,0.3);font-size:10px;">Checking availability…</div>
      {:else}
        {#each availableEmployees as emp}
          <button
            onclick={() => selectEmployee(emp)}
            style="width:100%;display:flex;align-items:center;gap:12px;padding:12px;margin-bottom:4px;border:none;cursor:pointer;text-align:left;
              {selectedEmployee?.id === emp.id
                ? 'background:rgba(201,168,76,0.08);border:1px solid var(--color-gold);'
                : 'background:var(--color-surface);border:1px solid var(--color-border);'}"
          >
            <div style="width:32px;height:32px;flex-shrink:0;display:flex;align-items:center;justify-content:center;font-size:13px;font-weight:600;font-family:serif;
              {selectedEmployee?.id === emp.id
                ? 'background:rgba(201,168,76,0.2);color:var(--color-gold);'
                : 'background:rgba(255,255,255,0.06);color:rgba(255,255,255,0.4);'}">
              {emp.name.charAt(0).toUpperCase()}
            </div>
            <span style="color:{selectedEmployee?.id === emp.id ? 'white' : 'rgba(255,255,255,0.6)'};font-size:11px;">{emp.name}</span>
          </button>
        {/each}
      {/if}
    </section>
  {/if}

  <!-- Step 4: Confirm -->
  {#if step >= 4 && selectedEmployee}
    <section>
      <div style="color:rgba(255,255,255,0.35);font-size:8px;letter-spacing:0.2em;text-transform:uppercase;margin-bottom:10px;">Confirm Booking</div>
      <div style="background:var(--color-surface);border:1px solid var(--color-border);border-top:2px solid var(--color-gold);padding:14px;margin-bottom:12px;">
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:10px;">
          <div>
            <div style="color:rgba(255,255,255,0.35);font-size:8px;letter-spacing:0.15em;text-transform:uppercase;margin-bottom:2px;">Service</div>
            <div style="color:white;font-size:10px;">{selectedService?.name}</div>
          </div>
          <div>
            <div style="color:rgba(255,255,255,0.35);font-size:8px;letter-spacing:0.15em;text-transform:uppercase;margin-bottom:2px;">Stylist</div>
            <div style="color:white;font-size:10px;">{selectedEmployee?.name}</div>
          </div>
          <div>
            <div style="color:rgba(255,255,255,0.35);font-size:8px;letter-spacing:0.15em;text-transform:uppercase;margin-bottom:2px;">Date</div>
            <div style="color:white;font-size:10px;">{selectedDateLabel}</div>
          </div>
          <div>
            <div style="color:rgba(255,255,255,0.35);font-size:8px;letter-spacing:0.15em;text-transform:uppercase;margin-bottom:2px;">Time</div>
            <div style="color:white;font-size:10px;">{selectedTime}</div>
          </div>
        </div>
        <div style="border-top:1px solid var(--color-border);padding-top:10px;display:flex;justify-content:space-between;align-items:center;">
          <div style="color:rgba(255,255,255,0.35);font-size:8px;letter-spacing:0.15em;text-transform:uppercase;">Total</div>
          <div style="color:var(--color-gold);font-size:14px;font-weight:600;">${selectedService?.price}</div>
        </div>
      </div>
      <button
        onclick={submit}
        disabled={submitting}
        style="width:100%;background:var(--color-gold);border:none;color:#000;padding:12px;font-size:9px;letter-spacing:0.25em;text-transform:uppercase;font-weight:600;cursor:pointer;"
      >
        {submitting ? 'Booking…' : 'Confirm Booking'}
      </button>
    </section>
  {/if}
</div>
