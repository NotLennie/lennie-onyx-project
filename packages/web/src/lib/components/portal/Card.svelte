<script lang="ts">
  import type { Snippet } from 'svelte';
  let { children, accent = false, label, padding = 'md' }: {
    children: Snippet;
    accent?: boolean;
    label?: string;
    padding?: 'sm' | 'md' | 'lg';
  } = $props();
  const pad = $derived(padding === 'sm' ? '14px' : padding === 'lg' ? '24px' : '18px');
</script>

<section class="card" class:accent style="padding: {pad};">
  {#if label}<div class="label">{label}</div>{/if}
  {@render children()}
</section>

<style>
  .card { background: var(--color-surface); border: 1px solid var(--color-border); }
  .card.accent { border-top: 2px solid var(--color-gold); }
  .label { color: var(--color-gold); font-size: 10px; letter-spacing: 0.25em; text-transform: uppercase; margin-bottom: 12px; }
</style>
