<script lang="ts">
  import type { PageData } from './$types';
  import type { ClientRow } from '$lib/api';
  import PageShell from '$lib/components/portal/PageShell.svelte';
  import PageHeader from '$lib/components/portal/PageHeader.svelte';
  import DataTable from '$lib/components/portal/DataTable.svelte';

  let { data } = $props<{ data: PageData }>();

  let search = $state('');

  function formatDate(date: string) {
    return new Date(date).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
  }

  const filtered = $derived.by((): ClientRow[] => {
    if (!search.trim()) return data.clients;
    const q = search.toLowerCase();
    return data.clients.filter((c: ClientRow) =>
      c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q) || (c.phone && c.phone.includes(q))
    );
  });

  const clientRows: ClientRow[] = $derived(filtered as ClientRow[]);

  const columns = [
    { key: 'name', label: 'Name', width: '1.2fr' },
    { key: 'email', label: 'Email', width: '1.6fr' },
    { key: 'phone', label: 'Phone', width: '1fr' },
    { key: 'address', label: 'Address', width: '1.4fr' },
    { key: 'joined', label: 'Joined', width: '0.9fr' },
    { key: 'action', label: 'Action', width: '0.7fr' },
  ];
</script>

<PageShell bgImage="/images/portal_background.png">
  <PageHeader eyebrow="Staff Portal" title="CLIENTS" user={data.user} />

  <input
    type="search"
    bind:value={search}
    placeholder="Search by name, email, or phone…"
    style="width:100%;background:#242424;border:1px solid #333;color:white;font-size:10px;padding:8px 12px;box-sizing:border-box;"
  />

  <DataTable columns={columns} rows={clientRows}>
    {#snippet row(c)}
      <span>{c.name}</span>
      <span style="color:rgba(255,255,255,0.5);">{c.email}</span>
      <span>{c.phone ?? '—'}</span>
      <span>{c.address ?? '—'}</span>
      <span>{formatDate(c.createdAt)}</span>
      <a href="/employee/clients/{c.id}" style="color:var(--color-gold);font-size:11px;text-decoration:none;">View</a>
    {/snippet}
    {#snippet empty()}<span>No clients match.</span>{/snippet}
  </DataTable>
</PageShell>
