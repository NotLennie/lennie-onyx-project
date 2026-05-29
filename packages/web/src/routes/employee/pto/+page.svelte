<script lang="ts">
  import type { PageData } from './$types';
  import type { PtoType, PtoRequest } from '@project/shared';
  import { api } from '$lib/api';
  import { invalidateAll } from '$app/navigation';
  import PageShell from '$lib/components/portal/PageShell.svelte';
  import PageHeader from '$lib/components/portal/PageHeader.svelte';
  import Card from '$lib/components/portal/Card.svelte';
  import DataTable from '$lib/components/portal/DataTable.svelte';

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

  const pto = $derived(data.pto as PtoRequest[]);
  const ownPto = $derived(pto.filter((p: PtoRequest) => p.employeeId === userId));
  const allPendingForReview = $derived(
    pto.filter((p: PtoRequest) => p.status === 'pending').sort((a: PtoRequest, b: PtoRequest) => a.date.localeCompare(b.date))
  );
  const ownPending = $derived(ownPto.filter((p: PtoRequest) => p.status === 'pending').sort((a: PtoRequest, b: PtoRequest) => a.date.localeCompare(b.date)));
  const ownUpcoming = $derived(ownPto.filter((p: PtoRequest) => p.status === 'approved' && p.date >= today).sort((a: PtoRequest, b: PtoRequest) => a.date.localeCompare(b.date)));
  const ownPast = $derived.by((): PtoRequest[] => {
    let list: PtoRequest[] = ownPto.filter((p: PtoRequest) => p.date < today || (p.status !== 'pending' && p.status !== 'approved'));
    if (appliedFrom) list = list.filter((p: PtoRequest) => p.date >= appliedFrom);
    if (appliedTo) list = list.filter((p: PtoRequest) => p.date <= appliedTo);
    if (appliedType !== 'all') list = list.filter((p: PtoRequest) => p.type === appliedType);
    return list.sort((a: PtoRequest, b: PtoRequest) => b.date.localeCompare(a.date));
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

  const requestColumns = [
    { key: 'date', label: 'Date', width: '1.2fr' },
    { key: 'type', label: 'Type', width: '1.2fr' },
    { key: 'note', label: 'Note', width: '1.5fr' },
    { key: 'status', label: 'Status', width: '1fr' },
    { key: 'action', label: 'Action', width: '0.9fr' },
  ];

  const reviewColumns = [
    { key: 'date', label: 'Date', width: '1fr' },
    { key: 'employee', label: 'Employee', width: '1.2fr' },
    { key: 'type', label: 'Type', width: '1.1fr' },
    { key: 'note', label: 'Note', width: '1.3fr' },
    { key: 'status', label: 'Status', width: '1.1fr' },
  ];
</script>

<PageShell bgImage="/images/portal_background.png">
  <PageHeader eyebrow="Staff Portal" title="MY PTO" user={data.user} />

  <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;">
    <Card label="Request PTO">
      {#if submitError}
        <div role="alert" style="margin-bottom:12px;padding:10px 14px;font-size:13px;color:#f87171;border:1px solid rgba(239,68,68,0.3);background:rgba(239,68,68,0.08);">{submitError}</div>
      {/if}
      <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:flex-end;">
        <div>
          <div style="color:rgba(255,255,255,0.3);font-size:8px;letter-spacing:0.1em;margin-bottom:4px;text-transform:uppercase;">Date</div>
          <input type="date" bind:value={newDate} style="background:transparent;border:1px solid #333;color:white;font-size:10px;padding:7px 10px;" />
        </div>
        <div>
          <div style="color:rgba(255,255,255,0.3);font-size:8px;letter-spacing:0.1em;margin-bottom:4px;text-transform:uppercase;">Type</div>
          <select bind:value={newType} style="background:#1a1a1a;border:1px solid #333;color:white;font-size:10px;padding:7px 10px;">
            {#each ptoTypes as t}<option value={t}>{labelType(t)}</option>{/each}
          </select>
        </div>
        <div style="flex:1;min-width:140px;">
          <div style="color:rgba(255,255,255,0.3);font-size:8px;letter-spacing:0.1em;margin-bottom:4px;text-transform:uppercase;">Note (Optional)</div>
          <input type="text" bind:value={newNote} placeholder="Add a note…" style="width:100%;background:transparent;border:1px solid #333;color:white;font-size:10px;padding:7px 10px;box-sizing:border-box;" />
        </div>
        <button onclick={createPto} disabled={submitting} style="background:var(--color-gold);border:none;color:#000;font-size:8px;letter-spacing:0.15em;text-transform:uppercase;font-weight:600;padding:7px 14px;cursor:pointer;">
          {submitting ? 'Submitting…' : 'Submit Request'}
        </button>
      </div>
    </Card>
    <Card accent label="PTO Balance">
      <div style="color:rgba(255,255,255,0.3);font-size:13px;padding:20px 0;">Balance tracking coming soon.</div>
    </Card>
  </div>

  <!-- Tab bar -->
  <div style="display:flex;border-bottom:1px solid #333;">
    {#each tabs as tab}
      <button
        onclick={() => activeTab = tab.id}
        style="padding:7px 14px;font-size:9px;letter-spacing:0.15em;text-transform:uppercase;background:none;border:none;cursor:pointer;margin-bottom:-1px;
          {activeTab === tab.id ? 'color:#C9A84C;border-bottom:2px solid #C9A84C;' : 'color:rgba(255,255,255,0.3);border-bottom:2px solid transparent;'}"
      >{tab.label}</button>
    {/each}
  </div>

  {#if activeTab === 'review' && isAdmin}
    <DataTable title="Pending Review" columns={reviewColumns} rows={allPendingForReview}>
      {#snippet row(req)}
        <span>{formatDate(req.date)}</span>
        <span>{req.employeeName ?? 'Employee'}{req.employeeId === userId ? ' (you)' : ''}</span>
        <span>{labelType(req.type)}</span>
        <span style="color:rgba(255,255,255,0.5);">{req.note ?? '—'}</span>
        <span>
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
        </span>
      {/snippet}
      {#snippet empty()}<span>No pending PTO requests to review.</span>{/snippet}
    </DataTable>
  {/if}

  {#if activeTab === 'pending'}
    <DataTable title="My Pending Requests" columns={requestColumns} rows={ownPending}>
      {#snippet row(req)}
        <span>{formatDate(req.date)}</span>
        <span>{labelType(req.type)}</span>
        <span style="color:rgba(255,255,255,0.5);">{req.note ?? '—'}</span>
        <span style="font-size:9px;letter-spacing:0.15em;text-transform:uppercase;color:#C9A84C;">Pending</span>
        <span>
          <button
            onclick={() => withdrawPto(req.id)}
            disabled={deleting === req.id}
            style="background:transparent;border:1px solid rgba(239,68,68,0.3);color:#ef4444;font-size:8px;letter-spacing:0.1em;text-transform:uppercase;padding:5px 10px;cursor:pointer;"
          >{deleting === req.id ? '…' : 'Withdraw'}</button>
        </span>
      {/snippet}
      {#snippet empty()}<span>No pending requests.</span>{/snippet}
    </DataTable>
  {/if}

  {#if activeTab === 'upcoming'}
    <DataTable title="Upcoming Approved PTO" columns={requestColumns} rows={ownUpcoming}>
      {#snippet row(req)}
        <span>{formatDate(req.date)}</span>
        <span>{labelType(req.type)}</span>
        <span style="color:rgba(255,255,255,0.5);">{req.note ?? '—'}</span>
        <span style="font-size:9px;letter-spacing:0.15em;text-transform:uppercase;color:#22c55e;">Approved</span>
        <span style="color:rgba(255,255,255,0.3);">—</span>
      {/snippet}
      {#snippet empty()}<span>No upcoming approved PTO.</span>{/snippet}
    </DataTable>
  {/if}

  {#if activeTab === 'past'}
    <div style="display:flex;gap:8px;margin-bottom:4px;align-items:center;flex-wrap:wrap;">
      <input type="date" bind:value={filterFrom} style="background:#242424;border:1px solid #333;color:rgba(255,255,255,0.5);font-size:9px;padding:5px 8px;" />
      <input type="date" bind:value={filterTo} style="background:#242424;border:1px solid #333;color:rgba(255,255,255,0.5);font-size:9px;padding:5px 8px;" />
      <select bind:value={filterType} style="background:#242424;border:1px solid #333;color:rgba(255,255,255,0.5);font-size:9px;padding:5px 8px;">
        <option value="all">All Types</option>
        {#each ptoTypes as t}<option value={t}>{labelType(t)}</option>{/each}
      </select>
      <button onclick={applyFilters} style="background:var(--color-gold);border:none;color:#000;font-size:8px;letter-spacing:0.15em;text-transform:uppercase;font-weight:600;padding:5px 12px;cursor:pointer;">Apply</button>
    </div>
    <DataTable title="Past PTO" columns={requestColumns} rows={ownPast}>
      {#snippet row(req)}
        <span>{formatDate(req.date)}</span>
        <span>{labelType(req.type)}</span>
        <span style="color:rgba(255,255,255,0.5);">{req.note ?? '—'}</span>
        <span style="font-size:9px;letter-spacing:0.15em;text-transform:uppercase;color:{statusColor(req.status)};">{req.status}</span>
        <span style="color:rgba(255,255,255,0.3);">—</span>
      {/snippet}
      {#snippet empty()}<span>No past PTO records.</span>{/snippet}
    </DataTable>
  {/if}
</PageShell>
