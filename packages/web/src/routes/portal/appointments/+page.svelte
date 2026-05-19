<script lang="ts">
  import type { PageData } from './$types';
  import { api } from '$lib/api';
  import { invalidateAll } from '$app/navigation';

  let { data } = $props<{ data: PageData }>();

  let cancelling = $state<string | null>(null);
  let error = $state('');

  const today = new Date().toISOString().slice(0, 10);

  const upcoming = $derived.by(() =>
    data.appointments.filter((a) => a.status === 'confirmed' && a.date >= today)
  );
  const past = $derived.by(() =>
    data.appointments.filter((a) => a.status !== 'confirmed' || a.date < today)
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

  function formatDate(date: string) {
    return new Date(date + 'T00:00:00').toLocaleDateString('en-US', {
      weekday: 'long', month: 'long', day: 'numeric', year: 'numeric',
    });
  }

  function statusStyle(status: string) {
    if (status === 'confirmed') return 'background-color: rgba(201,168,76,0.15); color: var(--color-gold)';
    if (status === 'completed') return 'background-color: rgba(34,197,94,0.15); color: #22c55e';
    return 'background-color: rgba(239,68,68,0.15); color: #ef4444';
  }
</script>

<div class="max-w-3xl">
  <div class="flex items-center justify-between mb-8">
    <h1 class="text-3xl font-bold text-white">My Appointments</h1>
    <a
      href="/portal/book"
      class="px-5 py-2.5 rounded-lg font-medium text-sm"
      style="background-color: var(--color-gold); color: #1a1a1a"
    >
      Book New
    </a>
  </div>

  {#if error}
    <div class="mb-4 p-3 rounded-lg text-sm" style="background-color: rgba(239,68,68,0.1); color: #ef4444; border: 1px solid rgba(239,68,68,0.3)">
      {error}
    </div>
  {/if}

  {#if upcoming.length > 0}
    <section class="mb-8">
      <h2 class="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Upcoming</h2>
      <div class="space-y-3">
        {#each upcoming as appt}
          <div class="rounded-xl p-5" style="background-color: var(--color-surface); border: 1px solid var(--color-border)">
            <div class="flex items-start justify-between gap-4">
              <div class="flex-1">
                <div class="flex items-center gap-3 mb-3">
                  <span class="font-semibold text-white">{formatDate(appt.date)}</span>
                  <span class="text-xs px-2 py-1 rounded-full font-medium" style={statusStyle(appt.status)}>
                    {appt.status}
                  </span>
                </div>
                {#each appt.services as svc}
                  <div class="text-sm text-gray-300 flex flex-wrap items-center gap-2 mb-1">
                    <span class="font-medium text-white">{svc.serviceName}</span>
                    <span class="text-gray-500">·</span>
                    <span>{svc.startTime}–{svc.endTime}</span>
                    <span class="text-gray-500">·</span>
                    <span>{svc.employeeName}</span>
                    <span class="text-gray-500">·</span>
                    <span style="color: var(--color-gold)">${svc.price}</span>
                  </div>
                {/each}
              </div>
              <button
                onclick={() => cancel(appt.id)}
                disabled={cancelling === appt.id}
                class="text-sm px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
                style="color: #ef4444; border: 1px solid rgba(239,68,68,0.3)"
              >
                {cancelling === appt.id ? 'Cancelling…' : 'Cancel'}
              </button>
            </div>
          </div>
        {/each}
      </div>
    </section>
  {/if}

  {#if past.length > 0}
    <section>
      <h2 class="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">Past</h2>
      <div class="space-y-3">
        {#each past as appt}
          <div class="rounded-xl p-5 opacity-75" style="background-color: var(--color-surface); border: 1px solid var(--color-border)">
            <div class="flex items-center gap-3 mb-3">
              <span class="font-semibold text-white">{formatDate(appt.date)}</span>
              <span class="text-xs px-2 py-1 rounded-full font-medium" style={statusStyle(appt.status)}>
                {appt.status}
              </span>
            </div>
            {#each appt.services as svc}
              <div class="text-sm text-gray-400 flex flex-wrap items-center gap-2 mb-1">
                <span>{svc.serviceName}</span>
                <span class="text-gray-600">·</span>
                <span>{svc.startTime}–{svc.endTime}</span>
                <span class="text-gray-600">·</span>
                <span>{svc.employeeName}</span>
              </div>
            {/each}
          </div>
        {/each}
      </div>
    </section>
  {/if}

  {#if data.appointments.length === 0}
    <div class="rounded-xl p-12 text-center" style="background-color: var(--color-surface); border: 1px solid var(--color-border)">
      <p class="text-gray-400 mb-4">No appointments yet.</p>
      <a href="/portal/book" class="text-sm font-medium" style="color: var(--color-gold)">Book your first →</a>
    </div>
  {/if}
</div>
