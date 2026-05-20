<script lang="ts">
  import type { PageData } from './$types';

  let { data } = $props<{ data: PageData }>();

  let search = $state('');

  const filtered = $derived.by(() => {
    if (!search.trim()) return data.clients;
    const q = search.toLowerCase();
    return data.clients.filter((c) =>
      c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q) || (c.phone && c.phone.includes(q))
    );
  });

  function formatDate(d: string) {
    return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }
</script>

<div>
  <div style="color:rgba(255,255,255,0.4);font-size:8px;letter-spacing:0.25em;text-transform:uppercase;margin-bottom:4px;">Employee Portal</div>
  <div style="color:white;font-size:20px;font-family:Georgia,serif;font-weight:300;letter-spacing:0.05em;margin-bottom:20px;">CLIENTS</div>

  <input
    type="search"
    bind:value={search}
    placeholder="Search by name, email, or phone…"
    style="width:100%;background:#242424;border:1px solid #333;color:white;font-size:10px;padding:8px 12px;margin-bottom:16px;box-sizing:border-box;"
  />

  {#if filtered.length === 0}
    <div style="background:#242424;border:1px solid #333;padding:32px;text-align:center;color:rgba(255,255,255,0.3);font-size:10px;">
      {search ? 'No clients match your search.' : 'No clients yet.'}
    </div>
  {:else}
    <div style="display:grid;grid-template-columns:1.5fr 1.5fr 1fr 2fr 1fr;padding:8px 14px;border-bottom:1px solid #333;">
      <div style="color:rgba(255,255,255,0.3);font-size:8px;letter-spacing:0.15em;text-transform:uppercase;">Name</div>
      <div style="color:rgba(255,255,255,0.3);font-size:8px;letter-spacing:0.15em;text-transform:uppercase;">Email</div>
      <div style="color:rgba(255,255,255,0.3);font-size:8px;letter-spacing:0.15em;text-transform:uppercase;">Phone</div>
      <div style="color:rgba(255,255,255,0.3);font-size:8px;letter-spacing:0.15em;text-transform:uppercase;">Address</div>
      <div style="color:rgba(255,255,255,0.3);font-size:8px;letter-spacing:0.15em;text-transform:uppercase;">Joined</div>
    </div>

    {#each filtered as client}
      <div style="display:grid;grid-template-columns:1.5fr 1.5fr 1fr 2fr 1fr;padding:10px 14px;border-bottom:1px solid #2a2a2a;border-left:2px solid #C9A84C;align-items:center;">
        <div style="display:flex;align-items:center;gap:8px;">
          <div style="width:26px;height:26px;display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:600;background:rgba(201,168,76,0.15);border:1px solid rgba(201,168,76,0.3);color:#C9A84C;flex-shrink:0;">{client.name.charAt(0).toUpperCase()}</div>
          <span style="color:white;font-size:10px;font-weight:500;">{client.name}</span>
        </div>
        <div style="color:rgba(255,255,255,0.5);font-size:10px;">{client.email}</div>
        <div style="color:rgba(255,255,255,0.5);font-size:10px;">{client.phone ?? '—'}</div>
        <div style="color:rgba(255,255,255,0.5);font-size:10px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">{client.address ?? '—'}</div>
        <div style="color:rgba(255,255,255,0.35);font-size:9px;">{formatDate(client.createdAt)}</div>
      </div>
    {/each}
  {/if}
</div>
