<script lang="ts" generics="Row">
  import type { Snippet } from 'svelte';
  type Column = { key: string; label: string; width?: string };
  let { columns, rows, title, viewAllHref, row, empty }: {
    columns: Column[];
    rows: Row[];
    title?: string;
    viewAllHref?: string;
    row: Snippet<[Row]>;
    empty?: Snippet;
  } = $props();
  const gridTemplate = $derived(columns.map(c => c.width ?? '1fr').join(' '));
</script>

<div class="table">
  {#if title}
    <div class="table-head">
      <h4>{title}</h4>
      {#if viewAllHref}<a href={viewAllHref} class="view-all">View All →</a>{/if}
    </div>
  {/if}
  <div class="thead" style="grid-template-columns: {gridTemplate};">
    {#each columns as col}<span>{col.label}</span>{/each}
  </div>
  {#if rows.length === 0}
    <div class="empty">
      {#if empty}{@render empty()}{:else}No records.{/if}
    </div>
  {:else}
    {#each rows as r}
      <div class="trow" style="grid-template-columns: {gridTemplate};">
        {@render row(r)}
      </div>
    {/each}
  {/if}
</div>

<style>
  .table { background: var(--color-surface); border: 1px solid var(--color-border); border-top: 2px solid var(--color-gold); }
  .table-head { display: flex; justify-content: space-between; align-items: center; padding: 14px 18px; border-bottom: 1px solid var(--color-border); }
  .table-head h4 { color: var(--color-gold); font-size: 11px; letter-spacing: 0.25em; text-transform: uppercase; margin: 0; }
  .view-all { color: rgba(255,255,255,0.5); font-size: 10px; letter-spacing: 0.18em; text-transform: uppercase; text-decoration: none; }
  .thead { display: grid; padding: 11px 18px; color: rgba(255,255,255,0.4); font-size: 10px; letter-spacing: 0.18em; text-transform: uppercase; border-bottom: 1px solid var(--color-border); }
  .trow { display: grid; padding: 11px 18px; align-items: center; border-bottom: 1px solid var(--color-border); font-size: 12px; color: rgba(255,255,255,0.7); }
  .trow:last-child { border-bottom: none; }
  .empty { padding: 24px 18px; color: rgba(255,255,255,0.4); font-size: 13px; text-align: center; }
</style>
