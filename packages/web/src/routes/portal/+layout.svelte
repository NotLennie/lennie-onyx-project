<script lang="ts">
  import type { Snippet } from 'svelte';
  import type { LayoutData } from './$types';

  let { children, data } = $props<{ children: Snippet; data: LayoutData }>();

  const navLinks = [
    { href: '/portal/dashboard', label: 'Dashboard' },
    { href: '/portal/book', label: 'Book Appointment' },
    { href: '/portal/appointments', label: 'My Appointments' },
    { href: '/portal/profile', label: 'Profile' },
  ];
</script>

<div class="min-h-screen flex" style="background-color: var(--color-bg)">
  <aside class="w-64 flex-shrink-0 flex flex-col" style="background-color: var(--color-surface); border-right: 1px solid var(--color-border)">
    <div class="p-6" style="border-bottom: 1px solid var(--color-border)">
      <a href="/" class="text-xl font-bold" style="color: var(--color-gold)">Onyx</a>
      <p class="text-sm text-gray-400 mt-1 truncate">{data.user.name}</p>
    </div>

    <nav class="flex-1 p-4 space-y-1">
      {#each navLinks as link}
        <a
          href={link.href}
          class="block px-4 py-2.5 rounded-lg text-sm font-medium transition-colors hover:text-white"
          style="color: #9ca3af"
          onmouseenter={(e) => (e.currentTarget as HTMLElement).style.backgroundColor = 'rgba(201,168,76,0.1)'}
          onmouseleave={(e) => (e.currentTarget as HTMLElement).style.backgroundColor = ''}
        >
          {link.label}
        </a>
      {/each}
    </nav>

    <div class="p-4" style="border-top: 1px solid var(--color-border)">
      <form method="POST" action="/api/auth/logout">
        <button
          type="submit"
          class="w-full px-4 py-2.5 rounded-lg text-sm font-medium text-left transition-colors text-gray-400 hover:text-white"
          onclick={async (e) => {
            e.preventDefault();
            await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
            window.location.href = '/login';
          }}
        >
          Sign Out
        </button>
      </form>
    </div>
  </aside>

  <main class="flex-1 overflow-auto p-8">
    {@render children()}
  </main>
</div>
