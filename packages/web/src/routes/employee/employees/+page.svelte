<script lang="ts">
  import type { PageData } from './$types';
  import type { Employee } from '@project/shared';
  import { api } from '$lib/api';
  import { invalidateAll } from '$app/navigation';
  import PageShell from '$lib/components/portal/PageShell.svelte';
  import PageHeader from '$lib/components/portal/PageHeader.svelte';
  import DataTable from '$lib/components/portal/DataTable.svelte';

  let { data } = $props<{ data: PageData }>();
  const isAdmin = data.isAdmin;

  let search = $state('');
  let roleFilter = $state('all');
  let accessFilter = $state('all');
  let statusFilter = $state<'all' | 'active' | 'inactive'>('all');
  let showCreate = $state(false);

  let newName = $state('');
  let newEmail = $state('');
  let newPassword = $state('');
  let newIsAdmin = $state(false);
  let newRoleIds = $state<string[]>([]);
  let submitting = $state(false);
  let submitError = $state('');

  let editingCell = $state<{ id: string; field: string } | null>(null);
  let editValue = $state('');
  let saving = $state(false);

  const filtered = $derived.by((): Employee[] => {
    let list: Employee[] = data.employees;
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((e: Employee) => e.name.toLowerCase().includes(q) || e.email.toLowerCase().includes(q));
    }
    if (roleFilter !== 'all') list = list.filter((e: Employee) => e.roles.some((r) => r.id === roleFilter));
    if (accessFilter === 'admin') list = list.filter((e: Employee) => e.isAdmin);
    if (accessFilter === 'standard') list = list.filter((e: Employee) => !e.isAdmin);
    if (statusFilter === 'active') list = list.filter((e: Employee) => e.isActive);
    if (statusFilter === 'inactive') list = list.filter((e: Employee) => !e.isActive);
    return list;
  });

  function toggleRole(id: string) {
    newRoleIds = newRoleIds.includes(id) ? newRoleIds.filter((r) => r !== id) : [...newRoleIds, id];
  }

  async function createEmployee() {
    if (!newName.trim()) { submitError = 'Name is required'; return; }
    if (!newEmail.trim()) { submitError = 'Email is required'; return; }
    if (newPassword.length < 8) { submitError = 'Password must be at least 8 characters'; return; }
    if (newRoleIds.length === 0) { submitError = 'Select at least one role'; return; }
    submitting = true;
    submitError = '';
    try {
      await api.admin.employees.create({ name: newName, email: newEmail, password: newPassword, isAdmin: newIsAdmin, roleIds: newRoleIds });
      newName = ''; newEmail = ''; newPassword = ''; newIsAdmin = false; newRoleIds = [];
      showCreate = false;
      await invalidateAll();
    } catch (e) {
      submitError = e instanceof Error ? e.message : 'Failed to create employee';
    } finally {
      submitting = false;
    }
  }

  function startEdit(id: string, field: string, value: string) {
    if (!isAdmin) return;
    editingCell = { id, field };
    editValue = value;
  }

  async function saveEdit(id: string, field: string) {
    saving = true;
    try {
      const update: Record<string, unknown> = {};
      if (field === 'name') update.name = editValue;
      if (field === 'email') update.email = editValue;
      await api.admin.employees.update(id, update);
      editingCell = null;
      await invalidateAll();
    } catch (e) {
      submitError = e instanceof Error ? e.message : 'Failed to save';
    } finally {
      saving = false;
    }
  }

  async function toggleAccess(id: string, currentIsAdmin: boolean) {
    try {
      await api.admin.employees.update(id, { isAdmin: !currentIsAdmin });
      await invalidateAll();
    } catch (e) {
      submitError = e instanceof Error ? e.message : 'Failed to update access';
    }
  }

  async function toggleActive(id: string, currentActive: boolean) {
    try {
      await api.admin.employees.update(id, { isActive: !currentActive });
      await invalidateAll();
    } catch (e) {
      submitError = e instanceof Error ? e.message : 'Failed to toggle status';
    }
  }

  function handleKeydown(e: KeyboardEvent, id: string, field: string) {
    if (e.key === 'Enter') saveEdit(id, field);
    if (e.key === 'Escape') editingCell = null;
  }

  const columns = [
    { key: 'name', label: 'Name', width: '1.2fr' },
    { key: 'email', label: 'Email', width: '1.6fr' },
    { key: 'role', label: 'Role', width: '1fr' },
    { key: 'admin', label: 'Admin', width: '0.7fr' },
    { key: 'active', label: 'Active', width: '0.7fr' },
    { key: 'action', label: 'Action', width: '0.8fr' },
  ];
