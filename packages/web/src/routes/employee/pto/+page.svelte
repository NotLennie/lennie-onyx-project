<script lang="ts">
  import type { PageData } from './$types';
  import type { PtoType } from '@project/shared';
  import { api } from '$lib/api';
  import { invalidateAll } from '$app/navigation';

  let { data } = $props<{ data: PageData }>();

  const ptoTypes: PtoType[] = ['personal', 'holiday', 'sick_leave', 'maternity', 'paternity', 'bereavement'];
  const isAdmin = data.isAdmin;
  const userId = data.userId;
  const today = new Date().toISOString().slice(0, 10);

  let showCreate = $state(false);
  let newDate = $state('');
  let newType = $state<PtoType>('personal');
  let newNote = $state('');
  let submitting = $state(false);
  let submitError = $state('');
  let deleting = $state<string | null>(null);
  let updatingStatus = $state<string | null>(null);

  let activeTab = $state<'review' | 'pending' | 'upcoming' | 'past'>(isAdmin ? 'review' : 'pending');

  let filterFrom = $state('');
  let filterTo = $state('');
  let filterType = $state('all');
  let appliedFrom = $state('');
  let appliedTo = $state('');
  let appliedType = $state('all');

  const ownPto = $derived(data.pto.filter((p) => p.employeeId === userId));
  const allPendingForReview = $derived(
    data.pto.filter((p) => p.status === 'pending').sort((a, b) => a.date.localeCompare(b.date))
  );
  const ownPending = $derived(ownPto.filter((p) => p.status === 'pending').sort((a, b) => a.date.localeCompare(b.date)));
  const ownUpcoming = $derived(ownPto.filter((p) => p.status === 'approved' && p.date >= today).sort((a, b) => a.date.localeCompare(b.date)));
  const ownPast = $derived.by(() => {
    let list = ownPto.filter((p) => p.date < today || (p.status !== 'pending' && p.status !== 'approved'));
    if (appliedFrom) list = list.filter((p) => p.date >= appliedFrom);
    if (appliedTo) list = list.filter((p) => p.date <= appliedTo);
    if (appliedType !== 'all') list = list.filter((p) => p.type === appliedType);
    return list.sort((a, b) => b.date.localeCompare(a.date));
  });

  function labelType(type: string) {
    return type.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
  }

  function statusColor(status: string) {
    if (status === 'approved') return '#22c55e';
    if (status === 'declined') return '#ef4444';
    return '#C9A84C';
  }

  function formatDate(d: string) {
    return new Date(d + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  }

  async function createPto() {
    if (!newDate) { submitError = 'Date is required'; return; }
    submitting = true;
    submitError = '';
    try {
      await api.employee.pto.create({ date: newDate, type: newType, note: newNote || undefined });
      newDate = ''; newNote = '';
      showCreate = false;
      await invalidateAll();
    } catch (e) {
      submitError = e instanceof Error ? e.message : 'Failed to submit';
    } finally {
      submitting = false;
    }
  }

  async function withdrawPto(id: string) {
    deleting = id;
    try {
      await api.employee.pto.delete(id);
      await invalidateAll();
    } catch (e) {
      submitError = e instanceof Error ? e.message : 'Failed to withdraw';
    } finally {
      deleting = null;
    }
  }

  async function updatePtoStatus(id: string, status: 'approved' | 'declined') {
    updatingStatus = id;
    try {
      await api.employee.pto.updateStatus(id, status);
      await invalidateAll();
    } catch (e) {
      submitError = e instanceof Error ? e.message : 'Failed to update';
    } finally {
      updatingStatus = null;
    }
  }

  function applyFilters() {
    appliedFrom = filterFrom;
    appliedTo = filterTo;
    appliedType = filterType;
  }

  const tabs = $derived.by(() => {
    if (isAdmin) return [
      { id: 'review' as const, label: 'Pending Review' },
      { id: 'pending' as const, label: 'Pending' },
      { id: 'upcoming' as const, label: 'Upcoming' },
      { id: 'past' as const, label: 'Past' },
    ];
    return [
      { id: 'pending' as const, label: 'Pending' },
      { id: 'upcoming' as const, label: 'Upcoming' },
      { id: 'past' as const, label: 'Past' },
    ];
  });
</script>

<div>
  <div style="color:rgba(255,255,255,0.4);font-size:8px;letter-spacing:0.25em;text-transform:uppercase;margin-bottom:4px;">Employee Portal</div>
  <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:16px;">
    <div style="color:white;font-size:20px;font-family:Georgia,serif;font-weight:300;letter-spacing:0.05em;">MY PTO</div>
    <button onclick={() => showCreate = !showCreate} style="background:#C9A84C;border:none;color:#000;font-size:8px;letter-spacing:0.15em;text-transform:uppercase;font-weight:600;padding:7px 14px;cursor:pointer;">
      {showCreate ? '✕ Cancel' : '+ Request PTO'}
    </button>
  </div>

  {#if submitError}
    <div style="margin-bottom:12px;padding:10px 14px;font-size:10px;color:#f87171;border:1px solid rgba(239,68,68,0.3);background:rgba(239,68,68,0.08);">{submitError}</div>
  {/if}

  {#if showCreate}
    <div style="background:#242424;border:1px solid #333;border-top:2px solid #C9A84C;padding:16px;margin-bottom:16px;">
      <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:flex-end;">
        <div>
          <div style="color:rgba(255,255,255,0.3);font-size:8px;letter-spacing:0.1em;margin-bottom:4px;">DATE</div>
          <input type="date" bind:value={newDate} style="background:transparent;border:1px solid #333;color:white;font-size:10px;padding:7px 10px;" />
        </div>
        <div>
          <div style="color:rgba(255,255,255,0.3);font-size:8px;letter-spacing:0.1em;margin-bottom:4px;">TYPE</div>
          <select bind:value={newType} style="background:#1a1a1a;border:1px solid #333;color:white;font-size:10px;padding:7px 10px;">
            {#each ptoTypes as t}<option value={t}>{labelType(t)}</option>{/each}
          </select>
        </div>
        <div style="flex:1;min-width:140px;">
          <div style="color:rgba(255,255,255,0.3);font-size:8px;letter-spacing:0.1em;margin-bottom:4px;">NOTE (OPTIONAL)</div>
          <input type="text" bind:value={newNote} placeholder="Add a note…" style="width:100%;background:transparent;border:1px solid #333;color:white;font-size:10px;padding:7px 10px;box-sizing:border-box;" />
        </div>
        <button onclick={createPto} disabled={submitting} style="background:#C9A84C;border:none;color:#000;font-size:8px;letter-spacing:0.15em;text-transform:uppercase;font-weight:600;padding:7px 14px;cursor:pointer;">
          {submitting ? 'Submitting…' : 'Submit Request'}
        </button>
      </div>
    </div>
  {/if}

  <div style="display:flex;border-bottom:1px solid #333;margin-bottom:16px;">
    {#each tabs as tab}
      <button
        onclick={() => activeTab = tab.id}
        style="padding:7px 14px;font-size:9px;letter-spacing:0.15em;text-transform:uppercase;background:none;border:none;cursor:pointer;margin-bottom:-1px;
          {activeTab === tab.id ? 'color:#C9A84C;border-bottom:2px solid #C9A84C;' : 'color:rgba(255,255,255,0.3);border-bottom:2px solid transparent;'}"
      >{tab.label}</button>
    {/each}
  </div>

  {#if activeTab === 'review' && isAdmin}
    {#if allPendingForReview.length === 0}
      <div style="color:rgba(255,255,255,0.25);font-size:10px;">No pending PTO requests to review.</div>
    {:else}
      {#each allPendingForReview as req}
        <div style="background:#242424;border:1px solid #333;border-left:2px solid #C9A84C;padding:12px 14px;margin-bottom:6px;display:flex;justify-content:space-between;align-items:center;">
          <div>
            <div style="color:white;font-size:10px;font-weight:500;">{formatDate(req.date)}</div>
            <div style="color:rgba(255,255,255,0.35);font-size:9px;margin-top:2px;">
              {req.employeeName ?? 'Employee'}{req.employeeId === userId ? ' (you)' : ''} · {labelType(req.type)}{req.note ? ` · ${req.note}` : ''}
            </div>
          </div>
          <select
            value={req.status}
            onchange={(e) => updatePtoStatus(req.id, (e.target as HTMLSelectElement).value as any)}
            disabled={updatingStatus === req.id}
            style="background:#242424;border:1px solid #333;color:{statusColor(req.status)};font-size:9px;padding:3px 8px;cursor:pointer;"
          >
            <option value="pending" style="color:#C9A84C">Pending</option>
            <option value="approved" style="color:#22c55e">Approved</option>
            <option value="declined" style="color:#ef4444">Declined</option>
          </select>
        </div>
      {/each}
    {/if}
  {/if}

  {#if activeTab === 'pending'}
    {#if ownPending.length === 0}
      <div style="color:rgba(255,255,255,0.25);font-size:10px;">No pending requests.</div>
    {:else}
      {#each ownPending as req}
        <div style="background:#242424;border:1px solid #333;border-left:2px solid #C9A84C;padding:12px 14px;margin-bottom:6px;display:flex;justify-content:space-between;align-items:center;">
          <div>
            <div style="display:flex;align-items:center;gap:8px;">
              <span style="color:white;font-size:10px;font-weight:500;">{formatDate(req.date)}</span>
              <span style="font-size:8px;letter-spacing:0.1em;text-transform:uppercase;padding:2px 6px;color:#C9A84C;background:rgba(201,168,76,0.15);">Pending</span>
            </div>
            <div style="color:rgba(255,255,255,0.35);font-size:9px;margin-top:2px;">{labelType(req.type)}{req.note ? ` · ${req.note}` : ''}</div>
          </div>
          <button
            onclick={() => withdrawPto(req.id)}
            disabled={deleting === req.id}
            style="background:transparent;border:1px solid rgba(239,68,68,0.3);color:#ef4444;font-size:8px;letter-spacing:0.1em;text-transform:uppercase;padding:5px 10px;cursor:pointer;"
          >{deleting === req.id ? '…' : 'Withdraw'}</button>
        </div>
      {/each}
    {/if}
  {/if}

  {#if activeTab === 'upcoming'}
    {#if ownUpcoming.length === 0}
      <div style="color:rgba(255,255,255,0.25);font-size:10px;">No upcoming approved PTO.</div>
    {:else}
      {#each ownUpcoming as req}
        <div style="background:#242424;border:1px solid #333;border-left:2px solid #C9A84C;padding:12px 14px;margin-bottom:6px;">
          <div style="display:flex;align-items:center;gap:8px;">
            <span style="color:white;font-size:10px;font-weight:500;">{formatDate(req.date)}</span>
            <span style="font-size:8px;letter-spacing:0.1em;text-transform:uppercase;padding:2px 6px;color:#22c55e;background:rgba(34,197,94,0.15);">Approved</span>
          </div>
          <div style="color:rgba(255,255,255,0.35);font-size:9px;margin-top:2px;">{labelType(req.type)}{req.note ? ` · ${req.note}` : ''}</div>
        </div>
      {/each}
    {/if}
  {/if}

  {#if activeTab === 'past'}
    <div style="display:flex;gap:8px;margin-bottom:12px;align-items:center;flex-wrap:wrap;">
      <input type="date" bind:value={filterFrom} style="background:#242424;border:1px solid #333;color:rgba(255,255,255,0.5);font-size:9px;padding:5px 8px;" />
      <input type="date" bind:value={filterTo} style="background:#242424;border:1px solid #333;color:rgba(255,255,255,0.5);font-size:9px;padding:5px 8px;" />
      <select bind:value={filterType} style="background:#242424;border:1px solid #333;color:rgba(255,255,255,0.5);font-size:9px;padding:5px 8px;">
        <option value="all">All Types</option>
        {#each ptoTypes as t}<option value={t}>{labelType(t)}</option>{/each}
      </select>
      <button onclick={applyFilters} style="background:#C9A84C;border:none;color:#000;font-size:8px;letter-spacing:0.15em;text-transform:uppercase;font-weight:600;padding:5px 12px;cursor:pointer;">Apply</button>
    </div>

    {#if ownPast.length === 0}
      <div style="color:rgba(255,255,255,0.25);font-size:10px;">No past PTO records.</div>
    {:else}
      {#each ownPast as req}
        <div style="background:#242424;border:1px solid #333;border-left:2px solid #C9A84C;padding:12px 14px;margin-bottom:6px;">
          <div style="display:flex;align-items:center;gap:8px;">
            <span style="color:white;font-size:10px;font-weight:500;">{formatDate(req.date)}</span>
            <span style="font-size:8px;letter-spacing:0.1em;text-transform:uppercase;padding:2px 6px;color:{statusColor(req.status)};background:{statusColor(req.status)}15;">{req.status}</span>
          </div>
          <div style="color:rgba(255,255,255,0.35);font-size:9px;margin-top:2px;">{labelType(req.type)}{req.note ? ` · ${req.note}` : ''}</div>
        </div>
      {/each}
    {/if}
  {/if}
</div>
