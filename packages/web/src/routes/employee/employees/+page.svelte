<script lang="ts">
  import type { PageData } from './$types';
  import { api } from '$lib/api';
  import { invalidateAll } from '$app/navigation';

  let { data } = $props<{ data: PageData }>();

  let newName = $state('');
  let newEmail = $state('');
  let newPassword = $state('');
  let newIsAdmin = $state(false);
  let newRoleIds = $state<string[]>([]);
  let submitting = $state(false);
  let submitError = $state('');
  let deleting = $state<string | null>(null);

  function toggleRole(id: string) {
    newRoleIds = newRoleIds.includes(id) ? newRoleIds.filter((r) => r !== id) : [...newRoleIds, id];
  }

  async function submit() {
    if (!newName.trim()) { submitError = 'Name is required'; return; }
    if (!newEmail.trim()) { submitError = 'Email is required'; return; }
    if (newPassword.length < 8) { submitError = 'Password must be at least 8 characters'; return; }
    if (newRoleIds.length === 0) { submitError = 'Select at least one role'; return; }
    submitting = true;
    submitError = '';
    try {
      await api.admin.employees.create({
        name: newName,
        email: newEmail,
        password: newPassword,
        isAdmin: newIsAdmin,
        roleIds: newRoleIds,
      });
      newName = '';
      newEmail = '';
      newPassword = '';
      newIsAdmin = false;
      newRoleIds = [];
      await invalidateAll();
    } catch (e) {
      submitError = e instanceof Error ? e.message : 'Failed to create employee';
    } finally {
      submitting = false;
    }
  }

  async function deleteEmployee(id: string) {
    deleting = id;
    try {
      await api.admin.employees.delete(id);
      await invalidateAll();
    } catch (e) {
      submitError = e instanceof Error ? e.message : 'Failed to delete employee';
    } finally {
      deleting = null;
    }
  }
</script>

<div class="max-w-3xl">
  <h1 class="text-3xl font-bold text-white mb-8">Employees</h1>

  <div class="rounded-xl p-5 mb-8" style="background-color: var(--color-surface); border: 1px solid var(--color-border)">
    <h2 class="text-base font-semibold text-white mb-4">New Employee</h2>

    {#if submitError}
      <div class="mb-3 p-3 rounded-lg text-sm" style="background-color: rgba(239,68,68,0.1); color: #ef4444; border: 1px solid rgba(239,68,68,0.3)">
        {submitError}
      </div>
    {/if}

    <div class="grid grid-cols-2 gap-3 mb-3">
      <input
        type="text"
        bind:value={newName}
        placeholder="Full name"
        class="px-3 py-2 rounded-lg text-white text-sm"
        style="background-color: var(--color-bg); border: 1px solid var(--color-border)"
      />
      <input
        type="email"
        bind:value={newEmail}
        placeholder="Email"
        class="px-3 py-2 rounded-lg text-white text-sm"
        style="background-color: var(--color-bg); border: 1px solid var(--color-border)"
      />
      <input
        type="password"
        bind:value={newPassword}
        placeholder="Password (min 8 chars)"
        class="px-3 py-2 rounded-lg text-white text-sm col-span-2"
        style="background-color: var(--color-bg); border: 1px solid var(--color-border)"
      />
    </div>

    <div class="mb-3">
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

    <label class="flex items-center gap-2 mb-4 cursor-pointer select-none">
      <input type="checkbox" bind:checked={newIsAdmin} class="w-4 h-4 rounded accent-yellow-500" />
      <span class="text-sm text-gray-300">Grant admin access</span>
    </label>

    <button
      onclick={submit}
      disabled={submitting}
      class="px-5 py-2 rounded-lg font-medium text-sm transition-opacity disabled:opacity-50"
      style="background-color: var(--color-gold); color: #1a1a1a"
    >
      {submitting ? 'Creating…' : 'Create Employee'}
    </button>
  </div>

  {#if data.employees.length === 0}
    <div class="rounded-xl p-8 text-center" style="background-color: var(--color-surface); border: 1px solid var(--color-border)">
      <p class="text-gray-400">No employees yet.</p>
    </div>
  {:else}
    <div class="space-y-2">
      {#each data.employees as emp}
        <div class="rounded-xl p-4 flex items-center gap-4" style="background-color: var(--color-surface); border: 1px solid var(--color-border)">
          <div class="w-9 h-9 rounded-full flex items-center justify-center font-semibold text-sm flex-shrink-0" style="background-color: rgba(201,168,76,0.2); color: var(--color-gold)">
            {emp.name.charAt(0).toUpperCase()}
          </div>
          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-2 mb-0.5">
              <span class="font-medium text-white truncate">{emp.name}</span>
              {#if emp.isAdmin}
                <span class="text-xs px-2 py-0.5 rounded-full flex-shrink-0" style="background-color: rgba(201,168,76,0.15); color: var(--color-gold)">Admin</span>
              {/if}
            </div>
            <div class="text-sm text-gray-400 truncate">{emp.email}</div>
            {#if emp.roles.length > 0}
              <div class="flex flex-wrap gap-1 mt-1">
                {#each emp.roles as role}
                  <span class="text-xs px-1.5 py-0.5 rounded" style="background-color: var(--color-bg); color: #9ca3af; border: 1px solid var(--color-border)">{role.name}</span>
                {/each}
              </div>
            {/if}
          </div>
          <button
            onclick={() => deleteEmployee(emp.id)}
            disabled={deleting === emp.id}
            class="text-sm px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50 flex-shrink-0"
            style="color: #ef4444; border: 1px solid rgba(239,68,68,0.3)"
          >
            {deleting === emp.id ? '…' : 'Delete'}
          </button>
        </div>
      {/each}
    </div>
  {/if}
</div>