</script>

<PageShell bgImage="/images/portal_background.png">
  <PageHeader eyebrow="Staff Portal" title="EMPLOYEES" user={data.user}>
    {#snippet actions()}
      {#if isAdmin}
        <button onclick={() => showCreate = !showCreate} style="background:var(--color-gold);border:none;color:#000;padding:8px 18px;font-size:11px;letter-spacing:0.18em;text-transform:uppercase;font-weight:700;cursor:pointer;">
          {showCreate ? '✕ Cancel' : '+ Add Employee'}
        </button>
      {/if}
    {/snippet}
  </PageHeader>

  <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;">
    <input type="search" bind:value={search} placeholder="Search…" style="flex:1;min-width:120px;background:#242424;border:1px solid #333;color:white;font-size:10px;padding:7px 10px;" />
    <select bind:value={roleFilter} style="background:#242424;border:1px solid #333;color:rgba(255,255,255,0.5);font-size:9px;padding:7px 10px;">
      <option value="all">All Roles</option>
      {#each data.roles as role}<option value={role.id}>{role.name}</option>{/each}
    </select>
    <select bind:value={accessFilter} style="background:#242424;border:1px solid #333;color:rgba(255,255,255,0.5);font-size:9px;padding:7px 10px;">
      <option value="all">All Access</option>
      <option value="admin">Admin</option>
      <option value="standard">Standard</option>
    </select>
    <select bind:value={statusFilter} style="background:#242424;border:1px solid #333;color:rgba(255,255,255,0.5);font-size:9px;padding:7px 10px;">
      <option value="all">All Statuses</option>
      <option value="active">Active</option>
      <option value="inactive">Inactive</option>
    </select>
  </div>

  {#if submitError}
    <div style="padding:10px 14px;font-size:10px;color:#f87171;border:1px solid rgba(239,68,68,0.3);background:rgba(239,68,68,0.08);">{submitError}</div>
  {/if}

  {#if showCreate && isAdmin}
    <div style="background:#242424;border:1px solid #333;border-top:2px solid #C9A84C;padding:16px;">
      <div style="display:flex;gap:8px;margin-bottom:8px;flex-wrap:wrap;">
        <input type="text" bind:value={newName} placeholder="Full name" style="flex:1;min-width:100px;background:transparent;border:1px solid #333;color:white;font-size:10px;padding:7px 10px;" />
        <input type="email" bind:value={newEmail} placeholder="Email" style="flex:1;min-width:100px;background:transparent;border:1px solid #333;color:white;font-size:10px;padding:7px 10px;" />
        <input type="password" bind:value={newPassword} placeholder="Password (min 8)" style="flex:1;min-width:100px;background:transparent;border:1px solid #333;color:white;font-size:10px;padding:7px 10px;" />
      </div>
      <div style="display:flex;gap:8px;margin-bottom:8px;flex-wrap:wrap;align-items:center;">
        <div style="color:rgba(255,255,255,0.35);font-size:8px;letter-spacing:0.1em;">Roles:</div>
        {#each data.roles as role}
          <button type="button" onclick={() => toggleRole(role.id)}
            style="padding:4px 10px;font-size:9px;cursor:pointer;border:1px solid #C9A84C;
              {newRoleIds.includes(role.id) ? 'background:#C9A84C;color:#000;' : 'background:transparent;color:#C9A84C;'}"
          >{role.name}</button>
        {/each}
        <div style="width:1px;height:16px;background:#333;margin:0 4px;"></div>
        <div style="color:rgba(255,255,255,0.35);font-size:8px;letter-spacing:0.1em;">Access:</div>
        <button type="button" onclick={() => newIsAdmin = false}
          style="padding:4px 10px;font-size:9px;cursor:pointer;border:1px solid #C9A84C;
            {!newIsAdmin ? 'background:#C9A84C;color:#000;' : 'background:transparent;color:#C9A84C;'}"
        >Standard</button>
        <button type="button" onclick={() => newIsAdmin = true}
          style="padding:4px 10px;font-size:9px;cursor:pointer;border:1px solid #C9A84C;
            {newIsAdmin ? 'background:#C9A84C;color:#000;' : 'background:transparent;color:#C9A84C;'}"
        >Admin</button>
      </div>
      <button onclick={createEmployee} disabled={submitting} style="background:#C9A84C;border:none;color:#000;font-size:8px;letter-spacing:0.15em;text-transform:uppercase;font-weight:600;padding:7px 14px;cursor:pointer;">
        {submitting ? 'Creating…' : 'Create Employee'}
      </button>
    </div>
  {/if}

  <DataTable columns={columns} rows={filtered}>
    {#snippet row(emp: Employee)}
      <span>
        {#if editingCell !== null && editingCell.id === emp.id && editingCell.field === 'name'}
          <input type="text" bind:value={editValue} onblur={() => saveEdit(emp.id, 'name')} onkeydown={(e) => handleKeydown(e, emp.id, 'name')} autofocus style="background:transparent;border:1px solid #C9A84C;color:white;font-size:10px;padding:4px 6px;width:90%;box-sizing:border-box;" />
        {:else}
          <span onclick={() => startEdit(emp.id, 'name', emp.name)} style="{isAdmin ? 'cursor:pointer;' : ''}">{emp.name}{emp.id === data.user.id ? ' (You)' : ''}</span>
        {/if}
      </span>
      <span>
        {#if editingCell !== null && editingCell.id === emp.id && editingCell.field === 'email'}
          <input type="email" bind:value={editValue} onblur={() => saveEdit(emp.id, 'email')} onkeydown={(e) => handleKeydown(e, emp.id, 'email')} autofocus style="background:transparent;border:1px solid #C9A84C;color:white;font-size:10px;padding:4px 6px;width:90%;box-sizing:border-box;" />
        {:else}
          <span onclick={() => startEdit(emp.id, 'email', emp.email)} style="color:rgba(255,255,255,0.5);{isAdmin ? 'cursor:pointer;' : ''}">{emp.email}</span>
        {/if}
      </span>
      <span>
        {#each emp.roles as role}
          <span style="font-size:8px;padding:1px 5px;border:1px solid #333;color:rgba(255,255,255,0.5);margin-right:2px;">{role.name}</span>
        {/each}
      </span>
      <span>
        {#if isAdmin}
          <button onclick={() => toggleAccess(emp.id, emp.isAdmin)}
            style="padding:3px 8px;font-size:8px;cursor:pointer;border:1px solid #C9A84C;
              {emp.isAdmin ? 'background:#C9A84C;color:#000;' : 'background:transparent;color:#C9A84C;'}"
          >{emp.isAdmin ? 'Admin' : 'Std'}</button>
        {:else}
          <span style="font-size:8px;letter-spacing:0.1em;text-transform:uppercase;{emp.isAdmin ? 'color:#C9A84C;' : 'color:rgba(255,255,255,0.35);'}">{emp.isAdmin ? 'Admin' : 'Std'}</span>
        {/if}
      </span>
      <span style="font-size:9px;letter-spacing:0.15em;text-transform:uppercase;color:{emp.isActive ? '#5db974' : 'rgba(255,255,255,0.4)'};">
        {emp.isActive ? '● Active' : '○ Inactive'}
      </span>
      {#if isAdmin}
        <button onclick={() => toggleActive(emp.id, emp.isActive)} style="background:none;border:1px solid #333;color:{emp.isActive ? '#22c55e' : '#ef4444'};font-size:9px;cursor:pointer;padding:3px 8px;">
          {emp.isActive ? 'Deactivate' : 'Activate'}
        </button>
      {:else}
        <span style="color:rgba(255,255,255,0.3);">—</span>
      {/if}
    {/snippet}
    {#snippet empty()}<span>No employees.</span>{/snippet}
  </DataTable>
</PageShell>
