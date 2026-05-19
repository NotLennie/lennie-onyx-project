<script lang="ts">
  import type { PageData } from './$types';
  import { api } from '$lib/api';
  import { goto, invalidateAll } from '$app/navigation';

  let { data } = $props<{ data: PageData }>();

  let completing = $state<string | null>(null);
  let error = $state('');
  let selectedDate = $state(data.date);

  async function complete(appointmentId: string) {
    completing = appointmentId;
    error = '';
    try {
      await api.employee.appointments.complete(appointmentId);
      await invalidateAll();
    } catch (e) {
      error = e instanceof Error ? e.message : 'Failed to complete';
    } finally {
      completing = null;
    }
  }

  function changeDate() {
    goto(`/employee/appointments?date=${selectedDate}`, { invalidateAll: true });
  }

  function statusStyle(status: string) {
    if (status === 'confirmed') return 'background-color: rgba(201,168,76,0.15); color: var(--color-gold)';
    if (status === 'completed') return 'background-color: rgba(34,197,94,0.15); color: #22c55e';
    return 'background-color: rgba(239,68,68,0.15); color: #ef4444';
  }
</script>

<div class="max-w-3xl">
  <h1 class="text-3xl font-bold text-white mb-6">Appointments</h1>

  <div class="flex items-center gap-3 mb-6">
    <input
      type="date"
      bind:value={selectedDate}
      onchange={changeDate}
      class="px-3 py-2 rounded-lg text-white text-sm"
      style="background-color: var(--color-surface); border: 1px solid var(--color-border)"
    />
    <span class="text-gray-400 text-sm">
      {new Date(data.date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
    </span>
  </div>

  {#if error}
    <div class="mb-4 p-3 rounded-lg text-sm" style="background-color: rgba(239,68,68,0.1); color: #ef4444; border: 1px solid rgba(239,68,68,0.3)">
      {error}
    </div>
  {/if}

  {#if data.appointments.length === 0}
    <div class="rounded-xl p-12 text-center" style="background-color: var(--color-surface); border: 1px solid var(--color-border)">
      <p class="text-gray-400">No appointments on this date.</p>
    </div>
  {:else}
    <div class="space-y-3">
      {#each data.appointments as appt}
        <div class="rounded-xl p-5 flex items-center gap-4" style="background-color: var(--color-surface); border: 1px solid var(--color-border)">
          <div class="text-center w-16 flex-shrink-0">
            <div class="text-lg font-bold" style="color: var(--color-gold)">{appt.startTime}</div>
            <div class="text-xs text-gray-500">{appt.endTime}</div>
          </div>
          <div class="flex-1">
            <div class="flex items-center gap-2 mb-1">
              <span class="font-semibold text-white">{appt.clientName}</span>
              <span class="text-xs px-2 py-0.5 rounded-full" style={statusStyle(appt.status)}>{appt.status}</span>
            </div>
            <div class="text-sm text-gray-400">{appt.serviceName}</div>
          </div>
          {#if appt.status === 'confirmed'}
            <button
              onclick={() => complete(appt.appointmentId)}
              disabled={completing === appt.appointmentId}
              class="px-4 py-2 rounded-lg text-sm font-medium transition-opacity disabled:opacity-50 flex-shrink-0"
              style="background-color: rgba(34,197,94,0.15); color: #22c55e; border: 1px solid rgba(34,197,94,0.3)"
            >
              {completing === appt.appointmentId ? '…' : 'Complete'}
            </button>
          {/if}
        </div>
      {/each}
    </div>
  {/if}
</div>
