<script lang="ts">
  import type { Snippet } from 'svelte';
  import type { LayoutData } from './$types';

  let { children, data } = $props<{ children: Snippet; data: LayoutData }>();

  const isAdmin = data.user.role === 'admin';

  const navLinks = [
    { href: '/employee/dashboard', label: 'Dashboard' },
    { href: '/employee/appointments', label: 'Appointments' },
    { href: '/employee/pto', label: 'My PTO' },
    { href: '/employee/profile', label: 'Profile' },
    ...(isAdmin ? [
      { href: '/employee/clients', label: 'Clients' },
      { href: '/employee/services', label: 'Services' },
      { href: '/employee/employees', label: 'Employees' },
    ] : []),
  ];
</script>

<div class="min-h-screen flex" style="background-color: var(--color-bg)">
  <aside class="w-64 flex-shrink-0 flex flex-col" style="background-color: var(--color-surface); border-right: 1px solid var(--color-border)">
    <div class="p-6" style="border-bottom: 1px solid var(--color-border)">
      <a href="/" class="text-xl font-bold" style="color: var(--color-gold)">Onyx</a>
      <p class="text-sm text-gray-400 mt-0.5 truncate">{data.user.name}</p>
      {#if isAdmin}
        <span class="text-xs px-1.5 py-0.5 rounded font-medium mt-1 inline-block" style="background-color: rgba(201,168,76,0.2); color: var(--color-gold)">Admin</span>
      {/if}
    </div>

    <nav class="flex-1 p-4 space-y-1">
      {#each navLinks as link}
        <a
          href={link.href}
          class="block px-4 py-2.5 rounded-lg text-sm font-medium transition-colors"
          style="color: #9ca3af"
          onmouseenter={(e) => (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(201,168,76,0.1)'}
          onmouseleave={(e) => (e.currentTarget as HTMLElement).style.backgroundColor = ''}
        >
          {link.label}
        </a>
      {/each}
    </nav>

    <div class="p-4" style="border-top: 1px solid var(--color-border)">
      <button
        type="button"
        class="w-full px-4 py-2.5 rounded-lg text-sm font-medium text-left transition-colors text-gray-400 hover:text-white"
        onclick={async () => {
          await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
          window.location.href = '/login';
        }}
      >
        Sign Out
      </button>
    </div>
  </aside>

  <main class="flex-1 overflow-auto p-8">
    {@render children()}
  </main>
</div>
