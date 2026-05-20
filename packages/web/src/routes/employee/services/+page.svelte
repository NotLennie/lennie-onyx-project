<script lang="ts">
  import type { PageData } from './$types';
  import type { ServiceType } from '@project/shared';
  import { api } from '$lib/api';
  import { invalidateAll } from '$app/navigation';

  let { data } = $props<{ data: PageData }>();

  const serviceTypes: ServiceType[] = ['haircut', 'custom_coloring', 'treatment', 'straightening', 'rebond', 'perming', 'specialized_styling'];
  const isAdmin = data.isAdmin;

  let search = $state('');
  let statusFilter = $state<'all' | 'active' | 'inactive'>('all');
  let showCreate = $state(false);

  let newName = $state('');
  let newType = $state<ServiceType>('haircut');
  let newPrice = $state('');
  let newDuration = $state(30);
  let newDesc = $state('');
  let newRoleIds = $state<string[]>([]);
  let submitting = $state(false);
  let submitError = $state('');

  let editingCell = $state<{ id: string; field: string } | null>(null);
  let editValue = $state('');
  let saving = $state(false);

  const filtered = $derived.by(() => {
    let list = data.services;
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((s) => s.name.toLowerCase().includes(q));
    }
    if (statusFilter === 'active') list = list.filter((s) => s.isActive);
    if (statusFilter === 'inactive') list = list.filter((s) => !s.isActive);
    return list;
  });

  function labelType(type: string) {
    return type.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
  }

  function toggleRole(id: string) {
    newRoleIds = newRoleIds.includes(id) ? newRoleIds.filter((r) => r !== id) : [...newRoleIds, id];
  }

  async function createService() {
    if (!newName.trim()) { submitError = 'Name is required'; return; }
    if (!/^\d+(\.\d{1,2})?$/.test(newPrice)) { submitError = 'Price must be a number like 45 or 45.00'; return; }
    if (newRoleIds.length === 0) { submitError = 'Select at least one role'; return; }
    submitting = true;
    submitError = '';
    try {
      await api.admin.services.create({ name: newName, type: newType, price: newPrice, durationMinutes: newDuration, description: newDesc || undefined, roleIds: newRoleIds });
      newName = ''; newPrice = ''; newDuration = 30; newDesc = ''; newRoleIds = [];
      showCreate = false;
      await invalidateAll();
    } catch (e) {
      submitError = e instanceof Error ? e.message : 'Failed to create service';
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
      const update: Record<string, any> = {};
      if (field === 'name') update.name = editValue;
      if (field === 'price') update.price = editValue;
      if (field === 'durationMinutes') update.durationMinutes = parseInt(editValue);
      if (field === 'type') update.type = editValue;
      await api.admin.services.update(id, update);
      editingCell = null;
      await invalidateAll();
    } catch (e) {
      submitError = e instanceof Error ? e.message : 'Failed to save';
    } finally {
      saving = false;
    }
  }

  async function toggleActive(id: string, currentActive: boolean) {
    try {
      await api.admin.services.update(id, { isActive: !currentActive });
      await invalidateAll();
    } catch (e) {
      submitError = e instanceof Error ? e.message : 'Failed to toggle status';
    }
  }

  function handleKeydown(e: KeyboardEvent, id: string, field: string) {
    if (e.key === 'Enter') saveEdit(id, field);
    if (e.key === 'Escape') editingCell = null;
  }
</script>

