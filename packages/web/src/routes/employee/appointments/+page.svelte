<script lang="ts">
  import type { PageData } from './$types';
  import { api } from '$lib/api';
  import { invalidateAll } from '$app/navigation';
  import PageShell from '$lib/components/portal/PageShell.svelte';
  import PageHeader from '$lib/components/portal/PageHeader.svelte';
  import DataTable from '$lib/components/portal/DataTable.svelte';

  let { data } = $props<{ data: PageData }>();

  const today = new Date().toISOString().slice(0, 10);
  const statuses = ['new', 'confirmed', 'cancelled', 'completed'] as const;

  let updating = $state<string | null>(null);
  let error = $state('');

  const sorted = $derived(
    [...data.appointments].sort((a, b) => b.date.localeCompare(a.date) || a.startTime.localeCompare(b.startTime))
  );

  async function changeStatus(appointmentId: string, status: 'new' | 'confirmed' | 'cancelled' | 'completed') {
    updating = appointmentId;
    error = '';
    try {
      await api.employee.appointments.updateStatus(appointmentId, status);
      await invalidateAll();
    } catch (e) {
      error = e instanceof Error ? e.message : 'Failed to update';
    } finally {
      updating = null;
    }
  }

  function statusColor(status: string) {
    if (status === 'completed') return '#22c55e';
    if (status === 'cancelled') return '#ef4444';
    return '#C9A84C';
  }

  function formatDate(d: string) {
    return new Date(d + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
  }

  const columns = [
    { key: 'date', label: 'Date & Time', width: '1.4fr' },
    { key: 'client', label: 'Client', width: '1.1fr' },
    { key: 'service', label: 'Service', width: '1.2fr' },
    { key: 'price', label: 'Price', width: '0.8fr' },
    { key: 'status', label: 'Status', width: '1.1fr' },
  ];
</script>

<PageShell bgImage="/images/portal_background.png">
  <PageHeader eyebrow="Staff Portal" title="APPOINTMENTS" user={data.user} />

  {#if error}
    <div style="padding:10px 14px;font-size:10px;color:#f87171;border:1px solid rgba(239,68,68,0.3);background:rgba(239,68,68,0.08);">{error}</div>
  {/if}

  <DataTable columns={columns} rows={sorted}>
    {#snippet row(appt)}
      <div>
        <div style="color:white;font-size:11px;font-weight:500;">{formatDate(appt.date)}</div>
        <div style="color:rgba(255,255,255,0.35);font-size:9px;">{appt.startTime}–{appt.endTime}</div>
      </div>
      <span>{appt.clientName}</span>
      <span>{appt.serviceName}</span>
      <span style="color:rgba(255,255,255,0.5);">${appt.price}</span>
      <span>
        {#if appt.date < today}
          <span style="font-size:9px;letter-spacing:0.15em;text-transform:uppercase;color:{statusColor(appt.status)};">{appt.status}</span>
        {:else}
          <select
            value={appt.status}
            onchange={(e) => changeStatus(appt.appointmentId, (e.target as HTMLSelectElement).value as any)}
            disabled={updating === appt.appointmentId}
            style="background:#242424;border:1px solid #333;color:{statusColor(appt.status)};font-size:9px;padding:3px 6px;cursor:pointer;"
          >
            {#each statuses as s}
              <option value={s} style="color:{statusColor(s)}">{s.charAt(0).toUpperCase() + s.slice(1)}</option>
            {/each}
          </select>
        {/if}
      </span>
    {/snippet}
    {#snippet empty()}<span>No appointments to show.</span>{/snippet}
  </DataTable>
</PageShell>
