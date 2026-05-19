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

  const firstName = $derived(data.user.name.split(' ')[0]);
</script>

<div style="min-height:100vh;display:flex;background:var(--color-bg);">
  <!-- Sidebar -->
  <aside style="width:190px;flex-shrink:0;display:flex;flex-direction:column;background:var(--color-surface);border-right:1px solid var(--color-border);">
    <!-- Header -->
    <div style="padding:20px 16px 14px;border-bottom:1px solid var(--color-border);">
      <div style="color:var(--color-gold);font-size:14px;letter-spacing:0.3em;font-weight:600;font-family:serif;">ONYX</div>
      <div style="color:rgba(255,255,255,0.3);font-size:8px;letter-spacing:0.2em;text-transform:uppercase;margin-top:2px;">Hair Salon</div>
      <!-- Avatar + first name -->
      <div style="display:flex;align-items:center;gap:8px;margin-top:12px;">
        <div style="width:28px;height:28px;flex-shrink:0;overflow:hidden;display:flex;align-items:center;justify-content:center;background:rgba(201,168,76,0.15);border:1px solid rgba(201,168,76,0.3);">
          {#if data.user.profilePictureUrl}
            <img src={data.user.profilePictureUrl} alt="User avatar" style="width:100%;height:100%;object-fit:cover;" />
          {:else}
            <img src="/icons/expert_stylist.png" alt="Default avatar" style="width:18px;height:18px;opacity:0.85;" />
          {/if}
        </div>
        <span style="color:rgba(255,255,255,0.6);font-size:10px;">{firstName}</span>
      </div>
    </div>

    <!-- Nav -->
    <nav class="portal-nav" style="padding:10px 8px;flex:1;">
      {#each navLinks as link}
        {@const active = $page.url.pathname === link.href || $page.url.pathname.startsWith(link.href + '/')}
        <a
          href={link.href}
          style="display:block;padding:8px 10px;font-size:10px;letter-spacing:0.08em;margin-bottom:2px;text-decoration:none;
            {active
              ? 'color:var(--color-gold);border-left:2px solid var(--color-gold);background:rgba(201,168,76,0.08);'
              : 'color:rgba(255,255,255,0.35);border-left:2px solid transparent;'}"
        >
          {link.label}
        </a>
      {/each}
    </nav>

    <!-- Sign out -->
    <div style="padding:10px 12px;border-top:1px solid var(--color-border);">
      <form method="POST" action="/logout">
        <button type="submit" style="background:none;border:none;padding:0;color:rgba(255,255,255,0.25);font-size:10px;cursor:pointer;text-align:left;">
          Sign Out
        </button>
      </form>
    </div>
  </aside>

  <!-- Page content -->
  <main style="flex:1;overflow:auto;padding:32px;">
    {@render children()}
  </main>
</div>