<div>
  <div style="color:rgba(255,255,255,0.4);font-size:8px;letter-spacing:0.25em;text-transform:uppercase;margin-bottom:4px;">Employee Portal</div>
  <div style="color:white;font-size:20px;font-family:Georgia,serif;font-weight:300;letter-spacing:0.05em;margin-bottom:20px;">SERVICES</div>

  <div style="display:flex;gap:8px;margin-bottom:16px;align-items:center;flex-wrap:wrap;">
    <input type="search" bind:value={search} placeholder="Search services…" style="flex:1;min-width:140px;background:#242424;border:1px solid #333;color:white;font-size:10px;padding:7px 10px;" />
    <select bind:value={statusFilter} style="background:#242424;border:1px solid #333;color:rgba(255,255,255,0.5);font-size:9px;padding:7px 10px;">
      <option value="all">All Statuses</option>
      <option value="active">Active</option>
      <option value="inactive">Inactive</option>
    </select>
    {#if isAdmin}
      <button onclick={() => showCreate = !showCreate} style="background:#C9A84C;border:none;color:#000;font-size:8px;letter-spacing:0.15em;text-transform:uppercase;font-weight:600;padding:7px 14px;cursor:pointer;">
        {showCreate ? '✕ Cancel' : '+ Create New Service'}
      </button>
    {/if}
  </div>

  {#if submitError}
    <div style="margin-bottom:12px;padding:10px 14px;font-size:10px;color:#f87171;border:1px solid rgba(239,68,68,0.3);background:rgba(239,68,68,0.08);">{submitError}</div>
  {/if}

  {#if showCreate && isAdmin}
    <div style="background:#242424;border:1px solid #333;border-top:2px solid #C9A84C;padding:16px;margin-bottom:16px;">
      <div style="display:flex;gap:8px;margin-bottom:8px;flex-wrap:wrap;">
        <input type="text" bind:value={newName} placeholder="Service Name" style="flex:2;min-width:120px;background:transparent;border:1px solid #333;color:white;font-size:10px;padding:7px 10px;" />
        <select bind:value={newType} style="flex:1;min-width:100px;background:#1a1a1a;border:1px solid #333;color:white;font-size:10px;padding:7px 10px;">
          {#each serviceTypes as t}<option value={t}>{labelType(t)}</option>{/each}
        </select>
        <input type="text" bind:value={newPrice} placeholder="Price" style="flex:1;min-width:70px;background:transparent;border:1px solid #333;color:white;font-size:10px;padding:7px 10px;" />
        <input type="number" bind:value={newDuration} min="5" step="5" placeholder="Duration (min)" style="flex:1;min-width:70px;background:transparent;border:1px solid #333;color:white;font-size:10px;padding:7px 10px;" />
      </div>
      <input type="text" bind:value={newDesc} placeholder="Description (optional)" style="width:100%;background:transparent;border:1px solid #333;color:white;font-size:10px;padding:7px 10px;margin-bottom:8px;box-sizing:border-box;" />
      <div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:10px;">
        {#each data.roles as role}
          <button type="button" onclick={() => toggleRole(role.id)}
            style="padding:4px 10px;font-size:9px;cursor:pointer;border:1px solid #C9A84C;
              {newRoleIds.includes(role.id) ? 'background:#C9A84C;color:#000;' : 'background:transparent;color:#C9A84C;'}"
          >{role.name}</button>
        {/each}
      </div>
      <button onclick={createService} disabled={submitting} style="background:#C9A84C;border:none;color:#000;font-size:8px;letter-spacing:0.15em;text-transform:uppercase;font-weight:600;padding:7px 14px;cursor:pointer;">
        {submitting ? 'Creating…' : 'Create Service'}
      </button>
    </div>
  {/if}

  {#if filtered.length === 0}
    <div style="background:#242424;border:1px solid #333;padding:32px;text-align:center;color:rgba(255,255,255,0.3);font-size:10px;">No services found.</div>
  {:else}
    <div style="display:grid;grid-template-columns:2fr 1fr 1fr 1fr 1fr 140px;padding:8px 14px;border-bottom:1px solid #333;">
      <div style="color:rgba(255,255,255,0.3);font-size:8px;letter-spacing:0.15em;text-transform:uppercase;">Name</div>
      <div style="color:rgba(255,255,255,0.3);font-size:8px;letter-spacing:0.15em;text-transform:uppercase;">Type</div>
      <div style="color:rgba(255,255,255,0.3);font-size:8px;letter-spacing:0.15em;text-transform:uppercase;">Price</div>
      <div style="color:rgba(255,255,255,0.3);font-size:8px;letter-spacing:0.15em;text-transform:uppercase;">Duration</div>
      <div style="color:rgba(255,255,255,0.3);font-size:8px;letter-spacing:0.15em;text-transform:uppercase;">Roles</div>
      <div style="color:rgba(255,255,255,0.3);font-size:8px;letter-spacing:0.15em;text-transform:uppercase;">Status</div>
    </div>

    {#each filtered as svc}
      <div style="display:grid;grid-template-columns:2fr 1fr 1fr 1fr 1fr 140px;padding:10px 14px;border-bottom:1px solid #2a2a2a;border-left:2px solid #C9A84C;align-items:center;{svc.isActive ? '' : 'opacity:0.5;'}">
        <div>
          {#if editingCell?.id === svc.id && editingCell.field === 'name'}
            <input type="text" bind:value={editValue} onblur={() => saveEdit(svc.id, 'name')} onkeydown={(e) => handleKeydown(e, svc.id, 'name')} autofocus style="background:transparent;border:1px solid #C9A84C;color:white;font-size:10px;padding:4px 6px;width:90%;box-sizing:border-box;" />
          {:else}
            <span onclick={() => startEdit(svc.id, 'name', svc.name)} style="color:white;font-size:10px;font-weight:500;{isAdmin ? 'cursor:pointer;' : ''}">{svc.name}</span>
          {/if}
        </div>
        <div>
          {#if editingCell?.id === svc.id && editingCell.field === 'type'}
            <select bind:value={editValue} onblur={() => saveEdit(svc.id, 'type')} onchange={() => saveEdit(svc.id, 'type')} autofocus style="background:#1a1a1a;border:1px solid #C9A84C;color:white;font-size:9px;padding:3px 6px;">
              {#each serviceTypes as t}<option value={t}>{labelType(t)}</option>{/each}
            </select>
          {:else}
            <span onclick={() => startEdit(svc.id, 'type', svc.type)} style="color:rgba(255,255,255,0.5);font-size:10px;{isAdmin ? 'cursor:pointer;' : ''}">{labelType(svc.type)}</span>
          {/if}
        </div>
        <div>
          {#if editingCell?.id === svc.id && editingCell.field === 'price'}
            <input type="text" bind:value={editValue} onblur={() => saveEdit(svc.id, 'price')} onkeydown={(e) => handleKeydown(e, svc.id, 'price')} autofocus style="background:transparent;border:1px solid #C9A84C;color:white;font-size:10px;padding:4px 6px;width:60px;" />
          {:else}
            <span onclick={() => startEdit(svc.id, 'price', svc.price)} style="color:rgba(255,255,255,0.5);font-size:10px;{isAdmin ? 'cursor:pointer;' : ''}">${svc.price}</span>
          {/if}
        </div>
        <div>
          {#if editingCell?.id === svc.id && editingCell.field === 'durationMinutes'}
            <input type="number" bind:value={editValue} onblur={() => saveEdit(svc.id, 'durationMinutes')} onkeydown={(e) => handleKeydown(e, svc.id, 'durationMinutes')} autofocus style="background:transparent;border:1px solid #C9A84C;color:white;font-size:10px;padding:4px 6px;width:60px;" />
          {:else}
            <span onclick={() => startEdit(svc.id, 'durationMinutes', String(svc.durationMinutes))} style="color:rgba(255,255,255,0.5);font-size:10px;{isAdmin ? 'cursor:pointer;' : ''}">{svc.durationMinutes} min</span>
          {/if}
        </div>
        <div style="display:flex;gap:3px;flex-wrap:wrap;">
          {#each (data.roles.filter(r => svc.roleIds.includes(r.id))) as role}
            <span style="font-size:8px;padding:1px 5px;border:1px solid #333;color:rgba(255,255,255,0.5);">{role.name}</span>
          {/each}
        </div>
        <div>
          {#if isAdmin}
            <select value={svc.isActive ? 'active' : 'inactive'} onchange={() => toggleActive(svc.id, svc.isActive)} style="background:#242424;border:1px solid #333;color:{svc.isActive ? '#22c55e' : '#ef4444'};font-size:9px;padding:3px 6px;cursor:pointer;">
              <option value="active" style="color:#22c55e">Active</option>
              <option value="inactive" style="color:#ef4444">Inactive</option>
            </select>
          {:else}
            <span style="font-size:8px;letter-spacing:0.1em;text-transform:uppercase;padding:2px 6px;{svc.isActive ? 'color:#22c55e;background:rgba(34,197,94,0.15);' : 'color:rgba(255,255,255,0.3);background:rgba(255,255,255,0.06);'}">{svc.isActive ? 'Active' : 'Inactive'}</span>
          {/if}
        </div>
      </div>
    {/each}
  {/if}
</div>
