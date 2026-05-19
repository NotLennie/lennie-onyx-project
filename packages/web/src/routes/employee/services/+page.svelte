<script lang="ts">
  import type { PageData } from './$types';
  import type { ServiceType } from '@project/shared';
  import { api } from '$lib/api';
  import { invalidateAll } from '$app/navigation';

  let { data } = $props<{ data: PageData }>();

  const serviceTypes: ServiceType[] = ['haircut', 'custom_coloring', 'treatment', 'straightening', 'rebond', 'perming', 'specialized_styling'];

  let newName = $state('');
  let newType = $state<ServiceType>('haircut');
  let newPrice = $state('');
  let newDuration = $state(30);
  let newDesc = $state('');
  let newRoleIds = $state<string[]>([]);
  let submitting = $state(false);
  let submitError = $state('');
  let deleting = $state<string | null>(null);

  function toggleRole(id: string) {
    newRoleIds = newRoleIds.includes(id) ? newRoleIds.filter((r) => r !== id) : [...newRoleIds, id];
  }

  function labelType(type: string) {
    return type.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
  }

  async function submit() {
    if (!newName.trim()) { submitError = 'Name is required'; return; }
    if (!/^\d+(\.\d{1,2})?$/.test(newPrice)) { submitError = 'Price must be a number like 45 or 45.00'; return; }
    if (newRoleIds.length === 0) { submitError = 'Select at least one role'; return; }
    submitting = true;
    submitError = '';
    try {
      await api.admin.services.create({
        name: newName,
        type: newType,
        price: newPrice,
        durationMinutes: newDuration,
        description: newDesc || undefined,
        roleIds: newRoleIds,
      });
      newName = '';
      newPrice = '';
      newDuration = 30;
      newDesc = '';
      newRoleIds = [];
      await invalidateAll();
    } catch (e) {
      submitError = e instanceof Error ? e.message : 'Failed to create service';
    } finally {
      submitting = false;
    }
  }

  async function deleteService(id: string) {
    deleting = id;
    try {
      await api.admin.services.delete(id);
      await invalidateAll();
    } catch (e) {
      submitError = e instanceof Error ? e.message : 'Failed to delete service';
    } finally {
      deleting = null;
    }
  }
</script>

<div class="max-w-3xl">
  <h1 class="text-3xl font-bold text-white mb-8">Services</h1>

  <div class="rounded-xl p-5 mb-8" style="background-color: var(--color-surface); border: 1px solid var(--color-border)">
    <h2 class="text-base font-semibold text-white mb-4">New Service</h2>

    {#if submitError}
      <div class="mb-3 p-3 rounded-lg text-sm" style="background-color: rgba(239,68,68,0.1); color: #ef4444; border: 1px solid rgba(239,68,68,0.3)">
        {submitError}
      </div>
    {/if}

    <div class="grid grid-cols-2 gap-3 mb-3">
      <input
        type="text"
        bind:value={newName}
        placeholder="Name"
        class="px-3 py-2 rounded-lg text-white text-sm col-span-2"
        style="background-color: var(--color-bg); border: 1px solid var(--color-border)"
      />
      <select
        bind:value={newType}
        class="px-3 py-2 rounded-lg text-white text-sm"
        style="background-color: var(--color-bg); border: 1px solid var(--color-border)"
      >
        {#each serviceTypes as t}
          <option value={t}>{labelType(t)}</option>
        {/each}
      </select>
      <input
        type="text"
        bind:value={newPrice}
        placeholder="Price (e.g. 45.00)"
        class="px-3 py-2 rounded-lg text-white text-sm"
        style="background-color: var(--color-bg); border: 1px solid var(--color-border)"
      />
      <input
        type="number"
        bind:value={newDuration}
        min="5"
        step="5"
        placeholder="Duration (minutes)"
        class="px-3 py-2 rounded-lg text-white text-sm"
        style="background-color: var(--color-bg); border: 1px solid var(--color-border)"
      />
      <input
        type="text"
        bind:value={newDesc}
        placeholder="Description (optional)"
        class="px-3 py-2 rounded-lg text-white text-sm"
        style="background-color: var(--color-bg); border: 1px solid var(--color-border)"
      />
    </div>

    <div class="mb-4">
      <div class="text-xs text-gray-400 mb-2">Roles (select at least one)</div>
      <div class="flex flex-wrap gap-2">
        {#each data.roles as role}
          <button
            type="button"
            onclick={() => toggleRole(role.id)}
            class="px-3 py-1 rounded-full text-sm font-medium transition-colors"
            style={newRoleIds.includes(role.id)
              ? 'background-color: var(--color-gold); color: #1a1a1a'
              : 'background-color: var(--color-bg); color: var(--color-gold); border: 1px solid var(--color-gold)'}
          >
            {role.name}
          </button>
        {/each}
      </div>
    </div>

    <button
      onclick={submit}
      disabled={submitting}
      class="px-5 py-2 rounded-lg font-medium text-sm transition-opacity disabled:opacity-50"
      style="background-color: var(--color-gold); color: #1a1a1a"
    >
      {submitting ? 'Creating…' : 'Create Service'}
    </button>
  </div>

  {#if data.services.length === 0}
    <div class="rounded-xl p-8 text-center" style="background-color: var(--color-surface); border: 1px solid var(--color-border)">
      <p class="text-gray-400">No services yet.</p>
    </div>
  {:else}
    <div class="space-y-2">
      {#each data.services as svc}
        <div class="rounded-xl p-4 flex items-start gap-4" style="background-color: var(--color-surface); border: 1px solid var(--color-border)">
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2 mb-1">
              <span class="font-semibold text-white">{svc.name}</span>
              <span class="text-xs px-2 py-0.5 rounded-full" style="background-color: rgba(201,168,76,0.15); color: var(--color-gold)">
                {labelType(svc.type)}
              </span>
            </div>
            <div class="text-sm text-gray-400 flex gap-3">
              <span>${svc.price}</span>
              <span>{svc.durationMinutes} min</span>
            </div>
          </div>
          <button
            onclick={() => deleteService(svc.id)}
            disabled={deleting === svc.id}
            class="text-sm px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50 flex-shrink-0"
            style="color: #ef4444; border: 1px solid rgba(239,68,68,0.3)"
          >
            {deleting === svc.id ? '…' : 'Delete'}
          </button>
        </div>
      {/each}
    </div>
  {/if}
</div>
