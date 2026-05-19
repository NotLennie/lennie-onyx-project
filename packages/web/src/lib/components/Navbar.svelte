<script lang="ts">
  import { page } from '$app/stores';

  const links = [
    { href: '/', label: 'Home' },
    { href: '/#about', label: 'About' },
    { href: '/#services', label: 'Services' },
    { href: '/#contact', label: 'Contact Us' },
  ];
</script>

<nav
  class="fixed top-0 inset-x-0 z-50 flex items-center justify-between px-8 py-4"
  style="background: var(--color-bg); border-bottom: 1px solid var(--color-border);"
>
  <!-- Logo -->
  <a href="/" class="flex flex-col leading-none">
    <span class="font-serif text-xl tracking-[0.3em] uppercase" style="color: var(--color-gold);">Onyx</span>
    <span class="text-[9px] tracking-[0.25em] uppercase" style="color: rgba(255,255,255,0.35);">Hair Salon</span>
  </a>

  <!-- Nav links -->
  <div class="hidden md:flex items-center gap-10">
    {#each links as { href, label }}
      <a
        {href}
        class="text-xs tracking-[0.2em] uppercase transition-colors duration-200"
        style:color={$page.url.pathname === href ? 'var(--color-gold)' : 'rgba(255,255,255,0.6)'}
      >
        {label}
      </a>
    {/each}
  </div>

  <!-- Right actions -->
  <div class="flex items-center gap-3">
    <a
      href="/login"
      class="text-xs tracking-[0.2em] uppercase px-5 py-2.5 border transition-all duration-200 hover:bg-[#C9A84C] hover:text-black"
      style="border-color: var(--color-gold); color: var(--color-gold);"
    >
      Login
    </a>
    <a
      href="/signup"
      class="hidden sm:inline-block text-xs tracking-[0.2em] uppercase px-5 py-2.5 transition-all duration-200 hover:opacity-90"
      style="background: var(--color-gold); color: #000;"
    >
      Book an Appointment
    </a>
  </div>
</nav>
