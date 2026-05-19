<script lang="ts">
  import type { PageData } from './$types';
  import type { PtoType } from '@project/shared';
  import { api } from '$lib/api';
  import { invalidateAll } from '$app/navigation';

  let { data } = $props<{ data: PageData }>();

  const ptoTypes: PtoType[] = ['personal', 'holiday', 'sick_leave', 'maternity', 'paternity', 'bereavement'];

  let newDate = $state('');
  let newType = $state<PtoType>('personal');
  let newNote = $state('');
  let submitting = $state(false);
  let submitError = $state('');
  let deleting = $state<string | null>(null);

  async function submit() {
    if (!newDate) { submitError = 'Date is required'; return; }
    submitting = true;
    submitError = '';
    try {
      await api.employee.pto.create({ date: newDate, type: newType, note: newNote || undefined });
      newDate = '';
      newNote = '';
      await invalidateAll();
    } catch (e) {
      submitError = e instanceof Error ? e.message : 'Failed to submit';
    } finally {
      submitting = false;
    }
  }

  async function deletePto(id: string) {
    deleting = id;
    try {
      await api.employee.pto.delete(id);
      await invalidateAll();
    } catch (e) {
      submitError = e instanceof Error ? e.message : 'Failed to delete';
    } finally {
      deleting = null;
    }
  }

  function statusStyle(status: string) {
    if (status === 'approved') return 'background-color: rgba(34,197,94,0.15); color: #22c55e';
    if (status === 'declined') return 'background-color: rgba(239,68,68,0.15); color: #ef4444';
    return 'background-color: rgba(201,168,76,0.15); color: var(--color-gold)';
  }

  function labelType(type: string) {
    return type.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
  }
</script>

<div class="max-w-2xl">
  <h1 class="text-3xl font-bold text-white mb-8">My PTO Requests</h1>

  <!-- Request form -->
  <div class="rounded-xl p-5 mb-8" style="background-color: var(--color-surface); border: 1px solid var(--color-border)">
    <h2 class="text-base font-semibold text-white mb-4">New Request</h2>

    {#if submitError}
      <div class="mb-3 p-3 rounded-lg text-sm" style="background-color: rgba(239,68,68,0.1); color: #ef4444; border: 1px solid rgba(239,68,68,0.3)">
        {submitError}
      </div>
    {/if}

    <div class="flex gap-3 flex-wrap">
      <input
        type="date"
        bind:value={newDate}
        class="px-3 py-2 rounded-lg text-white text-sm flex-1 min-w-32"
        style="background-color: var(--color-bg); border: 1px solid var(--color-border)"
      />
      <select
        bind:value={newType}
        class="px-3 py-2 rounded-lg text-white text-sm flex-1 min-w-40"
        style="background-color: var(--color-bg); border: 1px solid var(--color-border)"
      >
        {#each ptoTypes as t}
          <option value={t}>{labelType(t)}</option>
        {/each}
      </select>
      <input
        type="text"
        bind:value={newNote}
        placeholder="Note (optional)"
        class="px-3 py-2 rounded-lg text-white text-sm flex-1 min-w-48"
        style="background-color: var(--color-bg); border: 1px solid var(--color-border)"
      />
      <button
        onclick={submit}
        disabled={submitting}
        class="px-5 py-2 rounded-lg font-medium text-sm transition-opacity disabled:opacity-50"
        style="background-color: var(--color-gold); color: #1a1a1a"
      >
        {submitting ? 'Submitting…' : 'Submit'}
      </button>
    </div>
  </div>

  <!-- Existing requests -->
  {#if data.pto.length === 0}
    <div class="rounded-xl p-8 text-center" style="background-color: var(--color-surface); border: 1px solid var(--color-border)">
      <p class="text-gray-400">No PTO requests yet.</p>
    </div>
  {:else}
    <div class="space-y-2">
      {#each data.pto as req}
        <div class="rounded-xl p-4 flex items-center gap-3" style="background-color: var(--color-surface); border: 1px solid var(--color-border)">
          <div class="flex-1">
            <div class="flex items-center gap-2">
              <span class="font-medium text-white">
                {new Date(req.date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
              </span>
              <span class="text-xs px-2 py-0.5 rounded-full" style={statusStyle(req.status)}>{req.status}</span>
            </div>
            <div class="text-sm text-gray-400 mt-0.5">
              {labelType(req.type)}{req.note ? ` · ${req.note}` : ''}
            </div>
          </div>
          {#if req.status === 'pending'}
            <button
              onclick={() => deletePto(req.id)}
              disabled={deleting === req.id}
              class="text-sm px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
              style="color: #ef4444; border: 1px solid rgba(239,68,68,0.3)"
            >
              {deleting === req.id ? '…' : 'Delete'}
            </button>
          {/if}
        </div>
      {/each}
    </div>
  {/if}
</div>
