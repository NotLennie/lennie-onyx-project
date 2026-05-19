<script lang="ts">
  import type { PageData } from './$types';
  import { api } from '$lib/api';
  import { invalidateAll } from '$app/navigation';

  type Appointment = {
    id: string;
    date: string;
    status: 'confirmed' | 'cancelled' | 'completed';
    createdAt: string;
    services: { id: string; serviceName: string; startTime: string; endTime: string; employeeName: string; price: string }[];
  };

  let { data } = $props<{ data: PageData }>();
  const appointments = $derived(data.appointments as Appointment[]);

  let cancelling = $state<string | null>(null);
  let error = $state('');
  let activeTab = $state<'upcoming' | 'completed' | 'cancelled' | 'all'>('upcoming');

  // View All filter state (only applied on Apply click)
  let filterFrom = $state('');
  let filterTo = $state('');
  let filterStatus = $state<'all' | 'confirmed' | 'completed' | 'cancelled'>('all');
  let appliedFrom = $state('');
  let appliedTo = $state('');
  let appliedStatus = $state<'all' | 'confirmed' | 'completed' | 'cancelled'>('all');

  const today = new Date().toISOString().slice(0, 10);

  const upcoming = $derived(
    appointments
      .filter((a) => a.status === 'confirmed' && a.date >= today)
      .sort((a, b) => a.date.localeCompare(b.date))
  );

  const completed = $derived(
    appointments
      .filter((a) => a.status === 'completed')
      .sort((a, b) => b.date.localeCompare(a.date))
  );

  const cancelled = $derived(
    appointments
      .filter((a) => a.status === 'cancelled')
      .sort((a, b) => b.date.localeCompare(a.date))
  );

  const allFiltered = $derived(
    appointments
      .filter((a) => {
        if (appliedStatus !== 'all' && a.status !== appliedStatus) return false;
        if (appliedFrom && a.date < appliedFrom) return false;
        if (appliedTo && a.date > appliedTo) return false;
        return true;
      })
      .sort((a, b) => b.date.localeCompare(a.date))
  );

  async function cancel(id: string) {
    cancelling = id;
    error = '';
    try {
      await api.client.appointments.cancel(id);
      await invalidateAll();
    } catch (e) {
      error = e instanceof Error ? e.message : 'Failed to cancel';
    } finally {
      cancelling = null;
    }
  }

  function applyFilters() {
    appliedFrom = filterFrom;
    appliedTo = filterTo;
    appliedStatus = filterStatus;
  }

  function formatDate(date: string) {
    return new Date(date + 'T00:00:00').toLocaleDateString('en-US', {
      weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
    });
  }

  const tabs = [
    { id: 'upcoming', label: 'Upcoming' },
    { id: 'completed', label: 'Completed' },
    { id: 'cancelled', label: 'Cancelled' },
    { id: 'all', label: 'View All' },
  ] as const;
</script>


