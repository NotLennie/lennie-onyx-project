<script lang="ts">
  import type { Snippet } from 'svelte';
  import type { LayoutData } from './$types';
  import { page } from '$app/stores';

  let { children, data } = $props<{ children: Snippet; data: LayoutData }>();

  const navLinks = [
    { href: '/portal/dashboard', label: 'Dashboard' },
    { href: '/portal/appointments', label: 'My Appointments' },
    { href: '/portal/profile', label: 'Profile' },
  ];
</script>

<div style="min-height:100vh;display:flex;background:var(--color-bg);">
  <aside style="width:220px;flex-shrink:0;display:flex;flex-direction:column;background:var(--color-surface);border-right:1px solid var(--color-border);">
    <div style="padding:24px 20px 18px;border-bottom:1px solid var(--color-border);">
      <div style="color:var(--color-gold);font-size:18px;letter-spacing:0.3em;font-weight:600;font-family:Georgia,serif;">ONYX</div>
      <div style="color:rgba(255,255,255,0.3);font-size:10px;letter-spacing:0.2em;text-transform:uppercase;margin-top:2px;">Hair Salon</div>
    </div>

    <nav class="portal-nav" style="padding:14px 10px;flex:1;">
      {#each navLinks as link}
        {@const active = $page.url.pathname === link.href || $page.url.pathname.startsWith(link.href + '/')}
        <a
          href={link.href}
          style="display:block;padding:10px 14px;font-size:13px;letter-spacing:0.06em;margin-bottom:2px;text-decoration:none;
            {active
              ? 'color:var(--color-gold);border-left:2px solid var(--color-gold);background:rgba(201,168,76,0.08);'
              : 'color:rgba(255,255,255,0.45);border-left:2px solid transparent;'}"
        >
          {link.label}
        </a>
      {/each}
    </nav>

    <div style="padding:14px 16px;border-top:1px solid var(--color-border);">
      <form method="POST" action="/logout">
        <button type="submit" style="background:none;border:none;padding:0;color:rgba(255,255,255,0.3);font-size:13px;cursor:pointer;text-align:left;">
          Sign Out
        </button>
      </form>
    </div>
  </aside>

  <main style="flex:1;overflow:auto;">
    {@render children()}
  </main>
</div>
