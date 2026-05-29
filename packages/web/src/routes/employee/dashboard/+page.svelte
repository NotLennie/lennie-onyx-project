<script lang="ts">
  import type { PageData } from './$types';
  import PageHeader from '$lib/components/portal/PageHeader.svelte';
  import HeroCard from '$lib/components/portal/HeroCard.svelte';
  import Card from '$lib/components/portal/Card.svelte';
  import DataTable from '$lib/components/portal/DataTable.svelte';

  type FlatAppt = {
    appointmentId: string;
    date: string;
    status: string;
    clientName: string;
    serviceName: string;
    price: string;
    startTime: string;
    endTime: string;
  };

  let { data } = $props<{ data: PageData }>();

  const today = data.today;

  function formatDate(date: string) {
    return new Date(date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
  }
  function formatDateShort(date: string) {
    return new Date(date + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
  }

  // Derive upcoming (future confirmed/new appointments, sorted by date asc)
  const upcoming = $derived(
    [...(data.allAppointments as FlatAppt[])]
      .filter((a) => (a.status === 'new' || a.status === 'confirmed') && a.date >= today)
      .sort((a, b) => a.date.localeCompare(b.date) || a.startTime.localeCompare(b.startTime))
  );

  // Derive recent (all appointments sorted by date desc, limited to 8)
  const recentAppointments = $derived(
    [...(data.allAppointments as FlatAppt[])]
      .sort((a, b) => b.date.localeCompare(a.date) || a.startTime.localeCompare(b.startTime))
      .slice(0, 8)
  );

  const next = $derived(upcoming[0]);

  const columns = [
    { key: 'date', label: 'Date', width: '1.1fr' },
    { key: 'client', label: 'Client', width: '1.3fr' },
    { key: 'service', label: 'Service', width: '1.4fr' },
    { key: 'time', label: 'Time', width: '0.9fr' },
    { key: 'status', label: 'Status', width: '0.9fr' },
  ];
</script>

<div style="padding:32px;display:flex;flex-direction:column;gap:20px;">
  <PageHeader eyebrow="Welcome Back" title={data.user.name.toUpperCase()} user={data.user} />

  <div style="display:grid;grid-template-columns:1.5fr 1fr;gap:20px;">
    <HeroCard image="/images/portal_background.png" title="Ready for today?" cta={{ label: 'View Schedule', href: '/employee/appointments' }} />
    <Card accent label="Next Appointment">
      {#if next}
        <div style="color:white;font-family:Georgia,serif;font-size:22px;font-weight:300;">{formatDate(next.date)}</div>
        <div style="color:var(--color-gold);font-size:14px;margin-top:4px;">{next.startTime} — {next.clientName}</div>
        <div style="color:rgba(255,255,255,0.5);font-size:12px;margin-top:2px;">{next.serviceName}{next.endTime ? ` · until ${next.endTime}` : ''}</div>
        <a href="/employee/appointments" style="color:rgba(255,255,255,0.5);font-size:11px;letter-spacing:0.15em;text-transform:uppercase;margin-top:14px;display:inline-block;text-decoration:none;">View Details →</a>
      {:else}
        <div style="color:rgba(255,255,255,0.3);font-size:13px;">No upcoming appointments today.</div>
      {/if}
    </Card>
  </div>

  <DataTable
    title="Recent Appointments"
    viewAllHref="/employee/appointments"
    columns={columns}
    rows={recentAppointments}
  >
    {#snippet row(appt)}
      <span>{formatDateShort(appt.date)}</span>
      <span>{appt.clientName ?? '—'}</span>
      <span>{appt.serviceName ?? '—'}</span>
      <span>{appt.startTime ?? '—'}</span>
      <span style="color:{appt.status === 'cancelled' ? '#f87171' : appt.status === 'completed' ? '#5db974' : 'var(--color-gold)'};font-size:10px;letter-spacing:0.15em;text-transform:uppercase;">
        {appt.status}
      </span>
    {/snippet}
    {#snippet empty()}
      <span>No recent appointments.</span>
    {/snippet}
  </DataTable>
</div>
