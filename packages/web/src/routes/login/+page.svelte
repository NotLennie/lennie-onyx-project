<script lang="ts">
  import type { ActionData } from './$types';
  let { form } = $props<{ form: ActionData }>();
</script>

<svelte:head><title>Login — Luxe Hair Salon</title></svelte:head>

<div class="min-h-screen flex items-center justify-center" style="background: var(--color-bg)">
  <div class="w-full max-w-md p-8 rounded-lg" style="background: var(--color-surface); border: 1px solid var(--color-border)">
    <h1 class="text-2xl font-serif font-bold text-white mb-2">Welcome Back</h1>
    <p class="text-sm mb-6" style="color: var(--color-gold)">Luxe Hair Salon</p>

    {#if form?.error}
      <p class="mb-4 text-red-400 text-sm">{form.error}</p>
    {/if}

    <form method="POST" class="space-y-4">
      <div>
        <label for="email" class="block text-sm text-gray-300 mb-1">Email</label>
        <input
          id="email" name="email" type="email" required
          class="w-full px-4 py-2 rounded bg-black border text-white placeholder-gray-500 focus:outline-none focus:border-yellow-600"
          style="border-color: var(--color-border)"
          placeholder="you@example.com"
        />
      </div>
      <div>
        <label for="password" class="block text-sm text-gray-300 mb-1">Password</label>
        <input
          id="password" name="password" type="password" required
          class="w-full px-4 py-2 rounded bg-black border text-white placeholder-gray-500 focus:outline-none focus:border-yellow-600"
          style="border-color: var(--color-border)"
          placeholder="••••••••"
        />
      </div>
      <button
        type="submit"
        class="w-full py-2 px-4 font-semibold rounded text-black transition hover:opacity-90"
        style="background: var(--color-gold)"
      >
        Sign In
      </button>
    </form>

    <p class="mt-4 text-sm text-gray-400">
      Don't have an account?
      <a href="/signup" style="color: var(--color-gold)" class="hover:underline">Sign up</a>
    </p>
  </div>
</div>
