<script lang="ts">
  import type { PageData } from './$types';

  let { data } = $props<{ data: PageData }>();
</script>

<div class="max-w-3xl">
  <h1 class="text-3xl font-bold text-white mb-2">Welcome back, {data.user.name}</h1>
  <p class="text-gray-400 mb-8">Here's a look at your upcoming appointments.</p>

  <div class="flex gap-3 mb-8">
    <a
      href="/portal/book"
      class="px-5 py-2.5 rounded-lg font-medium text-sm transition-opacity hover:opacity-90"
      style="background-color: var(--color-gold); color: #1a1a1a"
    >
      Book Appointment
    </a>
    <a
      href="/portal/appointments"
      class="px-5 py-2.5 rounded-lg font-medium text-sm transition-colors"
      style="background-color: var(--color-surface); color: white; border: 1px solid var(--color-border)"
    >
      View All
    </a>
  </div>

  {#if data.appointments.length === 0}
    <div class="rounded-xl p-8 text-center" style="background-color: var(--color-surface); border: 1px solid var(--color-border)">
      <p class="text-gray-400 mb-4">No upcoming appointments.</p>
      <a href="/portal/book" class="text-sm font-medium" style="color: var(--color-gold)">Book your first appointment →</a>
    </div>
  {:else}
    <div class="space-y-3">
      <h2 class="text-sm font-semibold text-gray-400 uppercase tracking-wider">Upcoming</h2>
      {#each data.appointments as appt}
        <div class="rounded-xl p-5" style="background-color: var(--color-surface); border: 1px solid var(--color-border)">
          <div class="flex items-center justify-between mb-3">
            <span class="font-semibold text-white">
              {new Date(appt.date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </span>
            <span class="text-xs px-2 py-1 rounded-full font-medium" style="background-color: rgba(201,168,76,0.15); color: var(--color-gold)">
              {appt.status}
            </span>
          </div>
          {#each appt.services as svc}
            <div class="text-sm text-gray-300 flex items-center gap-2">
              <span>{svc.serviceName}</span>
              <span class="text-gray-500">·</span>
              <span>{svc.startTime}–{svc.endTime}</span>
              <span class="text-gray-500">·</span>
              <span>{svc.employeeName}</span>
            </div>
          {/each}
        </div>
      {/each}
    </div>
  {/if}
</div>
