<script lang="ts">
  import type { Snippet } from 'svelte';
  let { children, bgImage }: { children: Snippet; bgImage?: string } = $props();
</script>

<div class="page-shell">
  {#if bgImage}
    <div class="bg" style="background-image: url('{bgImage}');"></div>
  {/if}
  <div class="content">{@render children()}</div>
</div>

<style>
  .page-shell { position: relative; min-height: 100%; padding: 32px; display: flex; flex-direction: column; gap: 20px; }
  .bg { position: absolute; inset: 0; background-size: cover; background-position: center; opacity: 0.08; pointer-events: none; z-index: 0; }
  .content { position: relative; z-index: 1; display: flex; flex-direction: column; gap: 20px; flex: 1; }
</style>
