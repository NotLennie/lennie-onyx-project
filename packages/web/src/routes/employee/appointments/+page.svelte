<script lang="ts">
  import type { PageData } from './$types';
  import { api } from '$lib/api';
  import { invalidateAll } from '$app/navigation';

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
</script>

<div>
  <div style="color:rgba(255,255,255,0.4);font-size:8px;letter-spacing:0.25em;text-transform:uppercase;margin-bottom:4px;">Employee Portal</div>
  <div style="color:white;font-size:20px;font-family:Georgia,serif;font-weight:300;letter-spacing:0.05em;margin-bottom:20px;">APPOINTMENTS</div>

  {#if error}
    <div style="margin-bottom:12px;padding:10px 14px;font-size:10px;color:#f87171;border:1px solid rgba(239,68,68,0.3);background:rgba(239,68,68,0.08);">{error}</div>
  {/if}

  {#if sorted.length === 0}
    <div style="background:#242424;border:1px solid #333;padding:32px;text-align:center;color:rgba(255,255,255,0.3);font-size:10px;">No appointments found.</div>
  {:else}
    <div style="display:grid;grid-template-columns:1fr 1fr 1fr 1fr 1fr;padding:8px 14px;border-bottom:1px solid #333;">
      <div style="color:rgba(255,255,255,0.3);font-size:8px;letter-spacing:0.15em;text-transform:uppercase;">Date & Time</div>
      <div style="color:rgba(255,255,255,0.3);font-size:8px;letter-spacing:0.15em;text-transform:uppercase;">Client</div>
      <div style="color:rgba(255,255,255,0.3);font-size:8px;letter-spacing:0.15em;text-transform:uppercase;">Service</div>
      <div style="color:rgba(255,255,255,0.3);font-size:8px;letter-spacing:0.15em;text-transform:uppercase;">Price</div>
      <div style="color:rgba(255,255,255,0.3);font-size:8px;letter-spacing:0.15em;text-transform:uppercase;">Status</div>
    </div>

    {#each sorted as appt}
      {@const isPast = appt.date < today}
      <div style="display:grid;grid-template-columns:1fr 1fr 1fr 1fr 1fr;padding:10px 14px;border-bottom:1px solid #2a2a2a;border-left:2px solid #C9A84C;align-items:center;">
        <div>
          <div style="color:white;font-size:10px;font-weight:500;">{formatDate(appt.date)}</div>
          <div style="color:rgba(255,255,255,0.35);font-size:9px;">{appt.startTime}–{appt.endTime}</div>
        </div>
        <div style="color:white;font-size:10px;">{appt.clientName}</div>
        <div style="color:white;font-size:10px;">{appt.serviceName}</div>
        <div style="color:rgba(255,255,255,0.5);font-size:10px;">${appt.price}</div>
        <div>
          {#if isPast}
            <span style="font-size:8px;letter-spacing:0.1em;text-transform:uppercase;padding:2px 6px;color:{statusColor(appt.status)};background:{statusColor(appt.status)}15;">{appt.status}</span>
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
        </div>
      </div>
    {/each}
  {/if}
</div>
