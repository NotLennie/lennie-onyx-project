<script lang="ts">
  import type { PageData } from './$types';
  import { api } from '$lib/api';
  import { invalidateAll } from '$app/navigation';
  import PageShell from '$lib/components/portal/PageShell.svelte';
  import PageHeader from '$lib/components/portal/PageHeader.svelte';
  import DataTable from '$lib/components/portal/DataTable.svelte';

  type Appointment = {
    id: string;
    date: string;
    status: 'new' | 'confirmed' | 'cancelled' | 'completed';
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
  let filterStatus = $state<'all' | 'new' | 'confirmed' | 'completed' | 'cancelled'>('all');
  let appliedFrom = $state('');
  let appliedTo = $state('');
  let appliedStatus = $state<'all' | 'new' | 'confirmed' | 'completed' | 'cancelled'>('all');

  const today = new Date().toISOString().slice(0, 10);

  const upcoming = $derived(
    appointments
      .filter((a) => (a.status === 'confirmed' || a.status === 'new') && a.date >= today)
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

  const apptColumns = [
    { key: 'date', label: 'Date', width: '1.2fr' },
    { key: 'service', label: 'Service', width: '1.3fr' },
    { key: 'stylist', label: 'Stylist', width: '1.2fr' },
    { key: 'time', label: 'Time', width: '0.9fr' },
    { key: 'status', label: 'Status', width: '0.9fr' },
    { key: 'action', label: 'Action', width: '0.9fr' },
  ];
  const currentRows = $derived(
    activeTab === 'upcoming' ? upcoming
    : activeTab === 'completed' ? completed
    : activeTab === 'cancelled' ? cancelled
    : allFiltered
  );
</script>

<PageShell bgImage="/images/portal_background.png">
  <PageHeader eyebrow="Client Portal" title="MY APPOINTMENTS" user={data.user} />

  {#if error}
    <div role="alert" style="padding:10px 14px;font-size:13px;color:#f87171;border:1px solid rgba(239,68,68,0.3);background:rgba(239,68,68,0.08);">{error}</div>
  {/if}

  <div style="display:flex;border-bottom:1px solid var(--color-border);">
    {#each tabs as tab}
      <button
        onclick={() => activeTab = tab.id}
        style="padding:9px 16px;font-size:11px;letter-spacing:0.18em;text-transform:uppercase;background:none;border:none;cursor:pointer;margin-bottom:-1px;
          {activeTab === tab.id
            ? 'color:var(--color-gold);border-bottom:2px solid var(--color-gold);'
            : 'color:rgba(255,255,255,0.3);border-bottom:2px solid transparent;'}"
      >{tab.label}</button>
    {/each}
  </div>

  {#if activeTab === 'all'}
    <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;">
      <div style="color:rgba(255,255,255,0.35);font-size:12px;letter-spacing:0.1em;text-transform:uppercase;">Filter:</div>
      <input type="date" bind:value={filterFrom} style="background:var(--color-surface);border:1px solid var(--color-border);color:rgba(255,255,255,0.5);font-size:12px;padding:5px 8px;flex:1;min-width:100px;" />
      <input type="date" bind:value={filterTo} style="background:var(--color-surface);border:1px solid var(--color-border);color:rgba(255,255,255,0.5);font-size:12px;padding:5px 8px;flex:1;min-width:100px;" />
      <select bind:value={filterStatus} style="background:var(--color-surface);border:1px solid var(--color-border);color:rgba(255,255,255,0.5);font-size:12px;padding:5px 8px;flex:1;min-width:80px;">
        <option value="all">All</option><option value="new">New</option><option value="confirmed">Confirmed</option><option value="completed">Completed</option><option value="cancelled">Cancelled</option>
      </select>
      <button onclick={applyFilters} style="background:var(--color-gold);border:none;color:#000;font-size:11px;letter-spacing:0.15em;text-transform:uppercase;font-weight:600;padding:8px 18px;cursor:pointer;">Apply</button>
    </div>
  {/if}

  <DataTable columns={apptColumns} rows={currentRows}>
    {#snippet row(appt)}
      <span>{formatDate(appt.date)}</span>
      <span>{appt.services[0]?.serviceName ?? '—'}</span>
      <span>{appt.services[0]?.employeeName ?? '—'}</span>
      <span>{appt.services[0]?.startTime ?? '—'}</span>
      <span style="font-size:9px;letter-spacing:0.15em;text-transform:uppercase;
        color:{appt.status === 'confirmed' ? 'var(--color-gold)' : appt.status === 'cancelled' ? '#f87171' : appt.status === 'completed' ? '#5db974' : '#93c5fd'};">
        {appt.status}
      </span>
      {#if appt.status === 'confirmed' || appt.status === 'new'}
        <button onclick={() => cancel(appt.id)} disabled={cancelling === appt.id} style="background:none;border:none;color:var(--color-gold);font-size:11px;cursor:pointer;text-align:left;padding:0;">
          {cancelling === appt.id ? 'Cancelling…' : 'Cancel'}
        </button>
      {:else}
        <span style="color:rgba(255,255,255,0.3);">—</span>
      {/if}
    {/snippet}
    {#snippet empty()}
      <span>
        {#if activeTab === 'upcoming'}No upcoming appointments. <a href="/portal/book" style="color:var(--color-gold);">Book one →</a>
        {:else if activeTab === 'completed'}No completed appointments yet.
        {:else if activeTab === 'cancelled'}No cancelled appointments.
        {:else}No appointments match the current filter.{/if}
      </span>
    {/snippet}
  </DataTable>
</PageShell>
