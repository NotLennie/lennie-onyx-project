<script lang="ts">
  import type { PageData } from './$types';

  let { data } = $props<{ data: PageData }>();

  const today = data.today;

  const todaySchedule = $derived(
    data.todayAppointments
      .filter((a) => a.status === 'new' || a.status === 'confirmed' || a.status === 'completed')
      .sort((a, b) => a.startTime.localeCompare(b.startTime))
  );

  const upcoming = $derived(
    data.allAppointments
      .filter((a) => (a.status === 'new' || a.status === 'confirmed') && a.date > today)
      .sort((a, b) => a.date.localeCompare(b.date) || a.startTime.localeCompare(b.startTime))
      .slice(0, 10)
  );

  function statusColor(status: string) {
    if (status === 'completed') return '#22c55e';
    if (status === 'cancelled') return '#ef4444';
    return '#C9A84C';
  }

  function formatDate(d: string) {
    return new Date(d + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  }
</script>

<div>
  <div style="color:rgba(255,255,255,0.4);font-size:8px;letter-spacing:0.25em;text-transform:uppercase;margin-bottom:4px;">Employee Portal</div>
  <div style="color:white;font-size:20px;font-family:Georgia,serif;font-weight:300;letter-spacing:0.05em;margin-bottom:20px;">DASHBOARD</div>

  <div style="display:grid;grid-template-columns:3fr 2fr;gap:20px;align-items:start;">
    <div>
      <div style="color:rgba(255,255,255,0.35);font-size:8px;letter-spacing:0.2em;text-transform:uppercase;margin-bottom:10px;">
        Today's Schedule — {new Date(today + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
      </div>
      {#if todaySchedule.length === 0}
        <div style="background:#242424;border:1px solid #333;padding:24px;color:rgba(255,255,255,0.3);font-size:10px;">No appointments today.</div>
      {:else}
        {#each todaySchedule as appt}
          <div style="background:#242424;border:1px solid #333;border-left:2px solid #C9A84C;padding:10px 14px;margin-bottom:4px;display:flex;align-items:center;justify-content:space-between;">
            <div style="display:flex;align-items:center;gap:12px;">
              <div style="color:#C9A84C;font-size:10px;font-weight:500;min-width:70px;">{appt.startTime}–{appt.endTime}</div>
              <div>
                <div style="color:white;font-size:10px;font-weight:500;">{appt.serviceName}</div>
                <div style="color:rgba(255,255,255,0.4);font-size:9px;">{appt.clientName}</div>
              </div>
            </div>
            <div style="font-size:8px;letter-spacing:0.1em;text-transform:uppercase;padding:2px 6px;color:{statusColor(appt.status)};background:{statusColor(appt.status)}15;">{appt.status}</div>
          </div>
        {/each}
      {/if}

      <div style="color:rgba(255,255,255,0.35);font-size:8px;letter-spacing:0.2em;text-transform:uppercase;margin-top:20px;margin-bottom:10px;">Upcoming Appointments</div>
      {#if upcoming.length === 0}
        <div style="background:#242424;border:1px solid #333;padding:24px;color:rgba(255,255,255,0.3);font-size:10px;">No upcoming appointments.</div>
      {:else}
        {#each upcoming as appt}
          <div style="background:#242424;border:1px solid #333;border-left:2px solid #C9A84C;padding:10px 14px;margin-bottom:4px;display:flex;align-items:center;justify-content:space-between;">
            <div style="display:flex;align-items:center;gap:12px;">
              <div style="color:#C9A84C;font-size:10px;font-weight:500;min-width:70px;">{formatDate(appt.date)}</div>
              <div>
                <div style="color:white;font-size:10px;font-weight:500;">{appt.serviceName}</div>
                <div style="color:rgba(255,255,255,0.4);font-size:9px;">{appt.clientName} · {appt.startTime}–{appt.endTime}</div>
              </div>
            </div>
            <div style="font-size:8px;letter-spacing:0.1em;text-transform:uppercase;padding:2px 6px;color:{statusColor(appt.status)};background:{statusColor(appt.status)}15;">{appt.status}</div>
          </div>
        {/each}
      {/if}
    </div>

    <div>
      <div style="color:rgba(255,255,255,0.35);font-size:8px;letter-spacing:0.2em;text-transform:uppercase;margin-bottom:10px;">Recent Activity</div>
      <div style="background:#242424;border:1px solid #333;padding:16px;">
        {#each data.allAppointments.slice(0, 8) as appt}
          <div style="display:flex;align-items:flex-start;gap:8px;padding:6px 0;border-bottom:1px solid #2a2a2a;">
            <div style="width:6px;height:6px;background:#C9A84C;margin-top:4px;flex-shrink:0;"></div>
            <div>
              <div style="color:rgba(255,255,255,0.6);font-size:9px;">{appt.serviceName} with {appt.clientName}</div>
              <div style="color:rgba(255,255,255,0.25);font-size:8px;margin-top:1px;">{formatDate(appt.date)} · {appt.startTime}</div>
            </div>
          </div>
        {/each}
        {#if data.allAppointments.length === 0}
          <div style="color:rgba(255,255,255,0.3);font-size:10px;">No recent activity.</div>
        {/if}
      </div>
    </div>
  </div>
</div>