<div style="max-width:640px;">
  <!-- Header -->
  <div style="color:rgba(255,255,255,0.4);font-size:8px;letter-spacing:0.25em;text-transform:uppercase;margin-bottom:4px;">Client Portal</div>
  <div style="color:white;font-size:20px;font-family:serif;font-weight:300;letter-spacing:0.05em;margin-bottom:16px;">MY APPOINTMENTS</div>

  {#if error}
    <div role="alert" style="margin-bottom:12px;padding:10px 14px;font-size:10px;color:#f87171;border:1px solid rgba(239,68,68,0.3);background:rgba(239,68,68,0.08);">
      {error}
    </div>
  {/if}

  <!-- Tab bar -->
  <div style="display:flex;border-bottom:1px solid var(--color-border);margin-bottom:16px;">
    {#each tabs as tab}
      <button
        onclick={() => activeTab = tab.id}
        style="padding:7px 14px;font-size:9px;letter-spacing:0.15em;text-transform:uppercase;background:none;border:none;cursor:pointer;margin-bottom:-1px;
          {activeTab === tab.id
            ? 'color:var(--color-gold);border-bottom:2px solid var(--color-gold);'
            : 'color:rgba(255,255,255,0.3);border-bottom:2px solid transparent;'}"
      >
        {tab.label}
      </button>
    {/each}
  </div>

  <!-- Upcoming tab -->
  {#if activeTab === 'upcoming'}
    {#if upcoming.length === 0}
      <div style="color:rgba(255,255,255,0.25);font-size:10px;">No upcoming appointments. <a href="/portal/book" style="color:var(--color-gold);">Book one →</a></div>
    {:else}
      {#each upcoming as appt}
        <div style="background:var(--color-surface);border:1px solid var(--color-border);border-top:2px solid var(--color-gold);padding:14px;margin-bottom:8px;">
          <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:6px;">
            <div style="color:white;font-size:11px;font-weight:500;">{formatDate(appt.date)}</div>
            <div style="background:rgba(201,168,76,0.12);color:var(--color-gold);font-size:8px;letter-spacing:0.15em;text-transform:uppercase;padding:3px 8px;">Confirmed</div>
          </div>
          {#each appt.services as svc}
            <div style="color:rgba(255,255,255,0.45);font-size:10px;margin-bottom:10px;">{svc.serviceName} · {svc.startTime}–{svc.endTime} · {svc.employeeName} · ${svc.price}</div>
          {/each}
          <button
            onclick={() => cancel(appt.id)}
            disabled={cancelling === appt.id}
            style="background:transparent;border:1px solid #3a3a3a;color:rgba(255,255,255,0.35);font-size:8px;letter-spacing:0.15em;text-transform:uppercase;padding:5px 10px;cursor:pointer;"
          >
            {cancelling === appt.id ? 'Cancelling…' : 'Cancel Appointment'}
          </button>
        </div>
      {/each}
    {/if}
  {/if}

  <!-- Completed tab -->
  {#if activeTab === 'completed'}
    {#if completed.length === 0}
      <div style="color:rgba(255,255,255,0.25);font-size:10px;">No completed appointments yet.</div>
    {:else}
      {#each completed as appt}
        <div style="background:var(--color-surface);border:1px solid var(--color-border);border-top:2px solid var(--color-gold);padding:14px;margin-bottom:8px;">
          <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:6px;">
            <div style="color:white;font-size:11px;font-weight:500;">{formatDate(appt.date)}</div>
            <div style="background:rgba(255,255,255,0.06);color:rgba(255,255,255,0.35);font-size:8px;letter-spacing:0.15em;text-transform:uppercase;padding:3px 8px;">Completed</div>
          </div>
          {#each appt.services as svc}
            <div style="color:rgba(255,255,255,0.45);font-size:10px;">{svc.serviceName} · {svc.startTime}–{svc.endTime} · {svc.employeeName} · ${svc.price}</div>
          {/each}
        </div>
      {/each}
    {/if}
  {/if}

  <!-- Cancelled tab -->
  {#if activeTab === 'cancelled'}
    {#if cancelled.length === 0}
      <div style="color:rgba(255,255,255,0.25);font-size:10px;">No cancelled appointments.</div>
    {:else}
      {#each cancelled as appt}
        <div style="background:var(--color-surface);border:1px solid var(--color-border);border-top:2px solid var(--color-gold);padding:14px;margin-bottom:8px;opacity:0.55;">
          <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:6px;">
            <div style="color:white;font-size:11px;font-weight:500;">{formatDate(appt.date)}</div>
            <div style="background:rgba(255,255,255,0.06);color:rgba(255,255,255,0.35);font-size:8px;letter-spacing:0.15em;text-transform:uppercase;padding:3px 8px;">Cancelled</div>
          </div>
          {#each appt.services as svc}
            <div style="color:rgba(255,255,255,0.45);font-size:10px;">{svc.serviceName} · {svc.startTime}–{svc.endTime} · {svc.employeeName} · ${svc.price}</div>
          {/each}
        </div>
      {/each}
    {/if}
  {/if}

  <!-- View All tab -->
  {#if activeTab === 'all'}
    <!-- Filter row -->
    <div style="display:flex;gap:8px;margin-bottom:16px;align-items:center;flex-wrap:wrap;">
      <div style="color:rgba(255,255,255,0.35);font-size:9px;letter-spacing:0.1em;text-transform:uppercase;flex-shrink:0;">Filter:</div>
      <input
        type="date"
        bind:value={filterFrom}
        style="background:var(--color-surface);border:1px solid var(--color-border);color:rgba(255,255,255,0.5);font-size:9px;padding:5px 8px;flex:1;min-width:100px;"
        placeholder="From"
      />
      <input
        type="date"
        bind:value={filterTo}
        style="background:var(--color-surface);border:1px solid var(--color-border);color:rgba(255,255,255,0.5);font-size:9px;padding:5px 8px;flex:1;min-width:100px;"
        placeholder="To"
      />
      <select
        bind:value={filterStatus}
        style="background:var(--color-surface);border:1px solid var(--color-border);color:rgba(255,255,255,0.5);font-size:9px;padding:5px 8px;flex:1;min-width:80px;"
      >
        <option value="all">All</option>
        <option value="confirmed">Confirmed</option>
        <option value="completed">Completed</option>
        <option value="cancelled">Cancelled</option>
      </select>
      <button
        onclick={applyFilters}
        style="background:var(--color-gold);border:none;color:#000;font-size:8px;letter-spacing:0.15em;text-transform:uppercase;font-weight:600;padding:5px 12px;cursor:pointer;flex-shrink:0;"
      >
        Apply
      </button>
    </div>

    {#if allFiltered.length === 0}
      <div style="color:rgba(255,255,255,0.25);font-size:10px;">No appointments match the current filter.</div>
    {:else}
      {#each allFiltered as appt}
        {@const isConfirmed = appt.status === 'confirmed'}
        {@const isCancelled = appt.status === 'cancelled'}
        <div style="background:var(--color-surface);border:1px solid var(--color-border);border-top:2px solid var(--color-gold);padding:12px;margin-bottom:6px;display:flex;justify-content:space-between;align-items:center;{isCancelled ? 'opacity:0.55;' : ''}">
          <div>
            {#each appt.services as svc}
              <div style="color:white;font-size:10px;font-weight:500;margin-bottom:3px;">{formatDate(appt.date)} · {svc.serviceName} · {svc.employeeName}</div>
              <div style="color:rgba(255,255,255,0.35);font-size:9px;">{svc.startTime}–{svc.endTime} · ${svc.price}</div>
            {/each}
          </div>
          <div style="font-size:8px;letter-spacing:0.1em;text-transform:uppercase;padding:3px 8px;flex-shrink:0;margin-left:12px;
            {isConfirmed ? 'background:rgba(201,168,76,0.12);color:var(--color-gold);' : 'background:rgba(255,255,255,0.06);color:rgba(255,255,255,0.35);'}">
            {appt.status}
          </div>
        </div>
      {/each}
    {/if}
  {/if}
</div>
