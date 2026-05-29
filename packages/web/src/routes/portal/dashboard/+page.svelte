<script lang="ts">
  import type { PageData } from './$types';
  import PageHeader from '$lib/components/portal/PageHeader.svelte';
  import HeroCard from '$lib/components/portal/HeroCard.svelte';
  import Card from '$lib/components/portal/Card.svelte';
  import DataTable from '$lib/components/portal/DataTable.svelte';

  type AppointmentRow = {
    id: string;
    date: string;
    status: 'new' | 'confirmed' | 'cancelled' | 'completed';
    createdAt: string;
    services: { serviceName: string; startTime: string; endTime: string; employeeName: string }[];
  };

  let { data } = $props<{ data: PageData }>();

  function formatDate(date: string) {
    return new Date(date + 'T00:00:00').toLocaleDateString('en-US', {
      weekday: 'long', month: 'long', day: 'numeric',
    });
  }
  function formatDateShort(date: string) {
    return new Date(date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
  }

  const next = $derived(data.upcoming[0]);
  const historyRows = $derived(data.recentActivity as AppointmentRow[]);
  const historyColumns = [
    { key: 'date', label: 'Date', width: '1.1fr' },
    { key: 'service', label: 'Service', width: '1.4fr' },
    { key: 'stylist', label: 'Stylist', width: '1.3fr' },
    { key: 'status', label: 'Status', width: '1fr' },
    { key: 'action', label: 'Action', width: '0.9fr' },
  ];
</script>

<div style="padding:32px;display:flex;flex-direction:column;gap:20px;">
  <PageHeader eyebrow="Welcome Back" title={data.user.name.toUpperCase()} user={data.user} />

  <div style="display:grid;grid-template-columns:1.5fr 1fr;gap:20px;">
    <HeroCard image="/images/portal_background.png" title="Ready for your next transformation?" cta={{ label: 'Book Appointment', href: '/portal/book' }} />
    <Card accent label="Next Appointment">
      {#if next}
        <div style="color:white;font-family:Georgia,serif;font-size:22px;font-weight:300;">{formatDate(next.date)}</div>
        {#each next.services as svc}
          <div style="color:var(--color-gold);font-size:14px;margin-top:4px;">{svc.startTime}</div>
          <div style="color:rgba(255,255,255,0.5);font-size:12px;margin-top:2px;">{svc.serviceName} · {svc.employeeName}</div>
        {/each}
        <a href="/portal/appointments" style="color:rgba(255,255,255,0.5);font-size:11px;letter-spacing:0.15em;text-transform:uppercase;margin-top:14px;display:inline-block;text-decoration:none;">View Details →</a>
      {:else}
        <div style="color:rgba(255,255,255,0.3);font-size:13px;">No upcoming appointments.</div>
        <a href="/portal/book" style="color:var(--color-gold);font-size:12px;margin-top:10px;display:inline-block;">Book one →</a>
      {/if}
    </Card>
  </div>

  <DataTable
    title="Appointment History"
    viewAllHref="/portal/appointments"
    columns={historyColumns}
    rows={historyRows}
  >
    {#snippet row(appt)}
      <span>{formatDateShort(appt.date)}</span>
      <span>{appt.services[0]?.serviceName ?? '—'}</span>
      <span>{appt.services[0]?.employeeName ?? '—'}</span>
      <span style="color:{appt.status === 'cancelled' ? '#f87171' : '#5db974'};font-size:10px;letter-spacing:0.15em;text-transform:uppercase;">
        {appt.status === 'cancelled' ? '✕ Cancelled' : '✓ Completed'}
      </span>
      <a href="/portal/appointments" style="color:var(--color-gold);font-size:11px;text-decoration:none;">View Details</a>
    {/snippet}
    {#snippet empty()}
      <span>No appointment history yet.</span>
    {/snippet}
  </DataTable>
</div>
