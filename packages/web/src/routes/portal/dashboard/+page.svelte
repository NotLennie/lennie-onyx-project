<script lang="ts">
  import type { PageData } from './$types';

  let { data } = $props<{ data: PageData }>();

  function formatDate(date: string) {
    return new Date(date + 'T00:00:00').toLocaleDateString('en-US', {
      weekday: 'long', month: 'long', day: 'numeric',
    });
  }
</script>

<div style="max-width:720px;">
  <div style="color:rgba(255,255,255,0.4);font-size:11px;letter-spacing:0.25em;text-transform:uppercase;margin-bottom:6px;">Welcome Back</div>
  <div style="color:white;font-size:28px;font-family:Georgia,serif;font-weight:300;letter-spacing:0.05em;margin-bottom:24px;">{data.user.name.toUpperCase()}</div>

  <div style="margin-bottom:28px;">
    <a
      href="/portal/book"
      style="display:inline-block;background:var(--color-gold);color:#000;padding:12px 28px;font-size:11px;letter-spacing:0.2em;text-transform:uppercase;font-weight:600;text-decoration:none;"
    >
      Book Appointment
    </a>
  </div>

  <div style="color:rgba(255,255,255,0.35);font-size:11px;letter-spacing:0.2em;text-transform:uppercase;margin-bottom:10px;">Upcoming</div>
  {#if data.upcoming.length === 0}
    <div style="color:rgba(255,255,255,0.3);font-size:14px;margin-bottom:24px;">No upcoming appointments. <a href="/portal/book" style="color:var(--color-gold);">Book one →</a></div>
  {:else}
    {#each data.upcoming as appt}
      <div style="background:var(--color-surface);border:1px solid var(--color-border);border-top:2px solid var(--color-gold);padding:18px;margin-bottom:24px;">
        <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:8px;">
          <div style="color:white;font-size:14px;font-weight:500;">{formatDate(appt.date)}</div>
          <div style="background:rgba(201,168,76,0.12);color:var(--color-gold);font-size:10px;letter-spacing:0.15em;text-transform:uppercase;padding:4px 10px;">Confirmed</div>
        </div>
        {#each appt.services as svc}
          <div style="color:rgba(255,255,255,0.5);font-size:13px;">{svc.serviceName} · {svc.startTime}–{svc.endTime} · {svc.employeeName}</div>
        {/each}
      </div>
    {/each}
  {/if}

  {#if data.recentActivity.length > 0}
    <div style="color:rgba(255,255,255,0.35);font-size:11px;letter-spacing:0.2em;text-transform:uppercase;margin-bottom:10px;">Recent Activity</div>
    <div style="border:1px solid #2a2a2a;">
      {#each data.recentActivity as appt, i}
        <div style="padding:14px 18px;display:flex;justify-content:space-between;align-items:center;{i < data.recentActivity.length - 1 ? 'border-bottom:1px solid #2a2a2a;' : ''}">
          <div>
            <div style="color:rgba(255,255,255,0.7);font-size:13px;margin-bottom:3px;">
              {appt.status === 'cancelled' ? 'Booking cancelled' : 'Appointment completed'} — {formatDate(appt.date)}
            </div>
            {#each appt.services as svc}
              <div style="color:rgba(255,255,255,0.35);font-size:12px;">{svc.serviceName} · {svc.employeeName}</div>
            {/each}
          </div>
          <div style="font-size:10px;letter-spacing:0.1em;text-transform:uppercase;flex-shrink:0;margin-left:16px;
            {appt.status === 'cancelled' ? 'color:rgba(239,68,68,0.7)' : 'color:rgba(255,255,255,0.3)'}">
            {appt.status === 'cancelled' ? 'Cancelled' : 'Completed'}
          </div>
        </div>
      {/each}
    </div>
  {/if}
</div>
