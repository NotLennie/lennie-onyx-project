<script lang="ts">
  import type { Snippet } from 'svelte';
  let { eyebrow, title, user, actions }: {
    eyebrow: string;
    title: string;
    user: { name: string; profilePictureUrl?: string | null };
    actions?: Snippet;
  } = $props();
  const firstName = $derived(user.name.split(' ')[0] ?? '');
  const initial = $derived((user.name?.charAt(0) ?? '?').toUpperCase());
</script>

<header class="page-header">
  <div>
    <div class="eyebrow">{eyebrow}</div>
    <div class="title">{title}</div>
  </div>
  <div class="right">
    {#if actions}{@render actions()}{/if}
    <div class="chip">
      <div class="av">
        {#if user.profilePictureUrl}
          <img src={user.profilePictureUrl} alt="{user.name}" />
        {:else}
          {initial}
        {/if}
      </div>
      <span class="name">{firstName}</span>
    </div>
  </div>
</header>

<style>
  .page-header { display: flex; justify-content: space-between; align-items: flex-start; gap: 16px; }
  .eyebrow { color: rgba(255,255,255,0.4); font-size: 11px; letter-spacing: 0.25em; text-transform: uppercase; margin-bottom: 4px; }
  .title { color: white; font-family: Georgia, serif; font-size: 28px; font-weight: 300; letter-spacing: 0.05em; }
  .right { display: flex; align-items: center; gap: 12px; flex-shrink: 0; }
  .chip { display: flex; align-items: center; gap: 8px; background: var(--color-surface); border: 1px solid var(--color-border); padding: 6px 10px; }
  .av { width: 24px; height: 24px; background: rgba(201,168,76,0.15); border: 1px solid rgba(201,168,76,0.3); display: flex; align-items: center; justify-content: center; color: var(--color-gold); font-size: 11px; font-weight: 600; overflow: hidden; }
  .av img { width: 100%; height: 100%; object-fit: cover; }
  .name { color: rgba(255,255,255,0.7); font-size: 12px; }
</style>
