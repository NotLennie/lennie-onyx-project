<script lang="ts">
  import type { PageData } from './$types';

  let { data } = $props<{ data: PageData }>();

  let search = $state('');

  const filtered = $derived.by(() => {
    if (!search.trim()) return data.clients;
    const q = search.toLowerCase();
    return data.clients.filter((c) => c.name.toLowerCase().includes(q) || c.email.toLowerCase().includes(q));
  });
</script>

<div class="max-w-3xl">
  <h1 class="text-3xl font-bold text-white mb-6">Clients</h1>

  <input
    type="search"
    bind:value={search}
    placeholder="Search by name or email…"
    class="w-full px-4 py-2.5 rounded-lg text-white text-sm outline-none mb-5"
    style="background-color: var(--color-surface); border: 1px solid var(--color-border)"
  />

  {#if filtered.length === 0}
    <div class="rounded-xl p-8 text-center" style="background-color: var(--color-surface); border: 1px solid var(--color-border)">
      <p class="text-gray-400">{search ? 'No clients match your search.' : 'No clients yet.'}</p>
    </div>
  {:else}
    <div class="space-y-2">
      {#each filtered as client}
        <div class="rounded-xl p-4 flex items-center gap-4" style="background-color: var(--color-surface); border: 1px solid var(--color-border)">
          <div class="w-9 h-9 rounded-full flex items-center justify-center font-semibold text-sm flex-shrink-0" style="background-color: rgba(201,168,76,0.2); color: var(--color-gold)">
            {client.name.charAt(0).toUpperCase()}
          </div>
          <div class="flex-1 min-w-0">
            <div class="font-medium text-white truncate">{client.name}</div>
            <div class="text-sm text-gray-400 truncate">{client.email}</div>
          </div>
          <div class="text-xs text-gray-500 flex-shrink-0">
            {new Date(client.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </div>
        </div>
      {/each}
    </div>
  {/if}
</div>
