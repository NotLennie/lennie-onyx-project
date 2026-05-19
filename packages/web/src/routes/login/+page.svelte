<script lang="ts">
  import type { ActionData } from './$types';

  let { form } = $props<{ form: ActionData }>();
</script>

<svelte:head>
  <title>Login — Onyx Hair Salon</title>
</svelte:head>

<div class="min-h-screen flex flex-col" style="background: var(--color-bg);">

  <!-- Back link -->
  <div class="p-6">
    <a href="/" class="text-xs tracking-[0.15em] uppercase transition-colors hover:text-white" style="color: rgba(255,255,255,0.4);">← Back to site</a>
  </div>

  <!-- Centered: logo + card -->
  <div class="flex-1 flex flex-col items-center justify-center px-4 pb-16">

    <!-- Logo centered above card -->
    <a href="/" class="inline-flex flex-col items-center leading-none mb-8">
      <span class="font-serif text-xl tracking-[0.3em] uppercase" style="color: var(--color-gold);">Onyx</span>
      <span class="text-[9px] tracking-[0.25em] uppercase mt-1" style="color: rgba(255,255,255,0.35);">Hair Salon</span>
    </a>

    <div class="w-full max-w-md" style="background: var(--color-surface); border: 1px solid var(--color-border); border-top: 2px solid var(--color-gold);">
      <div class="p-8">

        <p class="text-xs tracking-[0.3em] uppercase mb-2" style="color: var(--color-gold);">Welcome Back</p>
        <h1 class="font-serif text-2xl font-light tracking-[0.05em] text-white mb-8">SIGN IN</h1>

        {#if form?.error}
          <p class="text-sm mb-6" role="alert" style="color: #f87171;">{form.error}</p>
        {/if}

        <form method="POST" class="space-y-6">
          <div>
            <label for="email" class="block text-xs tracking-[0.15em] uppercase mb-2" style="color: rgba(255,255,255,0.5);">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              autocomplete="email"
              placeholder="you@example.com"
              class="w-full px-4 py-3 text-sm text-white"
              style="background: #111; border: 1px solid var(--color-border);"
            />
          </div>

          <div>
            <label for="password" class="block text-xs tracking-[0.15em] uppercase mb-2" style="color: rgba(255,255,255,0.5);">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              autocomplete="current-password"
              placeholder="••••••••"
              class="w-full px-4 py-3 text-sm text-white"
              style="background: #111; border: 1px solid var(--color-border);"
            />
          </div>

          <button
            type="submit"
            class="w-full py-3 text-xs tracking-[0.25em] uppercase font-semibold transition-opacity duration-200 hover:opacity-85"
            style="background: var(--color-gold); color: #000;"
          >
            Sign In
          </button>
        </form>

        <p class="mt-8 text-xs text-center" style="color: rgba(255,255,255,0.35);">
          Don't have an account?
          <a href="/signup" class="hover:underline" style="color: var(--color-gold);">Sign up</a>
        </p>

      </div>
    </div>
  </div>

</div>

<style>
  input:focus {
    outline: 1px solid var(--color-gold);
  }
</style>
